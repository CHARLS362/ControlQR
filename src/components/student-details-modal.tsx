'use client';

import * as React from 'react';
import Barcode from 'react-barcode';
import { QRCodeSVG } from 'qrcode.react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import type { StudentDetails } from '@/lib/types';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { User, GraduationCap, Phone, Hash, ShieldCheck, Calendar, BookOpen, AlertCircle, QrCode, BarChart2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


interface StudentDetailsModalProps {
  studentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DetailItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: React.ReactNode }) => (
    <div className="flex items-start gap-3">
        <Icon className="h-5 w-5 text-muted-foreground mt-1 shrink-0" />
        <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">{label}</span>
            <span className="font-semibold">{value || 'No especificado'}</span>
        </div>
    </div>
);


export function StudentDetailsModal({ studentId, open, onOpenChange }: StudentDetailsModalProps) {
  const [details, setDetails] = React.useState<StudentDetails | null>(null);
  const [loading, setLoading] = React.useState(true);
  const { toast } = useToast();

  React.useEffect(() => {
    if (!open || !studentId) return;

    const fetchDetails = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/students/details/${studentId}`);
        if (!response.ok) {
          throw new Error('No se pudieron cargar los detalles del estudiante.');
        }
        const data = await response.json();
        setDetails(data);
      } catch (error) {
        console.error(error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error instanceof Error ? error.message : 'Ocurrió un error inesperado.',
        });
        onOpenChange(false); // Cierra el modal si hay un error
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [studentId, open, onOpenChange, toast]);

  const getBarcodeValue = () => {
    if (!details) return '';
    const nameParts = details.nombres.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.length > 1 ? nameParts[1] : '';
    return `${firstName} ${lastName}`;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User />
            Detalles del Estudiante
          </DialogTitle>
           {details && <DialogDescription>Información completa de {details.nombres}.</DialogDescription>}
        </DialogHeader>

        {loading ? (
            <div className="space-y-4 py-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Separator className="my-4"/>
                <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <div className="flex justify-center pt-4">
                    <Skeleton className="h-20 w-full max-w-sm" />
                </div>
            </div>
        ) : details ? (
          <div className="py-4">
            <h3 className="text-lg font-semibold text-primary mb-3">{details.nombres}</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 mb-6">
                <DetailItem icon={Hash} label="Código de Estudiante" value={details.codigo} />
                <DetailItem icon={Calendar} label="Año Académico" value={<Badge variant="secondary">{details.anio_academico}</Badge>} />
                <DetailItem icon={GraduationCap} label="Grado y Sección" value={`${details.grado} "${details.seccion}"`} />
                <DetailItem icon={BookOpen} label="Periodo" value={details.periodo || 'N/A'} />
                 <DetailItem icon={ShieldCheck} label="Seguro" value={details.seguro} />
                <DetailItem icon={Phone} label="Celular de Emergencia" value={details.celular_emergencia} />
            </div>

            {details.observacion && (
                <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-md mb-6">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                        <div>
                        <h4 className="text-sm font-semibold text-amber-800">Observación</h4>
                        <p className="text-sm text-amber-700 mt-1">{details.observacion}</p>
                        </div>
                    </div>
                </div>
            )}
            
            <Separator className="my-4"/>
            
            <Tabs defaultValue="qr" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="qr"><QrCode className="mr-2" />Código QR</TabsTrigger>
                <TabsTrigger value="barcode"><BarChart2 className="mr-2" />Código de Barras</TabsTrigger>
              </TabsList>
              <TabsContent value="qr">
                <div className="flex flex-col items-center justify-center p-4 bg-white rounded-md mt-4">
                  <QRCodeSVG
                    value={details.codigo_hash}
                    size={200}
                    bgColor={"#ffffff"}
                    fgColor={"#000000"}
                    level={"L"}
                    includeMargin={false}
                  />
                  <p className="mt-2 text-sm font-semibold">{getBarcodeValue()}</p>
                </div>
              </TabsContent>
              <TabsContent value="barcode">
                <div className="flex flex-col items-center justify-center p-4 bg-white rounded-md mt-4">
                    <Barcode 
                        value={details.codigo_hash}
                        width={1}
                        height={50}
                        fontSize={12}
                        text={getBarcodeValue()}
                    />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="text-center py-10">
            <p>No se encontraron detalles para este estudiante.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
