
'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const ScannerComponent = dynamic(
  () => import('@/components/scanner').then((mod) => mod.Scanner),
  {
    ssr: false,
    loading: () => (
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
        <div className="lg:col-span-2">
           <Skeleton className="aspect-video w-full" />
        </div>
        <div className="lg:col-span-1 space-y-6">
           <Skeleton className="h-32 w-full" />
           <Skeleton className="h-64 w-full" />
        </div>
       </div>
    ),
  }
);

export default function ScanPage() {
  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Escanear Asistencia</h1>
          <p className="text-muted-foreground mt-1">Usa la cámara para registrar la asistencia automáticamente.</p>
        </div>
      </div>
      <ScannerComponent />
    </>
  );
}
