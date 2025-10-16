
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
import { CheckCircle, QrCode, XCircle, LoaderCircle } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Course } from '@/lib/types';

export default function ScanPage() {
  const [scanResult, setScanResult] = useState<{
    message: string;
    status: 'success' | 'error';
  } | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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
            description: 'No se pudieron cargar los cursos.'
        })
      }
    }
    fetchCourses();
  }, [toast]);


  useEffect(() => {
    // Keep the input focused to capture scanner input
    const focusInput = () => inputRef.current?.focus();
    focusInput();
    document.addEventListener('click', focusInput);

    return () => {
      document.removeEventListener('click', focusInput);
    };
  }, []);

  const handleScan = async (studentId: string) => {
    if (!selectedCourse) {
        toast({
            variant: 'destructive',
            title: 'Curso no seleccionado',
            description: 'Por favor, selecciona un curso antes de escanear.'
        });
        return;
    }
    
    setIsLoading(true);
    setScanResult(null);

    try {
        const response = await fetch('/api/attendance/scan', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ studentId, courseId: selectedCourse }),
        });

        const result = await response.json();

        if (response.ok) {
            setScanResult({ message: result.message, status: 'success' });
        } else {
            setScanResult({ message: result.message || 'Error desconocido', status: 'error' });
        }

    } catch (error) {
        setScanResult({ message: 'No se pudo conectar con el servidor.', status: 'error' });
    } finally {
        setIsLoading(false);
        // Clear the scan status after a few seconds
        setTimeout(() => setScanResult(null), 4000);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      const code = event.currentTarget.value;
      if (code) {
        handleScan(code);
        event.currentTarget.value = ''; // Clear input after scan
      }
    }
  };


  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">
            Escanear Asistencia
          </h1>
          <p className="text-muted-foreground mt-1">
            Usa un escáner de códigos de barras para registrar la asistencia.
          </p>
        </div>
      </div>
      <Card className="w-full shadow-subtle">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode />
              Escáner de Asistencia
            </CardTitle>
            <CardDescription>
              Selecciona un curso y comienza a escanear las credenciales de los estudiantes.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6">
             <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                    <SelectTrigger className="w-full max-w-sm">
                        <SelectValue placeholder="Seleccionar un curso" />
                    </SelectTrigger>
                    <SelectContent>
                        {Array.isArray(courses) && courses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                            {course.name}
                        </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            
            <Input
              ref={inputRef}
              type="text"
              className="sr-only" // This makes the input invisible but still focusable
              onKeyDown={handleKeyPress}
              autoFocus
            />
            <div className="w-full max-w-2xl">
              <div className="aspect-video bg-foreground rounded-lg overflow-hidden relative flex items-center justify-center">
                <div className="absolute top-0 left-0 w-full h-full bg-grid-slate-800/[0.2] [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0))]"></div>
                <div className="absolute top-1/2 left-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-lg border-4 border-dashed border-gray-400"></div>
                <div
                  className="absolute h-1 w-full bg-green-400/50 shadow-[0_0_10px_2px_#34D399]"
                  style={{
                    animation: 'scan-line 3s linear infinite',
                  }}
                ></div>
                <div className="z-10 text-center p-4">
                  {isLoading && (
                      <>
                          <LoaderCircle className="h-24 w-24 text-blue-400 animate-spin mx-auto" />
                          <p className="text-lg font-semibold text-white mt-4">
                              Procesando...
                          </p>
                      </>
                  )}
                  {scanResult?.status === 'success' && !isLoading && (
                    <>
                      <CheckCircle className="h-24 w-24 text-green-400 animate-pulse mx-auto" />
                      <p className="text-lg font-semibold text-white mt-4">
                        {scanResult.message}
                      </p>
                    </>
                  )}

                  {scanResult?.status === 'error' && !isLoading && (
                    <>
                      <XCircle className="h-24 w-24 text-red-400 animate-pulse mx-auto" />
                      <p className="text-lg font-semibold text-white mt-4">
                        {scanResult.message}
                      </p>
                    </>
                  )}

                  {!isLoading && !scanResult && (
                      <div className='text-white text-lg font-semibold'>
                          Esperando escaneo...
                      </div>
                  )}
                </div>
              </div>
              <div className="mt-4 text-center text-sm text-muted-foreground">
                El sistema está listo para recibir datos del escáner.
              </div>
            </div>
          </CardContent>
        </Card>
      <style jsx>{`
        @keyframes scan-line {
          0% {
            top: 0;
          }
          50% {
            top: 100%;
          }
          100% {
            top: 0;
          }
        }
      `}</style>
    </>
  );
}
