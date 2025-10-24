
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
import { Calendar as CalendarIcon, Download, MoreHorizontal, FilePlus, LoaderCircle, BarChart } from 'lucide-react';
import type { AttendanceReport, Course } from '@/lib/types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';

function GenerateReportCard({
  courses,
  onReportGenerated,
}: {
  courses: Course[];
  onReportGenerated: () => void;
}) {
  const [selectedCourse, setSelectedCourse] = React.useState<string | undefined>();
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [isGenerating, setIsGenerating] = React.useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!selectedCourse || !date) {
      toast({
        variant: 'destructive',
        title: 'Datos incompletos',
        description: 'Por favor, selecciona un curso y una fecha.',
      });
      return;
    }
    setIsGenerating(true);
    try {
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: selectedCourse,
          reportDate: format(date, 'yyyy-MM-dd'),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'No se pudo generar el reporte.');
      }

      toast({
        title: 'Reporte Generado Exitosamente',
        description: `El reporte para el curso seleccionado ha sido creado.`,
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
          Selecciona un curso y una fecha para compilar un nuevo reporte de asistencia.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid sm:grid-cols-3 gap-4">
        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar un curso" />
          </SelectTrigger>
          <SelectContent>
            {courses.map((course) => (
              <SelectItem key={course.id} value={String(course.id)}>
                {course.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={'outline'}
              className={cn(
                'justify-start text-left font-normal',
                !date && 'text-muted-foreground'
              )}
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
              disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
            />
          </PopoverContent>
        </Popover>
        <Button onClick={handleGenerate} disabled={isGenerating}>
          {isGenerating ? (
            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <BarChart className="mr-2 h-4 w-4" />
          )}
          Generar Reporte
        </Button>
      </CardContent>
    </Card>
  );
}

export default function ReportsPage() {
  const [reports, setReports] = React.useState<AttendanceReport[]>([]);
  const [courses, setCourses] = React.useState<Course[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { toast } = useToast();

  const fetchReportsAndCourses = React.useCallback(async () => {
    setLoading(true);
    try {
      const [reportsRes, coursesRes] = await Promise.all([
        fetch('/api/reports'),
        fetch('/api/courses'),
      ]);

      if (!reportsRes.ok || !coursesRes.ok) {
        throw new Error('Error al cargar los datos');
      }

      const reportsData = await reportsRes.json();
      const coursesData = await coursesRes.json();

      setReports(reportsData);
      setCourses(coursesData);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudieron cargar los reportes.',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    fetchReportsAndCourses();
  }, [fetchReportsAndCourses]);

  const exportToCSV = () => {
    const headers = ['ID', 'Curso', 'Estudiante', 'Fecha Reporte', 'Clases Totales', 'Asistidas', 'Ausentes', '% Asistencia', 'Generado'];
    const rows = reports.map(r => [
      r.id,
      r.courseName,
      r.studentName,
      new Date(r.report_date).toLocaleDateString(),
      r.total_classes,
      r.attended_classes,
      r.absent_classes,
      r.attendance_percentage,
      new Date(r.generated_at).toLocaleString(),
    ]);

    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "reportes_asistencia.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Reportes de Asistencia</h1>
          <p className="text-muted-foreground mt-1">
            Genera y exporta reportes de asistencia por curso.
          </p>
        </div>
        <Button onClick={exportToCSV} disabled={reports.length === 0}>
          <Download className="mr-2 h-4 w-4" /> Exportar Todo
        </Button>
      </div>

      <GenerateReportCard courses={courses} onReportGenerated={fetchReportsAndCourses} />

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
                <TableHead>Curso / Estudiante</TableHead>
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
                Array.from({ length: 5 }).map((_, index) => (
                   <TableRow key={index}>
                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))
              ) : reports.length > 0 ? (
                reports.map((report: AttendanceReport) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">
                      <div>{report.courseName}</div>
                      <div className="text-xs text-muted-foreground">{report.studentName}</div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(report.report_date), 'dd MMM, yyyy', { locale: es })}
                    </TableCell>
                    <TableCell className="text-center text-xs">
                        <span className="text-green-600 font-medium">{report.attended_classes}</span> / {' '}
                        <span className="font-bold">{report.total_classes}</span>
                        <span className="text-red-600 font-medium ml-2">{report.absent_classes} aus.</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                         <span className="font-bold text-lg">{report.attendance_percentage}%</span>
                         <Progress value={report.attendance_percentage} className="w-24 h-2" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Alternar menú</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuItem disabled>Ver Detalles</DropdownMenuItem>
                          <DropdownMenuItem disabled className="text-destructive">Eliminar Reporte</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No se han generado reportes.
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
