'use client';

import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Camera } from 'lucide-react';
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
  const [showScanner, setShowScanner] = React.useState(false);

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Escanear Asistencia</h1>
          <p className="text-muted-foreground mt-1">Usa la cámara para registrar la asistencia automáticamente.</p>
        </div>
        {!showScanner && (
            <Button onClick={() => setShowScanner(true)}>
                <Camera className="mr-2" /> Activar Cámara
            </Button>
        )}
      </div>
      {showScanner ? (
        <ScannerComponent />
      ) : (
        <div className="flex flex-col items-center justify-center text-center mt-10 p-8 border-2 border-dashed rounded-lg">
            <Camera className="h-16 w-16 text-muted-foreground/50" />
            <h2 className="mt-4 text-xl font-semibold">La cámara está desactivada</h2>
            <p className="mt-1 text-muted-foreground">Haz clic en "Activar Cámara" para empezar a escanear.</p>
        </div>
      )}
    </>
  );
}