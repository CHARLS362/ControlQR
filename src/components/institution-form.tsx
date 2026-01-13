
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { institutionSchema, type InstitutionFormValues, type Institution } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { LoaderCircle, PlusCircle, Save } from 'lucide-react';

interface InstitutionFormProps {
  institution?: Institution;
  onSuccess: () => void;
}

export default function InstitutionForm({ institution, onSuccess }: InstitutionFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const isEditMode = !!institution;

  const form = useForm<InstitutionFormValues>({
    resolver: zodResolver(institutionSchema),
    defaultValues: isEditMode ? {
        id: institution.id,
        codigo_modular: Number(institution.codigo_modular),
        nombre: institution.nombre,
        direccion: institution.direccion,
        latitud: institution.latitud || '',
        longitud: institution.longitud || '',
        ubigeo: Number(institution.ubigeo),
    } : {
      codigo_modular: undefined,
      nombre: '',
      direccion: '',
      latitud: '',
      longitud: '',
      ubigeo: undefined,
    },
  });

   React.useEffect(() => {
    if (isEditMode && institution) {
      form.reset({
        id: institution.id,
        codigo_modular: Number(institution.codigo_modular),
        nombre: institution.nombre,
        direccion: institution.direccion,
        latitud: institution.latitud || '',
        longitud: institution.longitud || '',
        ubigeo: Number(institution.ubigeo),
      });
    }
  }, [institution, isEditMode, form]);

  const onSubmit = async (values: InstitutionFormValues) => {
    setIsSubmitting(true);
    try {
      const url = isEditMode ? `/api/institutions/${institution.id}` : '/api/institutions/register';
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || `Error al ${isEditMode ? 'actualizar' : 'registrar'} la institución.`);
      }

      toast({
        title: isEditMode ? 'Actualización Exitosa' : 'Registro Exitoso',
        description: `La institución "${values.nombre}" ha sido ${isEditMode ? 'actualizada' : 'registrada'} correctamente.`,
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
                <FormLabel>Nombre de la Institución</FormLabel>
                <FormControl><Input placeholder="Ej: I.E. San Juan" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="codigo_modular"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código Modular</FormLabel>
                <FormControl><Input type="number" placeholder="Ej: 123456" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="direccion"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Dirección</FormLabel>
                <FormControl><Input placeholder="Ej: Av. Principal 123" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="latitud"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Latitud (Opcional)</FormLabel>
                <FormControl><Input placeholder="Ej: -12.046374" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="longitud"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Longitud (Opcional)</FormLabel>
                <FormControl><Input placeholder="Ej: -77.042793" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="ubigeo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ubigeo</FormLabel>
                <FormControl><Input type="number" placeholder="Ej: 140101" {...field} /></FormControl>
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
