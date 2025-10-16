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
import { CheckCircle, QrCode, XCircle } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

export default function ScanPage() {
  const [lastScan, setLastScan] = useState<{
    data: string;
    status: 'success' | 'error';
  } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Keep the input focused to capture scanner input
    inputRef.current?.focus();
    document.addEventListener('click', () => inputRef.current?.focus());

    return () => {
      document.removeEventListener('click', () => inputRef.current?.focus());
    };
  }, []);

  const handleScan = (code: string) => {
    // Here you would typically validate the student ID
    // For now, we'll simulate a success/error state
    const isAlreadyRegistered = Math.random() > 0.5;

    if (isAlreadyRegistered) {
      setLastScan({ data: 'Ya Registrado', status: 'error' });
    } else {
      setLastScan({ data: `Éxito: ${code}`, status: 'success' });
    }

    // Clear the scan status after a few seconds
    setTimeout(() => setLastScan(null), 3000);
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

  const simulateScan = (status: 'success' | 'error') => {
    if (status === 'success') {
      handleScan('STU-SIM-001');
    } else {
      setLastScan({ data: 'Ya Registrado', status: 'error' });
      setTimeout(() => setLastScan(null), 3000);
    }
  };


  return (
    <>
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          Escanear Asistencia
        </h1>
        <p className="text-muted-foreground mt-1">
          Usa la cámara para escanear los códigos QR de los estudiantes o un escáner de códigos de barras.
        </p>
      </div>
      <div className="flex justify-center">
        <Card className="w-full max-w-2xl shadow-subtle">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode />
              Escáner de Código QR
            </CardTitle>
            <CardDescription>
              Coloca el código QR del estudiante dentro del marco o escanea con el dispositivo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              ref={inputRef}
              type="text"
              className="sr-only" // This makes the input invisible but still focusable
              onKeyDown={handleKeyPress}
              autoFocus
            />
            <div className="aspect-video bg-foreground rounded-lg overflow-hidden relative flex items-center justify-center">
              <div className="absolute top-0 left-0 w-full h-full bg-grid-slate-800/[0.2] [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0))]"></div>
              <div className="absolute top-1/2 left-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-lg border-4 border-dashed border-gray-400"></div>
              <div
                className="absolute h-1 w-full bg-green-400/50 shadow-[0_0_10px_2px_#34D399]"
                style={{
                  animation: 'scan-line 3s linear infinite',
                }}
              ></div>
              <div className="z-10 text-center">
                {lastScan?.status === 'success' && (
                  <>
                    <CheckCircle className="h-24 w-24 text-green-400 animate-pulse mx-auto" />
                    <p className="text-lg font-semibold text-white mt-4">
                      {lastScan.data}
                    </p>
                  </>
                )}

                {lastScan?.status === 'error' && (
                  <>
                    <XCircle className="h-24 w-24 text-red-400 animate-pulse mx-auto" />
                    <p className="text-lg font-semibold text-white mt-4">
                      {lastScan.data}
                    </p>
                  </>
                )}
              </div>
            </div>
            <div className="mt-4 text-center text-sm text-muted-foreground">
              O conecta un escáner compatible como ZKTeco ZKB207.
            </div>
            <div className="mt-4 flex justify-center gap-4">
              <Button
                variant="secondary"
                onClick={() => simulateScan('success')}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Simular Éxito
              </Button>
              <Button variant="destructive" onClick={() => simulateScan('error')}>
                <XCircle className="mr-2 h-4 w-4" />
                Simular Fallo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
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
