
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, PlusCircle, LoaderCircle } from 'lucide-react';
import type { Course, CourseFormValues } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { courseSchema } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// --- Formulario de Curso ---
function CourseForm({
  course,
  onSuccess,
}: {
  course?: Course;
  onSuccess: () => void;
}) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      name: course?.name || '',
      description: course?.description || '',
    },
  });

  const onSubmit = async (values: CourseFormValues) => {
    setIsSubmitting(true);
    try {
      const method = course ? 'PUT' : 'POST';
      const url = course ? `/api/courses/${course.id}` : '/api/courses';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error(`Error al ${course ? 'actualizar' : 'crear'} el curso.`);
      }
      
      toast({
        title: `Curso ${course ? 'actualizado' : 'creado'}`,
        description: `El curso "${values.name}" ha sido ${course ? 'actualizado' : 'creado'} correctamente.`,
      });
      onSuccess();
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Ocurrió un error inesperado.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del Curso</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Desarrollo Web Avanzado" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Una breve descripción del contenido del curso."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </DialogClose>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
            {course ? 'Actualizar' : 'Crear'} Curso
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}


// --- Diálogo de Curso ---
function CourseDialog({
  course,
  onSuccess,
  children,
}: {
  course?: Course;
  onSuccess: () => void;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  
  const handleSuccess = () => {
    onSuccess();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{course ? 'Editar Curso' : 'Añadir Nuevo Curso'}</DialogTitle>
          <DialogDescription>
            {course ? 'Edita los detalles del curso.' : 'Completa el formulario para añadir un nuevo curso.'}
          </DialogDescription>
        </DialogHeader>
        <CourseForm course={course} onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}

// --- Diálogo de Eliminación ---
function DeleteCourseDialog({ course, onSuccess }: { course: Course; onSuccess: () => void; }) {
  const { toast } = useToast();
  
  const handleDelete = async () => {
     try {
      const response = await fetch(`/api/courses/${course.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('No se pudo eliminar el curso.');
      }
      toast({
        title: 'Curso eliminado',
        description: `El curso "${course.name}" ha sido eliminado.`,
      });
      onSuccess();
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Este curso podría tener estudiantes inscritos. No se puede eliminar.',
      });
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
          Eliminar
        </DropdownMenuItem>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Esto eliminará permanentemente el curso <span className="font-bold">"{course.name}"</span>.
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

export default function CoursesPage() {
  const [courses, setCourses] = React.useState<Course[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchCourses = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/courses');
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Cursos</h1>
          <p className="text-muted-foreground mt-1">Gestiona todos los cursos del sistema.</p>
        </div>
        <CourseDialog onSuccess={fetchCourses}>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Añadir Curso
          </Button>
        </CourseDialog>
      </div>
      <Card className="shadow-subtle">
        <CardHeader>
          <CardTitle>Lista de Cursos</CardTitle>
          <CardDescription>
            Un resumen de todos los cursos disponibles.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre del Curso</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead className="text-right">Estudiantes Inscritos</TableHead>
                <TableHead>
                  <span className="sr-only">Acciones</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-5 w-10 inline-block" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))
              ) : (
                courses.map((course: Course) => (
                  <TableRow key={course.id}>
                    <TableCell className="font-medium">{course.name}</TableCell>
                    <TableCell className="text-muted-foreground max-w-sm truncate">
                      {course.description}
                    </TableCell>
                    <TableCell className="text-right">
                      {course.studentCount}
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
                          <CourseDialog course={course} onSuccess={fetchCourses}>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              Editar
                            </DropdownMenuItem>
                          </CourseDialog>
                          <DropdownMenuSeparator />
                          <DeleteCourseDialog course={course} onSuccess={fetchCourses} />
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
