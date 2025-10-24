
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
import { Calendar as CalendarIcon, Download, MoreHorizontal } from 'lucide-react';
import type { Attendance, Course } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
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


function DeleteAttendanceDialog({ record, onRecordDeleted }: { record: Attendance, onRecordDeleted: (id: string) => void }) {
  const { toast } = useToast();

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/attendance/${record.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('No se pudo eliminar el registro.');
      }

      toast({
        title: 'Registro eliminado',
        description: 'El registro de asistencia ha sido eliminado.',
      });
      onRecordDeleted(record.id);
    } catch (error) {
      console.error('Error deleting record:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Ocurrió un error al eliminar.',
      });
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <DropdownMenuItem
          onSelect={(e) => e.preventDefault()}
          className="text-destructive"
        >
          Eliminar
        </DropdownMenuItem>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás seguro de que quieres eliminar este registro?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Esto eliminará permanentemente el registro de asistencia.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className={cn('bg-destructive text-destructive-foreground hover:bg-destructive/90')}>
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}


export default function ReportsPage() {
  const [attendance, setAttendance] = React.useState<Attendance[]>([]);
  const [courses, setCourses] = React.useState<Course[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { toast } = useToast();

  const [date, setDate] = React.useState<Date | undefined>();
  const [selectedCourse, setSelectedCourse] = React.useState<string>('all');

  React.useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [attendanceRes, coursesRes] = await Promise.all([
          fetch('/api/attendance'),
          fetch('/api/courses'),
        ]);

        if (!attendanceRes.ok || !coursesRes.ok) {
          throw new Error('Error al cargar los datos');
        }

        const attendanceData = await attendanceRes.json();
        const coursesData = await coursesRes.json();

        setAttendance(attendanceData);
        setCourses(coursesData);
      } catch (error) {
        console.error(error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'No se pudieron cargar los reportes.'
        });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [toast]);

  const handleRecordDeleted = (deletedId: string) => {
    setAttendance(prev => prev.filter(record => record.id !== deletedId));
  };
  
  const filteredAttendance = React.useMemo(() => {
    return attendance
      .filter((record) => {
        if (selectedCourse === 'all') return true;
        return record.courseId === selectedCourse;
      })
      .filter((record) => {
        if (!date) return true;
        // Compare only the date part, ignoring time
        const recordDate = new Date(record.date);
        recordDate.setUTCHours(0, 0, 0, 0);
        const filterDate = new Date(date);
        filterDate.setUTCHours(0, 0, 0, 0);
        return recordDate.getTime() === filterDate.getTime();
      });
  }, [attendance, selectedCourse, date]);

  const exportToCSV = () => {
    const headers = ['ID Registro', 'Estudiante', 'ID Estudiante', 'Curso', 'ID Curso', 'Fecha', 'Estado'];
    const rows = filteredAttendance.map(record => [
      record.id,
      record.studentName,
      record.studentId,
      record.courseName,
      String(record.courseId),
      new Date(record.date).toLocaleString(),
      record.status,
    ]);

    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "reporte_asistencia.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Reportes de Asistencia</h1>
          <p className="text-muted-foreground mt-1">
            Ver y exportar registros de asistencia.
          </p>
        </div>
        <Button onClick={exportToCSV} disabled={filteredAttendance.length === 0}>
          <Download className="mr-2 h-4 w-4" /> Exportar Reporte
        </Button>
      </div>
      <Card className="shadow-subtle">
        <CardHeader>
          <CardTitle>Filtrar Registros</CardTitle>
          <CardDescription>
            Selecciona filtros para acotar los registros de asistencia.
          </CardDescription>
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger className="w-full sm:w-[280px]">
                <SelectValue placeholder="Seleccionar un curso" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los cursos</SelectItem>
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
                    'w-full sm:w-[280px] justify-start text-left font-normal',
                    !date && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP') : <span>Elige una fecha</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Estudiante</TableHead>
                <TableHead>Curso</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>
                  <span className="sr-only">Acciones</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                   <TableRow key={index}>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))
              ) : filteredAttendance.length > 0 ? (
                filteredAttendance.map((record: Attendance) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">
                      {record.studentName}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {record.courseName}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(record.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          record.status === 'Presente' ? 'default' : 'destructive'
                        }
                        className={
                          record.status === 'Presente' ? 'bg-emerald-500/80 hover:bg-emerald-500 text-white' : ''
                        }
                      >
                        {record.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            aria-haspopup="true"
                            size="icon"
                            variant="ghost"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Alternar menú</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuItem>Ver Detalles</DropdownMenuItem>
                          <DeleteAttendanceDialog record={record} onRecordDeleted={handleRecordDeleted} />
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No se encontraron resultados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
