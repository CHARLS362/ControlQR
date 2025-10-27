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
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, PlusCircle, Upload, LoaderCircle, Search } from 'lucide-react';
import type { Student, StudentFormValues, Grado, Section } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { QRCodeSVG } from 'qrcode.react';
import Barcode from 'react-barcode';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { studentSchema } from '@/lib/types';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel as HookFormLabel,
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
import { StudentDetailsModal } from '@/components/student-details-modal';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

// --- Formulario de Filtro ---
function StudentFilter({
  onFilter,
  isLoading,
}: {
  onFilter: (gradeId: string, sectionId: string) => void;
  isLoading: boolean;
}) {
  const { toast } = useToast();
  const [grades, setGrades] = React.useState<Grado[]>([]);
  const [sections, setSections] = React.useState<Section[]>([]);
  const [selectedGrade, setSelectedGrade] = React.useState<string>('');
  const [selectedSection, setSelectedSection] = React.useState<string>('');
  const [isFetchingSections, setIsFetchingSections] = React.useState(false);

  React.useEffect(() => {
    async function fetchGrades() {
      try {
        const response = await fetch('/api/grades');
        const data = await response.json();
        setGrades(data);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'No se pudieron cargar los grados.',
        });
      }
    }
    fetchGrades();
  }, [toast]);

  const handleGradeChange = async (gradeId: string) => {
    setSelectedGrade(gradeId);
    setSelectedSection('');
    setSections([]);
    if (!gradeId) return;

    setIsFetchingSections(true);
    try {
      const response = await fetch(`/api/sections/${gradeId}`);
      const data = await response.json();
      setSections(data);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudieron cargar las secciones para este grado.',
      });
    } finally {
      setIsFetchingSections(false);
    }
  };
  
  const handleFilterSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedGrade || !selectedSection) {
          toast({
              variant: 'destructive',
              title: 'Selección incompleta',
              description: 'Por favor, selecciona un grado y una sección para filtrar.'
          });
          return;
      }
      onFilter(selectedGrade, selectedSection);
  }

  return (
    <Card className="shadow-subtle mb-6">
      <CardHeader>
        <CardTitle>Filtrar Estudiantes</CardTitle>
        <CardDescription>
          Selecciona un grado y una sección para ver la lista de estudiantes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleFilterSubmit} className="flex flex-col sm:flex-row items-end gap-4">
          <div className="w-full sm:w-1/3">
            <Label>Grado</Label>
            <Select value={selectedGrade} onValueChange={handleGradeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar grado..." />
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
          <div className="w-full sm:w-1/3">
            <Label>Sección</Label>
             <Select value={selectedSection} onValueChange={setSelectedSection} disabled={!selectedGrade || isFetchingSections}>
              <SelectTrigger>
                <SelectValue placeholder={isFetchingSections ? "Cargando..." : "Seleccionar sección..."} />
              </SelectTrigger>
              <SelectContent>
                 {sections.map((section) => (
                  <SelectItem key={section.id} value={String(section.id)}>
                    {section.nombre} ({section.turno})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
            {isLoading ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              <Search />
            )}
            <span className="ml-2">Buscar</span>
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// --- Formulario de Estudiante ---
function StudentForm({ student, onSuccess }: { student?: Student; onSuccess: () => void; }) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      name: student?.nombres || '',
      email: student?.correo_primario || '',
      courseId: '' // Este campo ya no se usa como antes
    },
  });

  const onSubmit = async (values: any) => {
    // La lógica de creación/edición necesitaría ser adaptada a los nuevos endpoints
    // Por ahora, esta función está deshabilitada para evitar errores.
     toast({
        title: 'Función no implementada',
        description: 'La creación y edición desde esta pantalla necesita ser actualizada.',
      });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <HookFormLabel>Nombre Completo</HookFormLabel>
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
              <HookFormLabel>Correo Electrónico</HookFormLabel>
              <FormControl>
                <Input type="email" placeholder="juan.perez@example.com" {...field} />
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
            {student ? 'Edita los detalles del estudiante.' : 'Completa el formulario para añadir un nuevo estudiante.'}
          </DialogDescription>
        </DialogHeader>
        <StudentForm student={student} onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}


export default function StudentsPage() {
  const [students, setStudents] = React.useState<Student[]>([]);
  const [loading, setLoading] = React.useState(false);
  const { toast } = useToast();
  const [selectedStudentId, setSelectedStudentId] = React.useState<string | null>(null);
  const [hasSearched, setHasSearched] = React.useState(false);

  const handleFilter = React.useCallback(async (gradeId: string, sectionId: string) => {
    setLoading(true);
    setHasSearched(true);
    setStudents([]);
    try {
      const response = await fetch(`/api/students?sectionId=${sectionId}`);
      if (!response.ok) {
        throw new Error('Error al cargar los estudiantes');
      }
      const data = await response.json();
      setStudents(data);
       if (data.length === 0) {
        toast({
            title: 'Sin resultados',
            description: 'No se encontraron estudiantes para la sección seleccionada.',
        });
      }
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

  const getAvatar = (gender: string) => {
      const avatarId = gender === 'Femenino' ? 'student-2' : 'student-1';
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
          <Button variant="outline" disabled onClick={() => toast({ title: 'Función no implementada', description: 'La carga masiva de estudiantes estará disponible pronto.'})}>
            <Upload className="mr-2 h-4 w-4" /> Carga Masiva
          </Button>
          <StudentDialog onSuccess={() => {}}>
             <Button disabled>
              <PlusCircle className="mr-2 h-4 w-4" /> Añadir Estudiante
            </Button>
          </StudentDialog>
        </div>
      </div>
      
      <StudentFilter onFilter={handleFilter} isLoading={loading} />

      <Card className="shadow-subtle">
        <CardHeader>
          <CardTitle>Lista de Estudiantes</CardTitle>
          <CardDescription>
            {hasSearched ? 'Resultados de la búsqueda.' : 'Selecciona un grado y sección para ver a los estudiantes.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>N° Documento</TableHead>
                <TableHead>Género</TableHead>
                <TableHead>Celular</TableHead>
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
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))
              ) : hasSearched && students.length === 0 ? (
                 <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                        No se encontraron estudiantes para los filtros seleccionados.
                    </TableCell>
                 </TableRow>
              ) : !hasSearched && students.length === 0 ? (
                 <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                        Usa los filtros de arriba para buscar estudiantes.
                    </TableCell>
                 </TableRow>
              ) : (
                students.map((student: Student) => {
                  const avatar = getAvatar(student.genero);
                  return (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          {avatar ? (
                            <Image
                              src={avatar.imageUrl}
                              alt={student.nombres}
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
                            {student.nombres}
                            <div className="text-sm text-muted-foreground">{student.correo_primario || 'Sin correo'}</div>
                          </div>
                        </div>
                      </TableCell>
                       <TableCell className="text-muted-foreground">
                        {student.documento_numero}
                      </TableCell>
                       <TableCell className="text-muted-foreground">
                        {student.genero}
                      </TableCell>
                       <TableCell className="text-muted-foreground">
                        {student.celular_primario}
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
                               <StudentDialog student={student} onSuccess={() => {}}>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} disabled>
                                  Editar
                                </DropdownMenuItem>
                              </StudentDialog>
                              <DialogTrigger asChild>
                                <DropdownMenuItem>Ver Códigos</DropdownMenuItem>
                              </DialogTrigger>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle>Códigos para {student.nombres}</DialogTitle>
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
                                    value={String(student.id)}
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
                                  <Barcode value={String(student.id)} />
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
