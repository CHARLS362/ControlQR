
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { periodSchema, type PeriodFormValues, type Period } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { LoaderCircle, PlusCircle, Save } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface PeriodFormProps {
  period?: Period;
  onSuccess: () => void;
}

export default function PeriodForm({ period, onSuccess }: PeriodFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const isEditMode = !!period;

  const form = useForm<PeriodFormValues>({
    resolver: zodResolver(periodSchema),
    defaultValues: isEditMode ? {
      id: period.id,
      anio_academico_id: period.anio_academico_id,
      nombre: period.nombre,
      fecha_inicio: period.fecha_inicio,
      fecha_fin: period.fecha_fin,
    } : {
      anio_academico_id: undefined,
      nombre: '',
      fecha_inicio: '',
      fecha_fin: '',
    },
  });

  React.useEffect(() => {
    if (isEditMode && period) {
      form.reset({
        id: period.id,
        anio_academico_id: period.anio_academico_id,
        nombre: period.nombre,
        fecha_inicio: period.fecha_inicio.split('T')[0], // API might return full ISO string
        fecha_fin: period.fecha_fin.split('T')[0],
      });
    }
  }, [period, isEditMode, form]);

  const onSubmit = async (values: PeriodFormValues) => {
    setIsSubmitting(true);
    try {
      const url = isEditMode ? `/api/periods/${period.id}` : '/api/periods/register';
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || `Error al ${isEditMode ? 'actualizar' : 'registrar'} el periodo.`);
      }

      toast({
        title: isEditMode ? 'Actualización Exitosa' : 'Registro Exitoso',
        description: `El periodo "${values.nombre}" ha sido ${isEditMode ? 'actualizado' : 'registrado'}.`,
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
        <div className="grid md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="nombre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre del Periodo</FormLabel>
                <FormControl><Input placeholder="Ej: Primer Bimestre" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField control={form.control} name="anio_academico_id" render={({ field }) => (
            <FormItem>
              <FormLabel>Año Académico</FormLabel>
              <Select onValueChange={(value) => field.onChange(parseInt(value))} value={String(field.value ?? '')}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un año" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="1">2025</SelectItem>
                  <SelectItem value="2">2024</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}/>
          <FormField
            control={form.control}
            name="fecha_inicio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de Inicio</FormLabel>
                <FormControl><Input type="date" placeholder="YYYY-MM-DD" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="fecha_fin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de Fin</FormLabel>
                <FormControl><Input type="date" placeholder="YYYY-MM-DD" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
            {isEditMode ? <><Save className="mr-2 h-4 w-4" />Actualizar Periodo</> : <><PlusCircle className="mr-2 h-4 w-4" />Registrar Periodo</>}
          </Button>
        </div>
      </form>
    </Form>
  );
}
