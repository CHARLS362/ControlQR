'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CameraOff, CheckCircle, LoaderCircle, QrCode, XCircle, AlertTriangle, List } from 'lucide-react';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { BrowserMultiFormatReader, BarcodeFormat } from '@zxing/browser';

type Status = 'searching' | 'success' | 'error' | 'permission' | 'stopped' | 'info';
type LogEntry = {
  value: string;
  message: string;
  status: 'success' | 'error';
  timestamp: string;
};

const SCAN_INTERVAL = 5000;
const LOG_LIMIT = 5;

export function Scanner() {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const controlsRef = useRef<any>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [status, setStatus] = useState<Status>('stopped');
  const [statusMessage, setStatusMessage] = useState('La cámara está desactivada.');
  const [lastScannedCode, setLastScannedCode] = useState<{ value: string; time: number } | null>(null);
  const [log, setLog] = useState<LogEntry[]>([]);

  const addToLog = useCallback((newLogEntry: LogEntry) => {
    setLog(prevLog => [newLogEntry, ...prevLog].slice(0, LOG_LIMIT));
  }, []);

  const registrarAsistencia = useCallback(async (codigo: string) => {
    const now = Date.now();
    if (lastScannedCode && lastScannedCode.value === codigo && (now - lastScannedCode.time) < SCAN_INTERVAL) {
      return;
    }

    setLastScannedCode({ value: codigo, time: now });
    setStatus('searching');
    setStatusMessage(`Procesando código: ${codigo}`);

    try {
      const response = await fetch('/api/attendance/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: codigo }),
      });

      const result = await response.json();

      if (response.ok) {
        setStatus('success');
        setStatusMessage(result.message);
        addToLog({ value: codigo, message: result.message, status: 'success', timestamp: new Date().toLocaleTimeString() });
      } else {
        setStatus('error');
        setStatusMessage(result.message || 'Error desconocido del servidor.');
        addToLog({ value: codigo, message: result.message, status: 'error', timestamp: new Date().toLocaleTimeString() });
      }
    } catch (error) {
      setStatus('error');
      const errorMsg = 'Error de conexión. No se pudo registrar la asistencia.';
      setStatusMessage(errorMsg);
      addToLog({ value: codigo, message: errorMsg, status: 'error', timestamp: new Date().toLocaleTimeString() });
      toast({
        variant: 'destructive',
        title: 'Error de Red',
        description: errorMsg,
      });
    }

    setTimeout(() => {
        if (isCameraActive) {
          setStatus('searching');
          setStatusMessage('Apunte el código QR o de barras dentro del recuadro.');
        }
      }, 2000);
  }, [lastScannedCode, toast, addToLog, isCameraActive]);

  const stopCamera = useCallback(() => {
    if (controlsRef.current) {
      controlsRef.current.stop();
      controlsRef.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setStatus('stopped');
    setStatusMessage('La cámara está desactivada.');
    codeReaderRef.current = null;
  }, []);

  const startCamera = useCallback(async () => {
    if (!videoRef.current) return;
    if (isCameraActive) return;

    try {
      const codeReader = new BrowserMultiFormatReader();
      codeReaderRef.current = codeReader;
      
      const hints = new Map();
      const formats = [
        BarcodeFormat.QR_CODE,
        BarcodeFormat.EAN_13,
        BarcodeFormat.CODE_128,
        BarcodeFormat.CODE_39,
      ];
      hints.set(2, formats); // 2 is the key for POSSIBLE_FORMATS
      
      setStatus('searching');
      setStatusMessage('Iniciando cámara...');
      
      const controls = await codeReader.decodeFromVideoDevice(undefined, videoRef.current, (result, err) => {
        if (result) {
          registrarAsistencia(result.getText());
        }
      });
      controlsRef.current = controls;
      
      setIsCameraActive(true);
      setStatus('searching');
      setStatusMessage('Apunte el código QR o de barras dentro del recuadro.');

    } catch (error) {
      console.error('Error al iniciar la cámara:', error);
      setStatus('permission');
      if (error instanceof Error) {
        setStatusMessage(error.name === 'NotAllowedError' ? 'Permiso de cámara denegado.' : `Error de cámara: ${error.message}`);
      } else {
        setStatusMessage('Ocurrió un error desconocido.');
      }
      setIsCameraActive(false);
    }
  }, [registrarAsistencia, isCameraActive]);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);


  const StatusIcon = () => {
    switch (status) {
      case 'searching': return <LoaderCircle className="h-10 w-10 text-yellow-500 animate-spin" />;
      case 'success': return <CheckCircle className="h-10 w-10 text-green-500" />;
      case 'error': return <XCircle className="h-10 w-10 text-red-500" />;
      case 'permission': return <AlertTriangle className="h-10 w-10 text-red-600" />;
      case 'stopped': return <QrCode className="h-10 w-10 text-muted-foreground" />;
      default: return <QrCode className="h-10 w-10 text-muted-foreground" />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
      <div className="lg:col-span-2">
        <Card className="w-full shadow-subtle">
          <CardHeader>
             <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2"><QrCode />Visor del Escáner</CardTitle>
                <Button onClick={stopCamera} variant="destructive" disabled={!isCameraActive}>
                    <CameraOff className="mr-2" /> Desactivar Cámara
                </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="aspect-video w-full bg-foreground rounded-lg overflow-hidden relative flex items-center justify-center text-white">
              <video ref={videoRef} className="w-full h-full object-cover" />
              {!isCameraActive && status !== 'searching' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50">
                  <CameraOff className="h-16 w-16 text-white/50" />
                  <p className="mt-4 text-lg font-semibold">{statusMessage}</p>
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-3/4 h-3/4 max-w-sm max-h-sm border-4 border-dashed border-white/50 rounded-xl" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-1">
        <Card className="shadow-subtle">
          <CardHeader>
            <CardTitle>Estado del Escaneo</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="flex justify-center mb-4"><StatusIcon /></div>
            <p className="text-lg font-medium min-h-[56px]">{statusMessage}</p>
          </CardContent>
        </Card>

        <Card className="shadow-subtle mt-6">
          <CardHeader>
             <CardTitle className="flex items-center gap-2"><List />Últimos Registros</CardTitle>
          </CardHeader>
          <CardContent>
            {log.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No hay registros recientes.</p>
            ) : (
              <ul className="space-y-3">
                {log.map((entry, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm p-2 rounded-md bg-muted/50">
                     {entry.status === 'success' ? (
                        <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                      )}
                    <div>
                      <p className="font-semibold break-all">{entry.value}</p>
                      <p className="text-muted-foreground text-xs">{entry.message}</p>
                    </div>
                     <span className="ml-auto text-xs text-muted-foreground shrink-0">{entry.timestamp}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
