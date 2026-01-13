
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { gradeSchema, type GradeFormValues } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { LoaderCircle, PlusCircle, Save } from 'lucide-react';
import { Textarea } from './ui/textarea';

interface GradeFormProps {
  onSuccess: () => void;
}

export default function GradeForm({ onSuccess }: GradeFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<GradeFormValues>({
    resolver: zodResolver(gradeSchema),
    defaultValues: {
      nombre: '',
      descripcion: '',
    },
  });

  const onSubmit = async (values: GradeFormValues) => {
    setIsSubmitting(true);
    try {
      const url = '/api/grades/register';
      const method = 'POST';

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'Error al registrar el grado.');
      }

      toast({
        title: 'Registro Exitoso',
        description: `El grado "${values.nombre}" ha sido registrado correctamente.`,
      });
      
      onSuccess();
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
        <div className="grid md:grid-cols-1 gap-6">
          <FormField
            control={form.control}
            name="nombre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre del Grado</FormLabel>
                <FormControl><Input placeholder="Ej: Primero de Secundaria" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="descripcion"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descripción (Opcional)</FormLabel>
                <FormControl><Textarea placeholder="Una breve descripción del grado académico..." {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
            <PlusCircle className="mr-2 h-4 w-4" />Registrar Grado
          </Button>
        </div>
      </form>
    </Form>
  );
}
