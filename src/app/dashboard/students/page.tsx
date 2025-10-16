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
import { MoreHorizontal, PlusCircle, Upload } from 'lucide-react';
import type { Student } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { QRCodeSVG } from 'qrcode.react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Barcode from 'react-barcode';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

export default function StudentsPage() {
  const [students, setStudents] = React.useState<Student[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { toast } = useToast();

  React.useEffect(() => {
    async function fetchStudents() {
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
    }
    fetchStudents();
  }, [toast]);

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
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" /> Carga Masiva
          </Button>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Añadir Estudiante
          </Button>
        </div>
      </div>
      <Card className="shadow-subtle">
        <CardHeader>
          <CardTitle>Lista de Estudiantes</CardTitle>
          <CardDescription>
            Lista de todos los estudiantes registrados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Correo Electrónico</TableHead>
                <TableHead>Fecha de Registro</TableHead>
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
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
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
                          {avatar && (
                            <Image
                              src={avatar.imageUrl}
                              alt={student.name}
                              width={40}
                              height={40}
                              className="rounded-full"
                              data-ai-hint={avatar.imageHint}
                            />
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
                        {new Date(student.registrationDate).toLocaleDateString()}
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
                              <DropdownMenuItem>Editar</DropdownMenuItem>
                              <DialogTrigger asChild>
                                <DropdownMenuItem>Ver Códigos</DropdownMenuItem>
                              </DialogTrigger>
                              <DropdownMenuItem className="text-destructive">
                                Eliminar
                              </DropdownMenuItem>
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
    </>
  );
}
