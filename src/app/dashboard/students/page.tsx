'use client';

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
import { students } from '@/lib/data';
import type { Student } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { QRCodeSVG } from 'qrcode.react';
import { Badge } from '@/components/ui/badge';

export default function StudentsPage() {
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
              {students.map((student: Student) => {
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
                      {student.registrationDate}
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
                              <DropdownMenuItem>Ver Código QR</DropdownMenuItem>
                            </DialogTrigger>
                            <DropdownMenuItem className="text-destructive">
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Código QR para {student.name}</DialogTitle>
                            <DialogDescription>
                              Este código QR único se utiliza para escanear la asistencia.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="flex items-center justify-center p-4 bg-white rounded-md">
                            <QRCodeSVG 
                              value={student.id} 
                              size={256}
                              bgColor={"#ffffff"}
                              fgColor={"#000000"}
                              level={"L"}
                              includeMargin={false}
                            />
                          </div>
                           <div className="text-center text-sm text-muted-foreground">
                                ID de Estudiante: <Badge variant="secondary">{student.id}</Badge>
                            </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
