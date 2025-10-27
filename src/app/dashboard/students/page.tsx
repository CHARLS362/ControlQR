
'use client';

import * as React from 'react';
import Image from 'next/image';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Upload, LoaderCircle, Search, Filter } from 'lucide-react';
import type { Student, Grado, Section } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { QRCodeSVG } from 'qrcode.react';
import Barcode from 'react-barcode';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


const searchSchema = z.object({
  id: z.string().regex(/^[0-9]+$/, 'El ID debe ser un número.'),
});
type SearchFormValues = z.infer<typeof searchSchema>;

function StudentIdSearch({ onStudentFound }: { onStudentFound: (id: string) => void }) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: { id: '' },
  });

  const onSubmit = async (values: SearchFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/students/search?id=${values.id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Estudiante no encontrado.');
      }

      onStudentFound(String(data.id));
      form.reset();

    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error de Búsqueda',
        description: error instanceof Error ? error.message : 'Ocurrió un error inesperado.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
     <Card className="shadow-subtle mt-6">
        <CardHeader>
            <CardTitle>Buscar Estudiante por ID</CardTitle>
            <CardDescription>Introduce el ID numérico del estudiante para ver sus detalles.</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-start gap-4">
                <FormField
                control={form.control}
                name="id"
                render={({ field }) => (
                    <FormItem className="flex-grow">
                    <FormControl>
                        <Input type="text" inputMode="numeric" placeholder="Ej: 191" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                <Search className="mr-2 h-4 w-4" />
                Buscar
                </Button>
            </form>
            </Form>
        </CardContent>
    </Card>
  );
}


// --- Formulario de Filtro ---
function StudentFilter({
  onFilter,
  isLoading,
}: {
  onFilter: (gradeId: string, sectionId: string) => void;
  isLoading: boolean;
}) {
  const { toast } = useToast();
  const [gradeId, setGradeId] = React.useState<string>('');
  const [sectionId, setSectionId] = React.useState<string>('');

  const handleFilterSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!gradeId || !sectionId) {
          toast({
              variant: 'destructive',
              title: 'Datos incompletos',
              description: 'Por favor, introduce un ID de grado y un ID de sección para filtrar.'
          });
          return;
      }
      onFilter(gradeId, sectionId);
  }

  return (
    <Card className="shadow-subtle mt-6">
      <CardHeader>
        <CardTitle>Filtrar Estudiantes por Sección</CardTitle>
        <CardDescription>
          Introduce el ID del grado y la sección para ver la lista de estudiantes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleFilterSubmit} className="flex flex-col sm:flex-row items-end gap-4">
          <div className="w-full sm:w-1/3">
            <Label htmlFor="grade-id">ID de Grado</Label>
            <Input 
              id="grade-id"
              placeholder="Ej: 1"
              value={gradeId}
              onChange={(e) => setGradeId(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-1/3">
            <Label htmlFor="section-id">ID de Sección</Label>
            <Input
                id="section-id"
                placeholder="Ej: 21"
                value={sectionId}
                onChange={(e) => setSectionId(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
            {isLoading ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Filter className="mr-2 h-4 w-4" />}
            Filtrar
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}


export default function StudentsPage() {
  const [students, setStudents] = React.useState<Student[]>([]);
  const [loading, setLoading] = React.useState(false);
  const { toast } = useToast();
  const [selectedStudentId, setSelectedStudentId] = React.useState<string | null>(null);
  const [hasFiltered, setHasFiltered] = React.useState(false);

  const handleFilter = React.useCallback(async (gradeId: string, sectionId: string) => {
    setLoading(true);
    setHasFiltered(true);
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
  
  const handleStudentFound = (id: string) => {
      setSelectedStudentId(id);
  }

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
        <Button variant="outline" disabled onClick={() => toast({ title: 'Función no implementada', description: 'La carga masiva de estudiantes estará disponible pronto.'})}>
            <Upload className="mr-2 h-4 w-4" /> Carga Masiva
        </Button>
      </div>
      
      <Tabs defaultValue="filter" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-lg mx-auto bg-muted/50 p-1 h-auto rounded-lg">
          <TabsTrigger value="filter" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md">
            <Filter className="mr-2" />
            Filtrar por Sección
          </TabsTrigger>
          <TabsTrigger value="search" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md">
            <Search className="mr-2" />
            Buscar por ID
          </TabsTrigger>
        </TabsList>
        <TabsContent value="filter">
            <StudentFilter onFilter={handleFilter} isLoading={loading} />
            <Card className="shadow-subtle mt-6">
                <CardHeader>
                <CardTitle>Lista de Estudiantes</CardTitle>
                <CardDescription>
                    {hasFiltered ? 'Resultados del filtro.' : 'Usa los filtros para ver una lista de estudiantes.'}
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
                    ) : hasFiltered && students.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center">
                                No se encontraron estudiantes para los filtros seleccionados.
                            </TableCell>
                        </TableRow>
                    ) : !hasFiltered && students.length === 0 ? (
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
                                            value={String(student.id)} // Usar el ID para el QR
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
        </TabsContent>
        <TabsContent value="search">
            <StudentIdSearch onStudentFound={handleStudentFound} />
             <div className="text-center py-12 text-muted-foreground mt-6 border-2 border-dashed rounded-lg">
                <p>El detalle del estudiante se mostrará en un modal después de la búsqueda.</p>
            </div>
        </TabsContent>
      </Tabs>
      
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

    