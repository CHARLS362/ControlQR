
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { studentEnrollmentSchema, type StudentEnrollmentFormValues, type Grado, type Section } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { LoaderCircle, School } from 'lucide-react';

interface StudentEnrollmentFormProps {
  personId: number;
  onSuccess: () => void;
}

export default function StudentEnrollmentForm({ personId, onSuccess }: StudentEnrollmentFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [grades, setGrades] = React.useState<Grado[]>([]);
  const [sections, setSections] = React.useState<Section[]>([]);
  const [selectedGrade, setSelectedGrade] = React.useState<string>('');

  const form = useForm<StudentEnrollmentFormValues>({
    resolver: zodResolver(studentEnrollmentSchema),
    defaultValues: {
      persona_id: personId,
      anio_academico_id: 1, // Defaulting to 1 (e.g., 2025)
      seguro_id: 1, // Defaulting to 1 (e.g., "Sin especificar")
      grado_id: '',
      seccion_id: '',
      codigo: '',
      celular_emergencia: '',
      observacion: '',
    },
  });

  React.useEffect(() => {
    async function fetchGrades() {
        try {
            const response = await fetch('/api/grades');
            if (!response.ok) throw new Error('No se pudieron cargar los grados.');
            setGrades(await response.json());
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: error instanceof Error ? error.message : 'Error desconocido' });
        }
    }
    fetchGrades();
  }, [toast]);
  
  React.useEffect(() => {
      async function fetchSections() {
          if (!selectedGrade) {
              setSections([]);
              form.setValue('seccion_id', '');
              return;
          };
          try {
              const response = await fetch(`/api/sections/${selectedGrade}`);
              if (!response.ok) throw new Error('No se pudieron cargar las secciones.');
              setSections(await response.json());
          } catch (error) {
               toast({ variant: 'destructive', title: 'Error', description: error instanceof Error ? error.message : 'Error desconocido' });
          }
      }
      fetchSections();
  }, [selectedGrade, form, toast]);


  const onSubmit = async (values: StudentEnrollmentFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/student/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      
      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'Error al inscribir al estudiante.');
      }

      toast({
        title: 'Inscripción Exitosa',
        description: 'La persona ha sido inscrita como estudiante correctamente.',
      });
      onSuccess();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error en la Inscripción',
        description: error instanceof Error ? error.message : 'Ocurrió un error inesperado.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="grado_id" render={({ field }) => (
                <FormItem>
                    <FormLabel>Grado</FormLabel>
                    <Select onValueChange={(value) => { field.onChange(value); setSelectedGrade(value); }} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Seleccionar grado..." /></SelectTrigger></FormControl>
                        <SelectContent>
                        {grades.map((grade) => (
                            <SelectItem key={grade.id} value={String(grade.id)}>{grade.nombre}</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
            )}/>
             <FormField control={form.control} name="seccion_id" render={({ field }) => (
                <FormItem>
                    <FormLabel>Sección</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={!selectedGrade || sections.length === 0}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Seleccionar sección..." /></SelectTrigger></FormControl>
                        <SelectContent>
                        {sections.map((section) => (
                            <SelectItem key={section.id} value={String(section.id)}>{section.nombre}</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
            )}/>
            <FormField control={form.control} name="codigo" render={({ field }) => (
                <FormItem><FormLabel>Código de Estudiante</FormLabel><FormControl><Input {...field} placeholder="Asignar un código único" /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="celular_emergencia" render={({ field }) => (
                <FormItem><FormLabel>Celular de Emergencia</FormLabel><FormControl><Input {...field} placeholder="987654321" /></FormControl><FormMessage /></FormItem>
            )}/>
             <FormField control={form.control} name="anio_academico_id" render={({ field }) => (
                <FormItem>
                    <FormLabel>Año Académico</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Seleccionar año..." /></SelectTrigger></FormControl>
                        <SelectContent>
                            <SelectItem value="1">2025</SelectItem>
                            <SelectItem value="2">2024</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
            )}/>
             <FormField control={form.control} name="seguro_id" render={({ field }) => (
                <FormItem>
                    <FormLabel>Seguro</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Seleccionar seguro..." /></SelectTrigger></FormControl>
                        <SelectContent>
                            <SelectItem value="1">Sin especificar</SelectItem>
                            <SelectItem value="2">EsSalud</SelectItem>
                            <SelectItem value="3">SIS</SelectItem>
                            <SelectItem value="4">Privado</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
            )}/>
            <div className="md:col-span-2">
                 <FormField control={form.control} name="observacion" render={({ field }) => (
                    <FormItem><FormLabel>Observación (Opcional)</FormLabel><FormControl><Textarea {...field} placeholder="Anotaciones importantes sobre el estudiante." /></FormControl><FormMessage /></FormItem>
                )}/>
            </div>
        </div>

        <div className="flex justify-end pt-6">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
            <School className="mr-2 h-4 w-4" />
            Inscribir Estudiante
          </Button>
        </div>
      </form>
    </Form>
  );
}
