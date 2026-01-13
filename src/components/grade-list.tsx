
'use client';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Grado } from '@/lib/types';
import { Edit, LoaderCircle, Trash } from 'lucide-react';
import GradeForm from './grade-form';
import { Badge } from './ui/badge';

interface GradeListProps {
  onActionSuccess: () => void;
}

export default function GradeList({ onActionSuccess }: GradeListProps) {
  const [grades, setGrades] = React.useState<Grado[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [editGrade, setEditGrade] = React.useState<Grado | null>(null);
  const [isEditOpen, setIsEditOpen] = React.useState(false);

  const { toast } = useToast();

  React.useEffect(() => {
    async function fetchGrades() {
      setLoading(true);
      try {
        const response = await fetch('/api/grades');
        if (!response.ok) throw new Error('No se pudieron cargar los grados.');
        setGrades(await response.json());
      } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: error instanceof Error ? error.message : 'Error desconocido' });
      } finally {
        setLoading(false);
      }
    }
    fetchGrades();
  }, [toast, onActionSuccess]);

  const handleDelete = async (gradeId: number) => {
    try {
        const response = await fetch(`/api/grades/${gradeId}`, {
            method: 'DELETE',
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Error al eliminar el grado.');
        }
        toast({ title: 'Grado Eliminado', description: 'El grado ha sido eliminado correctamente.' });
        onActionSuccess();
    } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: error instanceof Error ? error.message : 'Error desconocido' });
    }
  };
  
  const handleEditSuccess = () => {
    setIsEditOpen(false);
    onActionSuccess();
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead className="text-center">Asignado a Secciones</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                <TableCell className="text-center"><Skeleton className="h-6 w-16 mx-auto" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
              </TableRow>
            ))
          ) : grades.length > 0 ? (
            grades.map((grade) => (
              <TableRow key={grade.id}>
                <TableCell className="font-medium">{grade.nombre}</TableCell>
                <TableCell className="text-muted-foreground">{grade.descripcion || 'Sin descripción'}</TableCell>
                <TableCell className="text-center">
                    <Badge variant={grade.asignado > 0 ? 'default' : 'secondary'}>
                        {grade.asignado > 0 ? 'Sí' : 'No'}
                    </Badge>
                </TableCell>
                <TableCell className="text-right">
                    <Dialog open={isEditOpen && editGrade?.id === grade.id} onOpenChange={(open) => { if(!open) setEditGrade(null); setIsEditOpen(open); }}>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => { setEditGrade(grade); setIsEditOpen(true); }}>
                                <Edit className="h-4 w-4" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Editar Grado</DialogTitle>
                            </DialogHeader>
                            {editGrade && <GradeForm grade={editGrade} onSuccess={handleEditSuccess} />}
                        </DialogContent>
                    </Dialog>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" disabled={grade.asignado > 0}>
                        <Trash className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro de eliminar este grado?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción no se puede deshacer. Esto eliminará permanentemente el grado "{grade.nombre}" del sistema.
                          Solo puedes eliminar grados que no tengan secciones asignadas.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(grade.id)}>
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
              <TableCell colSpan={4} className="h-24 text-center">
                No se encontraron grados. Puedes crear uno en la pestaña "Crear Grado".
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
