
'use client';

import * as React from 'react';
import Image from 'next/image';
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
import { Button } from '@/components/ui/button';
import { MoreHorizontal, PlusCircle, Upload, LoaderCircle, Search, X } from 'lucide-react';
import type { Student, StudentFormValues, Course } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { QRCodeSVG } from 'qrcode.react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Barcode from 'react-barcode';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { studentSchema, z } from '@/lib/types';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { StudentDetailsModal } from '@/components/student-details-modal';

// --- Formulario de Búsqueda ---
const searchSchema = z.object({
  id: z.string().regex(/^[0-9]+$/, "Por favor, introduce un ID numérico."),
});
type SearchFormValues = z.infer<typeof searchSchema>;

function StudentSearch({ onSearch, onClear, isSearching }: { onSearch: (data: SearchFormValues) => void; onClear: () => void; isSearching: boolean; }) {
  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      id: '',
    },
  });

  const handleClear = () => {
    form.reset();
    onClear();
  };

  return (
    <Card className="shadow-subtle mb-6">
      <CardHeader>
        <CardTitle>Buscar Estudiante por ID</CardTitle>
        <CardDescription>Introduce el ID numérico del estudiante para ver sus detalles.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSearch)} className="flex items-start gap-4">
              <FormField
                control={form.control}
                name="id"
                render={({ field }) => (
                  <FormItem className="flex-grow">
                    <FormLabel>ID de Estudiante</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: 191" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-2 pt-8">
                 <Button type="submit" disabled={isSearching}>
                    {isSearching ? <LoaderCircle className="animate-spin" /> : <Search />}
                    <span className="ml-2">Buscar</span>
                </Button>
                 <Button type="button" variant="outline" onClick={handleClear} disabled={isSearching}>
                    <X />
                </Button>
              </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}


// --- Formulario de Estudiante ---
function StudentForm({ student, onSuccess }: { student?: Student; onSuccess: () => void; }) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [courses, setCourses] = React.useState<Course[]>([]);
  
  React.useEffect(() => {
    async function fetchCourses() {
      try {
        const response = await fetch('/api/courses');
        if (!response.ok) {
          throw new Error('No se pudieron cargar los cursos.');
        }
        const data = await response.json();
        setCourses(data);
      } catch (error) {
         toast({
          variant: 'destructive',
          title: 'Error',
          description: 'No se pudieron cargar los cursos para la selección.',
        });
      }
    }
    fetchCourses();
  }, [toast]);
  
  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      name: student?.name || '',
      email: student?.email || '',
      courseId: student?.courseId || '',
    },
  });

  const onSubmit = async (values: StudentFormValues) => {
    setIsSubmitting(true);
    try {
      const method = student ? 'PUT' : 'POST';
      const url = student ? `/api/students/${student.id}` : '/api/students';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error(`Error al ${student ? 'actualizar' : 'crear'} el estudiante.`);
      }

      const responseData = await response.json();
      
      toast({
        title: `Estudiante ${student ? 'actualizado' : 'creado'}`,
        description: `El estudiante "${responseData.name}" ha sido ${student ? 'actualizado' : 'creado'} correctamente.`,
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
              <FormLabel>Nombre Completo</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Juan Pérez" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Correo Electrónico</FormLabel>
              <FormControl>
                <Input type="email" placeholder="juan.perez@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="courseId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Asignar Curso</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un curso para el estudiante" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {courses.length === 0 ? (
                    <SelectItem value="loading" disabled>Cargando cursos...</SelectItem>
                  ) : (
                    courses.map(course => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
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
            {student ? 'Actualizar' : 'Crear'} Estudiante
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}


// --- Diálogo de Estudiante ---
function StudentDialog({
  student,
  onSuccess,
  children,
}: {
  student?: Student;
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
          <DialogTitle>{student ? 'Editar Estudiante' : 'Añadir Nuevo Estudiante'}</DialogTitle>
          <DialogDescription>
            {student ? 'Edita los detalles y la asignación del curso del estudiante.' : 'Completa el formulario para añadir un nuevo estudiante y asignarlo a un curso.'}
          </DialogDescription>
        </DialogHeader>
        <StudentForm student={student} onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}

// --- Diálogo de Eliminación ---
function DeleteStudentDialog({ student, onSuccess }: { student: Student; onSuccess: () => void; }) {
  const { toast } = useToast();
  
  const handleDelete = async () => {
     try {
      const response = await fetch(`/api/students/${student.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('No se pudo eliminar al estudiante.');
      }
      toast({
        title: 'Estudiante eliminado',
        description: `El estudiante "${student.name}" ha sido eliminado.`,
      });
      onSuccess();
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Este estudiante podría tener registros de asistencia. No se puede eliminar.',
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
            Esta acción no se puede deshacer. Esto eliminará permanentemente al estudiante <span className="font-bold">"{student.name}"</span> y todos sus registros de asistencia.
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


export default function StudentsPage() {
  const [students, setStudents] = React.useState<Student[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isSearching, setIsSearching] = React.useState(false);
  const { toast } = useToast();
  const [selectedStudentId, setSelectedStudentId] = React.useState<string | null>(null);

  const fetchStudents = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/students');
      if (!response.ok) {
        throw new Error('Error al cargar los estudiantes');
      }
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudieron cargar los estudiantes.',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);
  
  const handleSearch = async (searchData: SearchFormValues) => {
    setIsSearching(true);
    try {
      const response = await fetch(`/api/students/details/${searchData.id}`);
       if (!response.ok) {
        throw new Error('Estudiante no encontrado con ese ID.');
      }
      const data = await response.json();
      if (data) {
        setSelectedStudentId(searchData.id);
        toast({ title: 'Estudiante Encontrado', description: `Mostrando detalles para ${data.nombres}` });
      }
    } catch (error) {
      console.error('Error searching student:', error);
      toast({
        variant: 'destructive',
        title: 'Error de Búsqueda',
        description: error instanceof Error ? error.message : 'No se pudo completar la búsqueda.',
      });
    } finally {
      setIsSearching(false);
    }
  };

  const getAvatar = (avatarId: string) => {
    return PlaceHolderImages.find((img) => img.id === avatarId);
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Estudiantes</h1>
          <p className="text-muted-foreground mt-1">Gestionar el registro y la información de los estudiantes.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => toast({ title: 'Función no implementada', description: 'La carga masiva de estudiantes estará disponible pronto.'})}>
            <Upload className="mr-2 h-4 w-4" /> Carga Masiva
          </Button>
          <StudentDialog onSuccess={fetchStudents}>
             <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Añadir Estudiante
            </Button>
          </StudentDialog>
        </div>
      </div>
      
      <StudentSearch onSearch={handleSearch} onClear={fetchStudents} isSearching={isSearching} />

      <Card className="shadow-subtle">
        <CardHeader>
          <CardTitle>Lista de Estudiantes</CardTitle>
          <CardDescription>
            Lista de todos los estudiantes registrados y el curso al que pertenecen.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Correo Electrónico</TableHead>
                <TableHead>Curso Asignado</TableHead>
                <TableHead>
                  <span className="sr-only">Acciones</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))
              ) : (
                students.map((student: Student) => {
                  const avatar = getAvatar(student.avatar);
                  return (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          {avatar ? (
                            <Image
                              src={avatar.imageUrl}
                              alt={student.name}
                              width={40}
                              height={40}
                              className="rounded-full"
                              data-ai-hint={avatar.imageHint}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-xs">
                              ?
                            </div>
                          )}
                          <div>
                            {student.name}
                            <div className="text-sm text-muted-foreground">{student.id}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {student.email}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {student.courseName || 'No asignado'}
                      </TableCell>
                      <TableCell>
                        <Dialog>
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
                               <DropdownMenuItem onSelect={() => setSelectedStudentId(String(student.id))}>
                                  Ver Detalles
                               </DropdownMenuItem>
                               <StudentDialog student={student} onSuccess={fetchStudents}>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                  Editar
                                </DropdownMenuItem>
                              </StudentDialog>
                              <DialogTrigger asChild>
                                <DropdownMenuItem>Ver Códigos</DropdownMenuItem>
                              </DialogTrigger>
                              <DropdownMenuSeparator />
                              <DeleteStudentDialog student={student} onSuccess={fetchStudents} />
                            </DropdownMenuContent>
                          </DropdownMenu>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle>Códigos para {student.name}</DialogTitle>
                              <DialogDescription>
                                Usa cualquiera de estos códigos para escanear la asistencia.
                              </DialogDescription>
                            </DialogHeader>
                            <Tabs defaultValue="qr" className="w-full">
                              <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="qr">Código QR</TabsTrigger>
                                <TabsTrigger value="barcode">Código de Barras</TabsTrigger>
                              </TabsList>
                              <TabsContent value="qr">
                                <div className="flex flex-col items-center justify-center p-4 bg-white rounded-md mt-4">
                                  <QRCodeSVG
                                    value={student.id}
                                    size={256}
                                    bgColor={"#ffffff"}
                                    fgColor={"#000000"}
                                    level={"L"}
                                    includeMargin={false}
                                  />
                                </div>
                              </TabsContent>
                              <TabsContent value="barcode">
                                <div className="flex flex-col items-center justify-center p-4 bg-white rounded-md mt-4">
                                  <Barcode value={student.id} />
                                </div>
                              </TabsContent>
                            </Tabs>
                            <div className="text-center text-sm text-muted-foreground pt-4">
                              ID de Estudiante: <Badge variant="secondary">{student.id}</Badge>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {selectedStudentId && (
        <StudentDetailsModal 
          studentId={selectedStudentId} 
          open={!!selectedStudentId}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setSelectedStudentId(null);
            }
          }}
        />
      )}
    </>
  );
}
