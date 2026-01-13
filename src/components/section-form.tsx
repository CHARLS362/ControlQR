
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { sectionSchema, type SectionFormValues, type Section, type Grado } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { LoaderCircle, PlusCircle, Save } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface SectionFormProps {
  section?: Section;
  onSuccess: () => void;
}

export default function SectionForm({ section, onSuccess }: SectionFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [grades, setGrades] = React.useState<Grado[]>([]);
  const isEditMode = !!section;

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

  const form = useForm<SectionFormValues>({
    resolver: zodResolver(sectionSchema),
    defaultValues: isEditMode ? {
      ...section,
      grado_id: section.grado_id,
      turno_id: section.turno_id,
      tutor_personal_id: section.tutor_personal_id,
      seccion_tipo_id: section.seccion_tipo_id,
      vacantes_total: section.vacantes_total,
    } : {
      grado_id: undefined,
      turno_id: undefined,
      tutor_personal_id: undefined,
      seccion_tipo_id: undefined,
      nombre: '',
      vacantes_total: undefined,
      aula: '',
    },
  });

  React.useEffect(() => {
    if (isEditMode && section) {
      form.reset({
        ...section,
        grado_id: section.grado_id,
        turno_id: section.turno_id,
        tutor_personal_id: section.tutor_personal_id,
        seccion_tipo_id: section.seccion_tipo_id,
        vacantes_total: section.vacantes_total,
      });
    }
  }, [section, isEditMode, form]);

  const onSubmit = async (values: SectionFormValues) => {
    setIsSubmitting(true);
    try {
      const url = isEditMode ? `/api/sections/${section.id}` : '/api/sections/register';
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || `Error al ${isEditMode ? 'actualizar' : 'registrar'} la sección.`);
      }

      toast({
        title: isEditMode ? 'Actualización Exitosa' : 'Registro Exitoso',
        description: `La sección "${values.nombre}" ha sido ${isEditMode ? 'actualizada' : 'registrada'} correctamente.`,
      });
      
      onSuccess();
      if (!isEditMode) {
        form.reset();
      }

    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: `Error en ${isEditMode ? 'la Actualización' : 'el Registro'}`,
        description: error instanceof Error ? error.message : 'Ocurrió un error inesperado.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="nombre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre de la Sección</FormLabel>
                <FormControl><Input placeholder="Ej: A" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="aula"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre del Aula</FormLabel>
                <FormControl><Input placeholder="Ej: 101" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="vacantes_total"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total de Vacantes</FormLabel>
                <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField control={form.control} name="grado_id" render={({ field }) => (
            <FormItem>
                <FormLabel>Grado</FormLabel>
                <Select onValueChange={(value) => field.onChange(parseInt(value))} value={String(field.value)}>
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
          <FormField
            control={form.control}
            name="turno_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ID de Turno</FormLabel>
                <FormControl><Input type="number" placeholder="Ej: 1" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="tutor_personal_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ID del Tutor</FormLabel>
                <FormControl><Input type="number" placeholder="Ej: 15" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)}/></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="seccion_tipo_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ID Tipo de Sección</FormLabel>
                <FormControl><Input type="number" placeholder="Ej: 1" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
            {isEditMode ? <><Save className="mr-2 h-4 w-4" />Actualizar</> : <><PlusCircle className="mr-2 h-4 w-4" />Registrar</>}
          </Button>
        </div>
      </form>
    </Form>
  );
}
