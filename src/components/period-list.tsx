
'use client';

import * as React from 'react';
import { format, parseISO } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Period } from '@/lib/types';
import { Edit, LoaderCircle, Trash, Search, CalendarDays } from 'lucide-react';
import PeriodForm from './period-form';
import { Badge } from './ui/badge';

interface PeriodListProps {
  onActionSuccess: () => void;
}

export default function PeriodList({ onActionSuccess }: PeriodListProps) {
  const [academicYearId, setAcademicYearId] = React.useState<string>('');
  const [periods, setPeriods] = React.useState<Period[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [editPeriod, setEditPeriod] = React.useState<Period | null>(null);
  const [isEditOpen, setIsEditOpen] = React.useState(false);

  const { toast } = useToast();
  
  const handleFetchPeriods = async (yearId: string) => {
    if (!yearId) {
        setPeriods([]);
        return;
    }
    setLoading(true);
    try {
      const response = await fetch(`/api/periods/${yearId}`);
      if (!response.ok) throw new Error('No se pudieron cargar los periodos.');
      const data = await response.json();
      setPeriods(data);
      if(data.length === 0) {
        toast({ title: "Sin Periodos", description: "No se encontraron periodos para el año seleccionado."})
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: error instanceof Error ? error.message : 'Error desconocido' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (periodId: number) => {
    try {
        const response = await fetch(`/api/periods/${periodId}`, {
            method: 'DELETE',
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Error al eliminar el periodo.');
        }
        toast({ title: 'Periodo Eliminado', description: 'El periodo ha sido eliminado correctamente.' });
        handleFetchPeriods(academicYearId);
        onActionSuccess();
    } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: error instanceof Error ? error.message : 'Error desconocido' });
    }
  };
  
  const handleEditSuccess = () => {
    setIsEditOpen(false);
    handleFetchPeriods(academicYearId);
    onActionSuccess();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-4">
        <div className="flex-grow">
            <label htmlFor="year-select" className="text-sm font-medium text-gray-700 mb-1 block">
                Año Académico
            </label>
            <Select onValueChange={setAcademicYearId} value={academicYearId}>
                <SelectTrigger id="year-select">
                    <SelectValue placeholder="Selecciona un año académico" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="1">2025</SelectItem>
                    <SelectItem value="2">2024</SelectItem>
                </SelectContent>
            </Select>
        </div>
        <Button onClick={() => handleFetchPeriods(academicYearId)} disabled={!academicYearId || loading}>
          {loading ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
          Buscar Periodos
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Fecha de Inicio</TableHead>
            <TableHead>Fecha de Fin</TableHead>
            <TableHead className="text-center">Vigente</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                <TableCell className="text-center"><Skeleton className="h-6 w-16 mx-auto" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
              </TableRow>
            ))
          ) : periods.length > 0 ? (
            periods.map((period) => (
              <TableRow key={period.id}>
                <TableCell className="font-medium">{period.nombre}</TableCell>
                <TableCell>{format(parseISO(period.fecha_inicio), 'dd/MM/yyyy')}</TableCell>
                <TableCell>{format(parseISO(period.fecha_fin), 'dd/MM/yyyy')}</TableCell>
                <TableCell className="text-center">
                    <Badge variant={period.vigente ? 'default' : 'secondary'}>
                        {period.vigente ? 'Sí' : 'No'}
                    </Badge>
                </TableCell>
                <TableCell className="text-right">
                    <Dialog open={isEditOpen && editPeriod?.id === period.id} onOpenChange={(open) => { if(!open) setEditPeriod(null); setIsEditOpen(open); }}>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => { setEditPeriod(period); setIsEditOpen(true); }}>
                                <Edit className="h-4 w-4" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Editar Periodo</DialogTitle>
                            </DialogHeader>
                            {editPeriod && <PeriodForm period={editPeriod} onSuccess={handleEditSuccess} />}
                        </DialogContent>
                    </Dialog>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                        <Trash className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro de eliminar este periodo?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción no se puede deshacer. Esto eliminará permanentemente el periodo "{period.nombre}".
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(period.id)}>
                          Eliminar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                Selecciona un año académico y haz clic en "Buscar" para ver los periodos.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
