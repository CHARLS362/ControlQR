
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { Course } from '@/lib/types';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';

const qrcodeRegionId = "reader";

// --- Camera Scanner Component ---
const CameraScanner = ({ onScan, disabled }: { onScan: (decodedText: string) => void, disabled: boolean }) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

  useEffect(() => {
    if (!scannerRef.current) {
      scannerRef.current = new Html5Qrcode(qrcodeRegionId);
    }
    const scanner = scannerRef.current;

    const startScanner = async () => {
      try {
        const cameras = await Html5Qrcode.getCameras();
        if (cameras && cameras.length) {
          setHasCameraPermission(true);
          if (scanner.getState() !== Html5QrcodeScannerState.SCANNING) {
            await scanner.start(
              { facingMode: "environment" },
              {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0,
              },
              onScan,
              (errorMessage) => { /* ignore */ }
            );
          }
        } else {
            setHasCameraPermission(false);
        }
      } catch (err) {
        console.error("Camera permission error:", err);
        setHasCameraPermission(false);
      }
    };
    
    startScanner();

    return () => {
      if (scanner && scanner.isScanning) {
        scanner.stop().catch(err => console.error("Failed to stop scanner", err));
      }
    };
  }, [onScan]);

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

  return (
    <div id={qrcodeRegionId} className="w-full aspect-video bg-foreground rounded-lg overflow-hidden" />
  );
};


// --- Scan Result Display Component ---
const ScanResultDisplay = ({
  isLoading,
  scanResult,
  scannedCode,
}: {
  isLoading: boolean;
  scanResult: { message: string; status: 'success' | 'error' } | null;
  scannedCode: string | null;
}) => {
  const getMessage = () => {
    if (isLoading) return `Procesando: ${scannedCode}...`;
    if (scanResult) return `${scanResult.message} (${scannedCode})`;
    return 'Esperando escaneo...';
  }

  const getIcon = () => {
    if (isLoading) return <LoaderCircle className="h-16 w-16 text-blue-400 animate-spin mx-auto" />;
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
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('camera');
  
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // --- Data Fetching ---
  useEffect(() => {
    async function fetchCourses() {
      try {
        const response = await fetch('/api/courses');
        const data = await response.json();
        if (Array.isArray(data)) {
          setCourses(data);
          if (data.length > 0) {
            setSelectedCourse(data[0].id);
          }
        } else {
          setCourses([]);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'No se pudieron cargar los cursos.',
        });
      }
    }
    fetchCourses();
  }, [toast]);

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
  const handleScan = useCallback(async (code: string) => {
    if (isLoading) return; // Prevent multiple submissions

    if (!selectedCourse) {
      toast({
        variant: 'destructive',
        title: 'Curso no seleccionado',
        description: 'Por favor, selecciona un curso antes de escanear.',
      });
      return;
    }

    setIsLoading(true);
    setScannedCode(code);
    setScanResult(null);

    try {
      const response = await fetch('/api/attendance/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: code, courseId: selectedCourse }),
      });

      const result = await response.json();
      setScanResult({
        message: result.message || (response.ok ? 'Éxito' : 'Error desconocido'),
        status: response.ok ? 'success' : 'error',
      });
    } catch (error) {
      setScanResult({ message: 'No se pudo conectar con el servidor.', status: 'error' });
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        setScanResult(null);
        setScannedCode(null);
      }, 3000); // Clear result after 3 seconds
    }
  }, [selectedCourse, isLoading, toast]);


  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      const code = event.currentTarget.value;
      if (code) {
        handleScan(code);
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
          <CardDescription>Selecciona un curso y el modo de escaneo.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger className="w-full max-w-sm">
              <SelectValue placeholder="Seleccionar un curso" />
            </SelectTrigger>
            <SelectContent>
              {Array.isArray(courses) && courses.map((course) => (
                <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-2xl">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="camera"><Camera className="mr-2" />Cámara</TabsTrigger>
              <TabsTrigger value="keyboard"><Keyboard className="mr-2" />Escáner Externo</TabsTrigger>
            </TabsList>
            <TabsContent value="camera">
              <div className="aspect-video bg-foreground rounded-lg overflow-hidden relative flex items-center justify-center mt-4">
                 <CameraScanner onScan={handleScan} disabled={isLoading} />
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <ScanResultDisplay isLoading={isLoading} scanResult={scanResult} scannedCode={scannedCode} />
                 </div>
              </div>
            </TabsContent>
            <TabsContent value="keyboard">
               <Input
                  ref={inputRef}
                  type="text"
                  className="sr-only"
                  onKeyDown={handleKeyPress}
                  autoFocus
                  disabled={isLoading}
                />
              <div className="aspect-video bg-foreground rounded-lg overflow-hidden relative flex items-center justify-center mt-4">
                <div className="absolute top-1/2 left-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-lg border-4 border-dashed border-gray-400 pointer-events-none"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <ScanResultDisplay isLoading={isLoading} scanResult={scanResult} scannedCode={scannedCode} />
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
