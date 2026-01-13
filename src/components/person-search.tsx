
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { LoaderCircle, Search, User, Calendar, Phone, Hash, Fingerprint, Edit, GraduationCap, School } from 'lucide-react';
import type { FoundPerson } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import PersonRegistrationForm from './person-registration-form';
import StudentEnrollmentForm from './student-enrollment-form';

const searchSchema = z.object({
  name: z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres.' }),
});

type SearchFormValues = z.infer<typeof searchSchema>;


function EnrollmentDialog({ person, onEnrollmentSuccess }: { person: FoundPerson, onEnrollmentSuccess: () => void }) {
    const [open, setOpen] = React.useState(false);

    const handleSuccess = () => {
        setOpen(false);
        onEnrollmentSuccess();
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="secondary" className="w-full">
                    <School className="mr-2 h-4 w-4" /> Inscribir como Estudiante
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Inscribir a {person.nombres}</DialogTitle>
                    <DialogDescription>
                        Completa los datos para inscribir a esta persona como estudiante.
                    </DialogDescription>
                </DialogHeader>
                <StudentEnrollmentForm personId={person.id} onSuccess={handleSuccess} />
            </DialogContent>
        </Dialog>
    );
}

function PersonResultCard({ person, onActionSuccess }: { person: FoundPerson, onActionSuccess: () => void }) {
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  
  const handleSuccess = () => {
    setIsEditOpen(false);
    onActionSuccess();
  }

  return (
    <Card className="shadow-subtle flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
            <User /> {person.nombres} {person.apellido_paterno} {person.apellido_materno}
        </CardTitle>
        <CardDescription>ID de Persona: {person.id}</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm flex-grow">
          <div className="flex items-center gap-2">
              <Fingerprint className="text-muted-foreground w-4 h-4" />
              <strong>Documento:</strong> {person.documento_numero}
          </div>
          <div className="flex items-center gap-2">
              <Hash className="text-muted-foreground w-4 h-4" />
              <strong>Género:</strong> {person.genero}
          </div>
          <div className="flex items-center gap-2">
              <Calendar className="text-muted-foreground w-4 h-4" />
              <strong>Fecha Nac.:</strong> {format(parseISO(person.fecha_nacimiento), 'dd/MM/yyyy')}
          </div>
           <div className="flex items-center gap-2">
              <Phone className="text-muted-foreground w-4 h-4" />
              <strong>Celular:</strong> {person.celular_primario}
          </div>
           <div className="flex items-center gap-2">
              <GraduationCap className="text-muted-foreground w-4 h-4" />
              <strong>Grado:</strong> {person.grado || 'No asignado'}
          </div>
      </CardContent>
       <CardFooter className="flex-col sm:flex-row gap-2">
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogTrigger asChild>
            <Button className="w-full">
              <Edit className="mr-2 h-4 w-4" /> Editar Persona
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl w-[90vw] lg:w-full">
            <DialogHeader>
              <DialogTitle>Editar Persona</DialogTitle>
            </DialogHeader>
            <PersonRegistrationForm person={person} onSuccess={handleSuccess} />
          </DialogContent>
        </Dialog>
        <EnrollmentDialog person={person} onEnrollmentSuccess={onActionSuccess} />
      </CardFooter>
    </Card>
  )
}


export default function PersonSearch() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [results, setResults] = React.useState<FoundPerson[]>([]);
  const [hasSearched, setHasSearched] = React.useState(false);

  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: { name: '' },
  });

  const onSubmit = async (values: SearchFormValues) => {
    setIsSubmitting(true);
    setHasSearched(true);
    setResults([]);
    try {
      const response = await fetch(`/api/person/search?name=${encodeURIComponent(values.name)}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al buscar personas.');
      }
      
      setResults(data);
      if(data.length === 0) {
        toast({
            title: 'Sin resultados',
            description: 'No se encontraron personas con ese nombre.',
        });
      }

    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error de Búsqueda',
        description: error instanceof Error ? error.message : 'Ocurrió un error inesperado.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleActionSuccess = () => {
    // Re-ejecutar la última búsqueda para refrescar los datos
    if (form.getValues('name')) {
        form.handleSubmit(onSubmit)();
    }
  };


  return (
    <div className="space-y-6">
        <Card className="shadow-subtle">
            <CardHeader>
                <CardTitle>Buscar Persona por Nombre</CardTitle>
                <CardDescription>Introduce el nombre de la persona que deseas buscar en el sistema externo.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col sm:flex-row items-start gap-4">
                    <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem className="flex-grow w-full">
                        <FormControl>
                            <Input placeholder="Ej: Juan Pérez" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                    {isSubmitting ? (
                        <LoaderCircle className="animate-spin" />
                    ) : (
                        <Search />
                    )}
                    <span className="ml-2">Buscar</span>
                    </Button>
                </form>
                </Form>
            </CardContent>
        </Card>
        
        <Separator />
        
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">Resultados de la Búsqueda</h3>
            {isSubmitting ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Skeleton className="h-56 w-full" />
                    <Skeleton className="h-56 w-full" />
                </div>
            ) : results.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {results.map(person => <PersonResultCard key={person.id} person={person} onActionSuccess={handleActionSuccess} />)}
                </div>
            ) : hasSearched ? (
                 <div className="text-center py-12 text-muted-foreground">
                    <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No se encontraron resultados para tu búsqueda.</p>
                </div>
            ) : (
                 <div className="text-center py-12 text-muted-foreground">
                    <p>Los resultados de tu búsqueda aparecerán aquí.</p>
                </div>
            )}
        </div>
    </div>
  );
}
