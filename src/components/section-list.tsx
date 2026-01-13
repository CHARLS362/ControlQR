
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

import { type AcademicYear, type Institution, type Grado, type Section } from '@/lib/types';
import { Search, Edit, Trash, LoaderCircle } from 'lucide-react';
import SectionForm from './section-form';

interface SectionListProps {
  onActionSuccess: () => void;
}

export default function SectionList({ onActionSuccess }: SectionListProps) {
  const [institutions, setInstitutions] = React.useState<Institution[]>([]);
  const [academicYears, setAcademicYears] = React.useState<AcademicYear[]>([]);
  const [grades, setGrades] = React.useState<Grado[]>([]);
  const [sections, setSections] = React.useState<Section[]>([]);

  const [selectedInstitutionId, setSelectedInstitutionId] = React.useState<string>("");
  const [selectedYearId, setSelectedYearId] = React.useState<string>("");
  const [selectedGradeId, setSelectedGradeId] = React.useState<string>("");

  const [loading, setLoading] = React.useState({ grades: false, sections: false });
  const [editSection, setEditSection] = React.useState<Section | null>(null);
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
          if (data.length > 0) setSelectedYearId(String(data[0].id));
          else {
            setSelectedYearId("");
            setGrades([]);
          }
        }
      } catch (error) {
        console.error("Error fetching academic years:", error);
      }
    }
    fetchYears();
  }, [selectedInstitutionId]);

  // 3. Fetch Grades
  React.useEffect(() => {
    if (!selectedYearId) {
      setGrades([]);
      return;
    }
    async function fetchGrades() {
      setLoading(prev => ({ ...prev, grades: true }));
      try {
        // Fetch grades for the selected academic year
        const response = await fetch(`/api/grades/${selectedYearId}`);
        if (response.ok) {
          const data = await response.json();
          setGrades(data);
          if (data.length > 0) setSelectedGradeId(String(data[0].id));
          else setSelectedGradeId("");
        }
      } catch (error) {
        console.error("Error fetching grades:", error);
      } finally {
        setLoading(prev => ({ ...prev, grades: false }));
      }
    }
    fetchGrades();
  }, [selectedYearId]);

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
      if (data.length === 0) {
        toast({ title: "Sin Secciones", description: "No se encontraron secciones para el grado seleccionado." })
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: error instanceof Error ? error.message : 'Error desconocido' });
    } finally {
      setLoading(prev => ({ ...prev, sections: false }));
    }
  };

  const handleRefresh = () => handleFetchSections(selectedGradeId);
  React.useEffect(() => {
    if (selectedGradeId) handleRefresh();
  }, [onActionSuccess]);

  // ... (handleDelete and handleEditSuccess remain same, just ensure they call handleRefresh) ...
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-muted/20 p-4 rounded-lg">
        {/* Institution Selector */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Institución</label>
          <Select onValueChange={setSelectedInstitutionId} value={selectedInstitutionId}>
            <SelectTrigger>
              <SelectValue placeholder="Institución" />
            </SelectTrigger>
            <SelectContent>
              {institutions.map(inst => (
                <SelectItem key={inst.id} value={String(inst.id)}>{inst.nombre}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Year Selector */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Año Académico</label>
          <Select onValueChange={setSelectedYearId} value={selectedYearId} disabled={!selectedInstitutionId}>
            <SelectTrigger>
              <SelectValue placeholder="Año" />
            </SelectTrigger>
            <SelectContent>
              {academicYears.map(year => (
                <SelectItem key={year.id} value={String(year.id)}>{year.anio} {year.fec_mat_inicio ? `(${year.fec_mat_inicio})` : ''}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Grade Selector and Search Button */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Grado</label>
          <div className="flex gap-2">
            <Select onValueChange={setSelectedGradeId} value={selectedGradeId} disabled={!selectedYearId || loading.grades}>
              <SelectTrigger className="flex-grow">
                <SelectValue placeholder={loading.grades ? "Cargando..." : "Grado"} />
              </SelectTrigger>
              <SelectContent>
                {grades.map(grade => (
                  <SelectItem key={grade.id} value={String(grade.id)}>{grade.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="default" size="icon" onClick={() => handleFetchSections(selectedGradeId)} disabled={!selectedGradeId || loading.sections}>
              {loading.sections ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>
        </div>
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
                  <Dialog open={isEditOpen && editSection?.id === section.id} onOpenChange={(open) => { if (!open) setEditSection(null); setIsEditOpen(open); }}>
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
