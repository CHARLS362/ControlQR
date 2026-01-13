
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
import { Grado, Section } from '@/lib/types';
import { Edit, LoaderCircle, Trash, Search } from 'lucide-react';
import SectionForm from './section-form';

interface SectionListProps {
  onActionSuccess: () => void;
}

export default function SectionList({ onActionSuccess }: SectionListProps) {
  const [grades, setGrades] = React.useState<Grado[]>([]);
  const [selectedGrade, setSelectedGrade] = React.useState<string>('');
  const [sections, setSections] = React.useState<Section[]>([]);
  const [loading, setLoading] = React.useState({ grades: true, sections: false });
  const [editSection, setEditSection] = React.useState<Section | null>(null);
  const [isEditOpen, setIsEditOpen] = React.useState(false);

  const { toast } = useToast();

  React.useEffect(() => {
    async function fetchGrades() {
      setLoading(prev => ({ ...prev, grades: true }));
      try {
        const response = await fetch('/api/grades');
        if (!response.ok) throw new Error('No se pudieron cargar los grados.');
        setGrades(await response.json());
      } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: error instanceof Error ? error.message : 'Error desconocido' });
      } finally {
        setLoading(prev => ({ ...prev, grades: false }));
      }
    }
    fetchGrades();
  }, [toast]);

  const handleFetchSections = async (gradeId: string) => {
    if (!gradeId) {
        setSections([]);
        return;
    }
    setLoading(prev => ({ ...prev, sections: true }));
    try {
      const response = await fetch(`/api/sections/${gradeId}`);
      if (!response.ok) throw new Error('No se pudieron cargar las secciones.');
      const data = await response.json();
      setSections(data);
      if(data.length === 0) {
        toast({ title: "Sin Secciones", description: "No se encontraron secciones para el grado seleccionado."})
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: error instanceof Error ? error.message : 'Error desconocido' });
    } finally {
      setLoading(prev => ({ ...prev, sections: false }));
    }
  };

  const handleDelete = async (sectionId: number) => {
    try {
        const response = await fetch(`/api/sections/${sectionId}`, {
            method: 'DELETE',
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Error al eliminar la sección.');
        }
        toast({ title: 'Sección Eliminada', description: 'La sección ha sido eliminada correctamente.' });
        onActionSuccess();
        handleFetchSections(selectedGrade);
    } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: error instanceof Error ? error.message : 'Error desconocido' });
    }
  };
  
  const handleEditSuccess = () => {
    setIsEditOpen(false);
    onActionSuccess();
    handleFetchSections(selectedGrade);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-4">
        <div className="flex-grow">
            <label htmlFor="grade-select" className="text-sm font-medium text-gray-700 mb-1 block">
                Grado
            </label>
            <Select onValueChange={setSelectedGrade} value={selectedGrade} disabled={loading.grades}>
            <SelectTrigger id="grade-select">
                <SelectValue placeholder={loading.grades ? "Cargando grados..." : "Selecciona un grado"} />
            </SelectTrigger>
            <SelectContent>
                {grades.map((grade) => (
                <SelectItem key={grade.id} value={String(grade.id)}>
                    {grade.nombre}
                </SelectItem>
                ))}
            </SelectContent>
            </Select>
        </div>
        <Button onClick={() => handleFetchSections(selectedGrade)} disabled={!selectedGrade || loading.sections}>
          {loading.sections ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
          Buscar Secciones
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Aula</TableHead>
            <TableHead>Turno</TableHead>
            <TableHead className="text-center">Vacantes</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading.sections ? (
            Array.from({ length: 3 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                <TableCell><Skeleton className="h-5 w-16 mx-auto" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
              </TableRow>
            ))
          ) : sections.length > 0 ? (
            sections.map((section) => (
              <TableRow key={section.id}>
                <TableCell className="font-medium">{section.nombre}</TableCell>
                <TableCell>{section.aula}</TableCell>
                <TableCell className="text-muted-foreground">{section.turno}</TableCell>
                <TableCell className="text-center">{section.vacantes_faltantes} / {section.vacantes_total}</TableCell>
                <TableCell className="text-right">
                    <Dialog open={isEditOpen && editSection?.id === section.id} onOpenChange={(open) => { if(!open) setEditSection(null); setIsEditOpen(open); }}>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => { setEditSection(section); setIsEditOpen(true); }}>
                                <Edit className="h-4 w-4" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Editar Sección</DialogTitle>
                            </DialogHeader>
                            {editSection && <SectionForm section={editSection} onSuccess={handleEditSuccess} />}
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
                        <AlertDialogTitle>¿Estás seguro de eliminar esta sección?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción no se puede deshacer. Esto eliminará permanentemente la sección "{section.nombre}" del sistema.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(section.id)}>
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
                Selecciona un grado y haz clic en "Buscar" para ver las secciones.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
