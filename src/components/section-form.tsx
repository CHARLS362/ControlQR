
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { sectionSchema, type SectionFormValues } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { LoaderCircle, PlusCircle } from 'lucide-react';

export default function SectionForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<SectionFormValues>({
    resolver: zodResolver(sectionSchema),
    defaultValues: {
      grado_id: undefined,
      turno_id: undefined,
      tutor_personal_id: undefined,
      seccion_tipo_id: undefined,
      nombre: '',
      vacantes_total: undefined,
      aula: '',
    },
  });

  const onSubmit = async (values: SectionFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/sections/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'Error al registrar la sección.');
      }

      toast({
        title: 'Registro Exitoso',
        description: `La sección "${values.nombre}" ha sido registrada correctamente.`,
      });
      form.reset();
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error en el Registro',
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
                <FormControl><Input type="number" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="grado_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ID de Grado</FormLabel>
                <FormControl><Input type="number" placeholder="Ej: 1" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="turno_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ID de Turno</FormLabel>
                <FormControl><Input type="number" placeholder="Ej: 1" {...field} /></FormControl>
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
                <FormControl><Input type="number" placeholder="Ej: 15" {...field} /></FormControl>
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
                <FormControl><Input type="number" placeholder="Ej: 1" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
            <PlusCircle className="mr-2 h-4 w-4" />
            Registrar Sección
          </Button>
        </div>
      </form>
    </Form>
  );
}
