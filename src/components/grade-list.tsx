
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


import { type AcademicYear, type Institution, type Grado } from '@/lib/types';
import { Search, Edit, Trash, LoaderCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import GradeForm from './grade-form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function GradeList({ onActionSuccess }: GradeListProps) {
  const [institutions, setInstitutions] = React.useState<Institution[]>([]);
  const [academicYears, setAcademicYears] = React.useState<AcademicYear[]>([]);
  const [selectedInstitutionId, setSelectedInstitutionId] = React.useState<string>("");
  const [academicYearId, setAcademicYearId] = React.useState<string>("");

  const [grades, setGrades] = React.useState<Grado[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [editGrade, setEditGrade] = React.useState<Grado | null>(null);
  const [isEditOpen, setIsEditOpen] = React.useState(false);

  const { toast } = useToast();

  // 1. Fetch Institutions
  React.useEffect(() => {
    async function fetchInstitutions() {
      try {
        const response = await fetch('/api/institutions');
        if (response.ok) {
          const data = await response.json();
          setInstitutions(data);
          if (data.length > 0) setSelectedInstitutionId(String(data[0].id));
        }
      } catch (error) {
        console.error("Error fetching institutions:", error);
      }
    }
    fetchInstitutions();
  }, []);

  // 2. Fetch Academic Years
  React.useEffect(() => {
    if (!selectedInstitutionId) {
      setAcademicYears([]);
      return;
    }
    async function fetchYears() {
      try {
        const response = await fetch(`/api/academic-year?institutionId=${selectedInstitutionId}`);
        if (response.ok) {
          const data = await response.json();
          setAcademicYears(data);
          if (data.length > 0) {
            setAcademicYearId(String(data[0].id));
            fetchGrades(String(data[0].id));
          } else {
            setAcademicYearId("");
            setGrades([]);
          }
        }
      } catch (error) {
        console.error("Error fetching academic years:", error);
      }
    }
    fetchYears();
  }, [selectedInstitutionId]);

  const fetchGrades = async (yearId: string) => {
    if (!yearId) {
      setGrades([]);
      return;
    }
    setLoading(true);
    try {
      // Use dynamic route for filtering by year
      const response = await fetch(`/api/grades/${yearId}`);
      if (!response.ok) throw new Error('No se pudieron cargar los grados.');
      const data = await response.json();
      setGrades(data);
      if (data.length === 0) {
        toast({ title: "Sin Grados", description: "No se encontraron grados para el año seleccionado." })
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: error instanceof Error ? error.message : 'Error desconocido' });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => fetchGrades(academicYearId);

  // Re-fetch when onActionSuccess is called from parent (via refreshKey)
  React.useEffect(() => {
    if (academicYearId) fetchGrades(academicYearId);
  }, [onActionSuccess]); // This might trigger double fetch on mount, but safe

  const onYearChange = (val: string) => {
    setAcademicYearId(val);
    fetchGrades(val);
  }

  // ... (handleDelete and handleEditSuccess remain same) ...

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
      handleRefresh();
      onActionSuccess();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: error instanceof Error ? error.message : 'Error desconocido' });
    }
  };

  const handleEditSuccess = () => {
    setIsEditOpen(false);
    handleRefresh();
    onActionSuccess();
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Institución</label>
          <Select onValueChange={setSelectedInstitutionId} value={selectedInstitutionId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona Institución" />
            </SelectTrigger>
            <SelectContent>
              {institutions.map(inst => (
                <SelectItem key={inst.id} value={String(inst.id)}>{inst.nombre}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Año Académico</label>
          <div className="flex gap-2">
            <Select onValueChange={onYearChange} value={academicYearId}>
              <SelectTrigger className="flex-grow">
                <SelectValue placeholder="Selecciona Año" />
              </SelectTrigger>
              <SelectContent>
                {academicYears.map(year => (
                  <SelectItem key={year.id} value={String(year.id)}>
                    {year.anio} {year.fec_mat_inicio ? `(${year.fec_mat_inicio})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={handleRefresh} disabled={!academicYearId || loading}>
              {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

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
                  <Dialog open={isEditOpen && editGrade?.id === grade.id} onOpenChange={(open) => { if (!open) setEditGrade(null); setIsEditOpen(open); }}>
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
