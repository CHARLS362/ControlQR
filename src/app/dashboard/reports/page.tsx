
'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Download, MoreHorizontal, FilePlus, LoaderCircle, BarChart, AlertTriangle } from 'lucide-react';
import type { AttendanceReport, Section, Grado } from '@/lib/types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';

function GenerateReportCard({
  grades,
  onReportGenerated,
}: {
  grades: Grado[];
  onReportGenerated: () => void;
}) {
  const [selectedGrade, setSelectedGrade] = React.useState<string | undefined>();
  const [selectedSection, setSelectedSection] = React.useState<string | undefined>();
  const [sections, setSections] = React.useState<Section[]>([]);
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [isGenerating, setIsGenerating] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    if (!selectedGrade) {
      setSections([]);
      setSelectedSection(undefined);
      return;
    }
    const fetchSections = async () => {
      try {
        const response = await fetch(`/api/sections/${selectedGrade}`);
        if (!response.ok) throw new Error('No se pudieron cargar las secciones');
        setSections(await response.json());
      } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron cargar las secciones del grado.' });
      }
    };
    fetchSections();
  }, [selectedGrade, toast]);

  const handleGenerate = async () => {
    if (!selectedSection || !date) {
      toast({
        variant: 'destructive',
        title: 'Datos incompletos',
        description: 'Por favor, selecciona un grado, sección y una fecha.',
      });
      return;
    }
    setIsGenerating(true);
    try {
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionId: selectedSection,
          reportDate: format(date, 'yyyy-MM-dd'),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'No se pudo generar el reporte.');
      }

      toast({
        title: 'Reporte Generado Exitosamente',
        description: `El reporte para la sección seleccionada ha sido creado.`,
      });
      onReportGenerated();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error al generar',
        description: error instanceof Error ? error.message : 'Ocurrió un error inesperado.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="shadow-subtle">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FilePlus />
          Generar Nuevo Reporte de Asistencia
        </CardTitle>
        <CardDescription>
          Selecciona un grado, sección y una fecha para compilar un nuevo reporte de asistencia.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Select value={selectedGrade} onValueChange={setSelectedGrade}>
          <SelectTrigger><SelectValue placeholder="Seleccionar Grado" /></SelectTrigger>
          <SelectContent>
            {grades.map((grade) => (
              <SelectItem key={grade.id} value={String(grade.id)}>{grade.nombre}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedSection} onValueChange={setSelectedSection} disabled={!selectedGrade}>
          <SelectTrigger><SelectValue placeholder="Seleccionar Sección" /></SelectTrigger>
          <SelectContent>
            {sections.map((section) => (
              <SelectItem key={section.id} value={String(section.id)}>{section.nombre}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={'outline'}
              className={cn('justify-start text-left font-normal', !date && 'text-muted-foreground')}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, 'PPP', { locale: es }) : <span>Elige una fecha</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
              disabled={(date) => date > new Date() || date < new Date('2020-01-01')}
            />
          </PopoverContent>
        </Popover>
        <Button onClick={handleGenerate} disabled={isGenerating}>
          {isGenerating ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <BarChart className="mr-2 h-4 w-4" />}
          Generar Reporte
        </Button>
      </CardContent>
    </Card>
  );
}

export default function ReportsPage() {
  const [reports, setReports] = React.useState<AttendanceReport[]>([]);
  const [grades, setGrades] = React.useState<Grado[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { toast } = useToast();

  const fetchReportsAndGrades = React.useCallback(async () => {
    setLoading(true);
    try {
      // Como los reportes ahora son una funcionalidad no soportada, solo cargamos los grados
      // para el formulario de generación.
      const [gradesRes] = await Promise.all([
        fetch('/api/grades'),
      ]);

      if (!gradesRes.ok) {
        throw new Error('Error al cargar los datos de grados.');
      }
      
      const gradesData = await gradesRes.json();
      setGrades(gradesData);
      setReports([]); // Se vacían los reportes ya que no hay endpoint para listarlos

    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudieron cargar los datos necesarios.',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    fetchReportsAndGrades();
  }, [fetchReportsAndGrades]);

  const exportToCSV = () => {
    toast({ title: 'Función no disponible', description: 'No hay reportes para exportar.' });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Reportes de Asistencia</h1>
          <p className="text-muted-foreground mt-1">
            Genera y exporta reportes de asistencia por sección.
          </p>
        </div>
        <Button onClick={exportToCSV} disabled={reports.length === 0}>
          <Download className="mr-2 h-4 w-4" /> Exportar Todo
        </Button>
      </div>

      <GenerateReportCard grades={grades} onReportGenerated={fetchReportsAndGrades} />
      
       <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-yellow-800">
                Funcionalidad de Reportes Limitada
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                Actualmente, la API externa no soporta la generación y listado de reportes de asistencia consolidados. El listado de reportes está deshabilitado.
              </p>
            </div>
          </div>
        </div>

      <Card className="shadow-subtle">
        <CardHeader>
          <CardTitle>Reportes Generados</CardTitle>
          <CardDescription>
            Lista de todos los reportes de asistencia generados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Grado / Sección / Estudiante</TableHead>
                <TableHead>Fecha del Reporte</TableHead>
                <TableHead className="text-center">Resumen</TableHead>
                <TableHead className="text-right">Porcentaje Asistencia</TableHead>
                <TableHead>
                  <span className="sr-only">Acciones</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, index) => (
                   <TableRow key={index}>
                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    La API externa no proporciona una lista de reportes generados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
