
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
import { Institution } from '@/lib/types';
import { Edit, Trash } from 'lucide-react';
import InstitutionForm from './institution-form';
import { Badge } from './ui/badge';

interface InstitutionListProps {
  onActionSuccess: () => void;
}

export default function InstitutionList({ onActionSuccess }: InstitutionListProps) {
  const [institutions, setInstitutions] = React.useState<Institution[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [editInstitution, setEditInstitution] = React.useState<Institution | null>(null);
  const [isEditOpen, setIsEditOpen] = React.useState(false);

  const { toast } = useToast();

  React.useEffect(() => {
    async function fetchInstitutions() {
      setLoading(true);
      try {
        const response = await fetch('/api/institutions');
        if (!response.ok) throw new Error('No se pudieron cargar las instituciones.');
        setInstitutions(await response.json());
      } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: error instanceof Error ? error.message : 'Error desconocido' });
      } finally {
        setLoading(false);
      }
    }
    fetchInstitutions();
  }, [toast, onActionSuccess]);

  const handleDelete = async (id: number) => {
    try {
        const response = await fetch(`/api/institutions/${id}`, {
            method: 'DELETE',
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Error al eliminar la institución.');
        }
        toast({ title: 'Institución Eliminada', description: 'La institución ha sido eliminada correctamente.' });
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
            <TableHead>Código Modular</TableHead>
            <TableHead>Dirección</TableHead>
            <TableHead className="text-center">Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                <TableCell className="text-center"><Skeleton className="h-6 w-16 mx-auto" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
              </TableRow>
            ))
          ) : institutions.length > 0 ? (
            institutions.map((institution) => (
              <TableRow key={institution.id}>
                <TableCell className="font-medium">{institution.nombre}</TableCell>
                <TableCell className="text-muted-foreground">{institution.codigo_modular}</TableCell>
                <TableCell className="text-muted-foreground">{institution.direccion}</TableCell>
                <TableCell className="text-center">
                    <Badge variant={institution.estado === 'Activo' ? 'default' : 'secondary'}>
                        {institution.estado}
                    </Badge>
                </TableCell>
                <TableCell className="text-right">
                    <Dialog open={isEditOpen && editInstitution?.id === institution.id} onOpenChange={(open) => { if(!open) setEditInstitution(null); setIsEditOpen(open); }}>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => { setEditInstitution(institution); setIsEditOpen(true); }}>
                                <Edit className="h-4 w-4" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Editar Institución</DialogTitle>
                            </DialogHeader>
                            {editInstitution && <InstitutionForm institution={editInstitution} onSuccess={handleEditSuccess} />}
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
                        <AlertDialogTitle>¿Estás seguro de eliminar esta institución?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción no se puede deshacer. Esto eliminará permanentemente la institución "{institution.nombre}".
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(institution.id)}>
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
                No se encontraron instituciones.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
