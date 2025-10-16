import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, QrCode, XCircle } from "lucide-react";

export default function ScanPage() {
  return (
    <>
       <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Escanear Asistencia</h1>
          <p className="text-muted-foreground mt-1">Usa la cámara para escanear los códigos QR de los estudiantes y registrar la asistencia.</p>
      </div>
      <div className="flex justify-center">
        <Card className="w-full max-w-2xl shadow-subtle">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><QrCode/>Escáner de Código QR</CardTitle>
                <CardDescription>Coloca el código QR del estudiante dentro del marco.</CardDescription>
            </CardHeader>
            <CardContent>
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
                        {/* Example of success state */}
                        {/* <CheckCircle className="h-24 w-24 text-green-400 animate-pulse"/>
                        <p className="text-lg font-semibold text-white mt-4">Escaneo Exitoso: John Doe</p> */}

                        {/* Example of failure state */}
                        {/* <XCircle className="h-24 w-24 text-red-400 animate-pulse"/>
                        <p className="text-lg font-semibold text-white mt-4">Ya Registrado</p> */}
                    </div>
                </div>
                 <div className="mt-4 text-center text-sm text-muted-foreground">
                    O conecta un escáner compatible como ZKTeco ZKB207.
                </div>
                 <div className="mt-4 flex justify-center gap-4">
                    <Button variant="secondary"><CheckCircle className="mr-2 h-4 w-4"/>Simular Éxito</Button>
                    <Button variant="destructive"><XCircle className="mr-2 h-4 w-4"/>Simular Fallo</Button>
                </div>
            </CardContent>
        </Card>
      </div>
      <style jsx>{`
        @keyframes scan-line {
          0% { top: 0; }
          50% { top: 100%; }
          100% { top: 0; }
        }
      `}</style>
    </>
  );
}
