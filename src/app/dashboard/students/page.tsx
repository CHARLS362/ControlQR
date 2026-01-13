
'use client';

import * as React from 'react';
import Image from 'next/image';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Upload, LoaderCircle, Search, Filter, FileDown } from 'lucide-react';
import type { Student, StudentDetails } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { StudentDetailsModal } from '@/components/student-details-modal';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StudentCodes } from '@/components/student-codes';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';


function StudentSearch({ onStudentFound }: { onStudentFound: (id: string) => void }) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState('');
  const [searchType, setSearchType] = React.useState<'id' | 'doc'>('id');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchValue) {
      toast({
        variant: 'destructive',
        title: 'Valor Requerido',
        description: `Por favor, introduce el ${searchType === 'id' ? 'ID del estudiante' : 'N° de documento'} para buscar.`,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const queryParam = searchType === 'id' ? `id=${searchValue}` : `doc=${searchValue}`;
      const response = await fetch(`/api/students/search?${queryParam}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Estudiante no encontrado.');
      }

      onStudentFound(String(data.id));
      setSearchValue('');

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

  const handleSearchTypeChange = (value: 'id' | 'doc') => {
    setSearchType(value);
    setSearchValue(''); // Reset input when changing type
  }

  return (
    <Card className="shadow-subtle mt-6">
      <CardHeader>
        <CardTitle>Buscar Estudiante</CardTitle>
        <CardDescription>Introduce el ID o N° de Documento del estudiante para ver sus detalles.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSearch} className="space-y-4">
          <RadioGroup value={searchType} onValueChange={handleSearchTypeChange} className="flex gap-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="id" id="search-id" />
              <Label htmlFor="search-id">ID de Estudiante</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="doc" id="search-doc" />
              <Label htmlFor="search-doc">N° Documento</Label>
            </div>
          </RadioGroup>
          <div className="flex items-start gap-4">
            <Input
              type="text"
              inputMode={searchType === 'id' ? 'numeric' : 'text'}
              placeholder={searchType === 'id' ? 'Ej: 191' : 'Ej: 71234567'}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
              <Search className="mr-2 h-4 w-4" />
              Buscar
            </Button>
          </div>
        </form>
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
  const [isExporting, setIsExporting] = React.useState(false);
  const [exportStudentDetails, setExportStudentDetails] = React.useState<StudentDetails[]>([]);

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

  const handleExportPDF = async () => {
    if (students.length === 0) return;
    setIsExporting(true);
    toast({
      title: 'Iniciando exportación',
      description: `Preparando los datos de ${students.length} estudiantes. Esto puede tardar un momento...`
    });

    try {
      const studentDetailsPromises = students.map(s =>
        fetch(`/api/students/details/${s.id}`).then(async res => {
          if (!res.ok) throw new Error(`Failed to fetch details for student ${s.id}`);
          const data = await res.json();
          // Inject document number from the list if missing in details
          return { ...data, documento_numero: data.documento_numero || s.documento_numero };
        })
      );
      const details = await Promise.all(studentDetailsPromises);
      setExportStudentDetails(details);

      // We need to wait for the state to update and the hidden elements to render
      setTimeout(generatePdfFromDOM, 100);

    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Error de exportación', description: 'No se pudieron obtener todos los detalles de los estudiantes.' });
      setIsExporting(false);
    }
  };

  const generatePdfFromDOM = async () => {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: 'a4'
    });

    const studentElements = document.querySelectorAll('.pdf-student-card');
    if (studentElements.length === 0) {
      toast({ variant: 'destructive', title: 'Error', description: 'No se encontraron elementos para exportar.' });
      setIsExporting(false);
      return;
    }

    // Configuración A4 (aprox 794px x 1123px a 96DPI)
    // Ajustamos para 8 por página (2 columnas x 4 filas)
    const pdfWidth = pdf.internal.pageSize.getWidth();
    // const pdfHeight = pdf.internal.pageSize.getHeight();

    // Márgenes
    const marginX = 20;
    const marginY = 20;

    // Dimensiones de tarjeta en PDF
    const cardWidth = 240;
    const cardHeight = 150;

    // Espaciado automático
    const contentWidth = pdfWidth - (marginX * 2);
    const gapX = contentWidth - (cardWidth * 2);
    const gapY = 30; // Más espacio vertical

    for (let i = 0; i < studentElements.length; i++) {
      const element = studentElements[i] as HTMLElement;

      // Renderizar a alta calidad
      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      const imgData = canvas.toDataURL('image/png');

      const col = i % 2;

      // Nueva página cada 8 items
      if (i > 0 && i % 8 === 0) {
        pdf.addPage();
      }

      // Recalcular row para la página actual (siempre 0 a 3)
      const row = Math.floor((i % 8) / 2);

      const x = marginX + (col * (cardWidth + gapX));
      const y = marginY + (row * (cardHeight + gapY));

      pdf.addImage(imgData, 'PNG', x, y, cardWidth, cardHeight);
    }

    pdf.save(`codigos-estudiantes-${new Date().toISOString().slice(0, 10)}.pdf`);

    setExportStudentDetails([]);
    setIsExporting(false);
    toast({ title: 'Exportación completada', description: `Se generó el PDF con ${studentElements.length} códigos.` });
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
        <Button variant="outline" disabled onClick={() => toast({ title: 'Función no implementada', description: 'La carga masiva de estudiantes estará disponible pronto.' })}>
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
            Buscar Estudiante
          </TabsTrigger>
        </TabsList>
        <TabsContent value="filter">
          <StudentFilter onFilter={handleFilter} isLoading={loading} />
          <Card className="shadow-subtle mt-6">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Lista de Estudiantes</CardTitle>
                  <CardDescription>
                    {hasFiltered ? 'Resultados del filtro.' : 'Usa los filtros para ver una lista de estudiantes.'}
                  </CardDescription>
                </div>
                <Button onClick={handleExportPDF} disabled={students.length === 0 || isExporting}>
                  {isExporting ? <LoaderCircle className="mr-2 animate-spin" /> : <FileDown className="mr-2" />}
                  Exportar Códigos a PDF
                </Button>
              </div>
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
                              </DropdownMenuContent>
                            </DropdownMenu>
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
          <StudentSearch onStudentFound={handleStudentFound} />
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

      {/* Hidden container for PDF export */}
      {isExporting && exportStudentDetails.length > 0 && (
        <div className="absolute -left-[9999px] top-0 opacity-0" aria-hidden="true">
          {exportStudentDetails.map((detail, index) => (
            <div key={`pdf-card-${detail.id}-${index}`} className="pdf-student-card bg-white border border-slate-300 rounded-xl p-0 overflow-hidden flex flex-row shadow-sm" style={{ width: '400px', height: '250px' }}>

              {/* Left: QR Area with ID */}
              <div className="w-[160px] bg-slate-50 flex flex-col items-center justify-center p-4 border-r border-slate-200 gap-2">
                <StudentCodes details={detail} />
                <div className="text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Código</span>
                  <span className="text-xs font-mono text-slate-700 font-bold block leading-none">{detail.codigo}</span>
                </div>
              </div>

              {/* Right: Info Area */}
              <div className="flex-1 p-5 flex flex-col justify-between bg-white relative">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-[9px] uppercase tracking-widest text-[#1546b3] font-bold bg-blue-50 px-2 py-0.5 rounded-full">Estudiante</div>
                    <div className="h-6 w-6 rounded-lg bg-[#0f2452] flex items-center justify-center">
                      <span className="text-white font-bold text-[10px]">QR</span>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 leading-tight mb-3 line-clamp-2 uppercase">{detail.nombres}</h3>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-[10px] text-slate-600 border-b border-slate-50 pb-1">
                      <span className="font-semibold text-slate-900 w-12">Grado:</span>
                      <span className="text-slate-700">{detail.grado}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-600 border-b border-slate-50 pb-1">
                      <span className="font-semibold text-slate-900 w-12">Sección:</span>
                      <span className="text-slate-700">{detail.seccion}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-600">
                      <span className="font-semibold text-slate-900 w-12">DNI:</span>
                      <span className="text-slate-700 font-mono tracking-wide">{detail.documento_numero || '---'}</span>
                    </div>
                  </div>
                </div>

                <div className="text-[8px] text-slate-400 text-right italic mt-2">
                  Sistema de Control Institucional
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </>
  );
}
