
'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { CheckCircle, QrCode, XCircle, LoaderCircle, Camera, Keyboard } from 'lucide-react';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { Course } from '@/lib/types';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';
import { cn } from '@/lib/utils';

const qrcodeRegionId = "reader";

// --- Camera Scanner Component ---
const CameraScanner = ({ onScan, disabled, isVisible }: { onScan: (decodedText: string) => void, disabled: boolean, isVisible: boolean }) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const onScanRef = useRef(onScan);
  onScanRef.current = onScan;
  
  useEffect(() => {
    if (!isVisible) {
      return;
    }
    
    // Safety check for the element
    const readerElement = document.getElementById(qrcodeRegionId);
    if (!readerElement) {
        console.error("QR Code reader element not found");
        return;
    }

    const scanner = new Html5Qrcode(qrcodeRegionId);
    scannerRef.current = scanner;

    const startScanner = async () => {
      try {
        const cameras = await Html5Qrcode.getCameras();
        if (cameras && cameras.length) {
          setHasCameraPermission(true);
          await scanner.start(
            { facingMode: "environment" },
            {
              fps: 30,
              qrbox: { width: 250, height: 250 },
              aspectRatio: 1.0,
              rememberLastUsedCamera: false,
            },
            (decodedText) => {
              if (!disabled) {
                onScanRef.current(decodedText);
              }
            },
            (errorMessage) => { /* ignore */ }
          );
        } else {
          setHasCameraPermission(false);
        }
      } catch (err) {
        console.error("Error starting scanner:", err);
        setHasCameraPermission(false);
      }
    };

    startScanner();

    return () => {
      const stopScanner = async () => {
        try {
          if (scanner && scanner.isScanning) {
            await scanner.stop();
          }
        } catch (err) {
          console.error("Failed to stop scanner gracefully:", err);
        }
      };
      stopScanner();
    };
  }, [disabled, isVisible]);

  if (hasCameraPermission === false) {
    return (
       <Alert variant="destructive" className="mt-4">
          <Camera className="h-4 w-4" />
          <AlertTitle>Acceso a la cámara denegado</AlertTitle>
          <AlertDescription>
            Por favor, habilita los permisos de la cámara en tu navegador para usar esta función.
          </AlertDescription>
        </Alert>
    )
  }

  return <div id={qrcodeRegionId} className="w-full aspect-video bg-foreground rounded-lg overflow-hidden" />;
};


// --- Scan Result Display Component ---
const ScanResultDisplay = ({
  isProcessing,
  scanResult,
  scannedCode,
}: {
  isProcessing: boolean;
  scanResult: { message: string; status: 'success' | 'error' } | null;
  scannedCode: string | null;
}) => {
  const getMessage = () => {
    if (isProcessing) return `Procesando: ${scannedCode}...`;
    if (scanResult) return `${scanResult.message} (${scannedCode})`;
    return 'Esperando escaneo...';
  }

  const getIcon = () => {
    if (isProcessing) return <LoaderCircle className="h-16 w-16 text-blue-400 animate-spin mx-auto" />;
    if (scanResult?.status === 'success') return <CheckCircle className="h-16 w-16 text-green-400 mx-auto" />;
    if (scanResult?.status === 'error') return <XCircle className="h-16 w-16 text-red-400 mx-auto" />;
    return <QrCode className="h-16 w-16 text-muted-foreground mx-auto" />;
  }
  
  return (
     <div className="z-10 text-center p-4 rounded-lg bg-background/80 backdrop-blur-sm">
        {getIcon()}
        <p className="text-lg font-semibold mt-4">
            {getMessage()}
        </p>
    </div>
  )
};


// --- Main Scan Page Component ---
export default function ScanPage() {
  const [scanResult, setScanResult] = useState<{ message: string; status: 'success' | 'error' } | null>(null);
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('camera');
  
  const inputRef = useRef<HTMLInputElement>(null);

  // --- Keyboard Scanner Input Focus ---
  useEffect(() => {
    if (activeTab === 'keyboard') {
      const focusInput = () => inputRef.current?.focus();
      focusInput();
      document.addEventListener('click', focusInput);
      return () => document.removeEventListener('click', focusInput);
    }
  }, [activeTab]);

  // --- Core Scan Handling Logic ---
  const processScan = useCallback(async (code: string) => {
    if (isProcessing) return; // Prevent multiple submissions

    setIsProcessing(true);
    setScannedCode(code);
    setScanResult(null);

    try {
      const response = await fetch('/api/attendance/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: code }),
      });

      const result = await response.json();
      setScanResult({
        message: result.message || (response.ok ? 'Éxito' : 'Error desconocido'),
        status: response.ok ? 'success' : 'error',
      });
    } catch (error) {
      setScanResult({ message: 'No se pudo conectar con el servidor.', status: 'error' });
    } finally {
      setIsProcessing(false);
      setTimeout(() => {
        setScanResult(null);
        setScannedCode(null);
      }, 3000); // Clear result after 3 seconds
    }
  }, [isProcessing]);


  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      const code = event.currentTarget.value;
      if (code) {
        processScan(code);
        event.currentTarget.value = '';
      }
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Escanear Asistencia</h1>
          <p className="text-muted-foreground mt-1">Usa la cámara o un escáner externo para registrar la asistencia.</p>
        </div>
      </div>
      <Card className="w-full shadow-subtle">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><QrCode />Escáner de Asistencia</CardTitle>
          <CardDescription>Selecciona el modo de escaneo. El sistema registrará la asistencia en el curso correspondiente.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-2xl">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="camera"><Camera className="mr-2" />Cámara</TabsTrigger>
              <TabsTrigger value="keyboard"><Keyboard className="mr-2" />Escáner Externo</TabsTrigger>
            </TabsList>
            <TabsContent value="camera" className={cn(activeTab !== 'camera' && 'hidden')}>
              <div className="aspect-video bg-foreground rounded-lg overflow-hidden relative flex items-center justify-center mt-4">
                 <CameraScanner onScan={processScan} disabled={isProcessing} isVisible={activeTab === 'camera'} />
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <ScanResultDisplay isProcessing={isProcessing} scanResult={scanResult} scannedCode={scannedCode} />
                 </div>
              </div>
            </TabsContent>
            <TabsContent value="keyboard" className={cn(activeTab !== 'keyboard' && 'hidden')}>
               <Input
                  ref={inputRef}
                  type="text"
                  className="sr-only"
                  onKeyDown={handleKeyPress}
                  autoFocus
                  disabled={isProcessing}
                />
              <div className="aspect-video bg-foreground rounded-lg overflow-hidden relative flex items-center justify-center mt-4">
                <div className="absolute top-1/2 left-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-lg border-4 border-dashed border-gray-400 pointer-events-none"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <ScanResultDisplay isProcessing={isProcessing} scanResult={scanResult} scannedCode={scannedCode} />
                 </div>
              </div>
               <div className="mt-4 text-center text-sm text-muted-foreground">
                El sistema está listo para recibir datos del escáner externo.
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </>
  );
}
