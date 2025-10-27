
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { personaCompletaSchema, type PersonaCompletaFormValues, type FoundPerson } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { LoaderCircle, Save } from 'lucide-react';

interface PersonRegistrationFormProps {
  person?: FoundPerson;
  onSuccess?: () => void;
}

export default function PersonRegistrationForm({ person, onSuccess }: PersonRegistrationFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const isEditMode = !!person;

  const form = useForm<PersonaCompletaFormValues>({
    resolver: zodResolver(personaCompletaSchema),
    defaultValues: isEditMode ? {
      ...person,
      // Los campos opcionales podrían ser null, los convertimos a string vacío
      celular_secundario: person.celular_secundario || '',
      correo_secundario: person.correo_secundario || '',
    } : {
      documento_numero: '',
      apellido_paterno: '',
      apellido_materno: '',
      nombres: '',
      fecha_nacimiento: '',
      celular_primario: '',
      celular_secundario: '',
      correo_primario: '',
      correo_secundario: '',
      domicilio: '',
    },
  });

  const onSubmit = async (values: PersonaCompletaFormValues) => {
    setIsSubmitting(true);
    try {
      const url = isEditMode ? `/api/person/${person.id}` : '/api/person/register';
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      
      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || `Error al ${isEditMode ? 'actualizar' : 'registrar'} la persona.`);
      }

      toast({
        title: isEditMode ? 'Actualización Exitosa' : 'Registro Exitoso',
        description: `La persona ha sido ${isEditMode ? 'actualizada' : 'registrada'} correctamente.`,
      });
      
      if (onSuccess) {
        onSuccess();
      }
      if (!isEditMode) {
        form.reset();
      }

    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: `Error en la ${isEditMode ? 'Actualización' : 'Registro'}`,
        description: error instanceof Error ? error.message : 'Ocurrió un error inesperado.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Accordion type="multiple" defaultValue={['item-1', 'item-2', 'item-3', 'item-4']} className="w-full">
          
          <AccordionItem value="item-1">
            <AccordionTrigger>Información Personal y Documentación</AccordionTrigger>
            <AccordionContent className="grid md:grid-cols-3 gap-4 pt-4">
              <FormField control={form.control} name="documento_tipo_id" render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Documento</FormLabel>
                  <Select onValueChange={field.onChange} value={String(field.value)}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger></FormControl>
                    <SelectContent><SelectItem value="1">DNI</SelectItem><SelectItem value="2">Pasaporte</SelectItem></SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}/>
              <FormField control={form.control} name="documento_numero" render={({ field }) => (
                <FormItem><FormLabel>N° de Documento</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
               <FormField control={form.control} name="genero_id" render={({ field }) => (
                <FormItem>
                  <FormLabel>Género</FormLabel>
                  <Select onValueChange={field.onChange} value={String(field.value)}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger></FormControl>
                    <SelectContent><SelectItem value="1">Masculino</SelectItem><SelectItem value="2">Femenino</SelectItem></SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}/>
              <FormField control={form.control} name="apellido_paterno" render={({ field }) => (
                <FormItem><FormLabel>Apellido Paterno</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="apellido_materno" render={({ field }) => (
                <FormItem><FormLabel>Apellido Materno</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="nombres" render={({ field }) => (
                <FormItem><FormLabel>Nombres</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
               <FormField control={form.control} name="fecha_nacimiento" render={({ field }) => (
                 <FormItem><FormLabel>Fecha de Nacimiento</FormLabel><FormControl><Input placeholder="YYYY-MM-DD" {...field} /></FormControl><FormMessage /></FormItem>
               )}/>
                <FormField control={form.control} name="ubigeo_nacimiento_id" render={({ field }) => (
                    <FormItem><FormLabel>Ubigeo Nacimiento</FormLabel>
                        <Select onValueChange={field.onChange} value={String(field.value)}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Seleccionar Ubigeo..." /></SelectTrigger></FormControl>
                            <SelectContent><SelectItem value="140101">Lima</SelectItem><SelectItem value="040101">Arequipa</SelectItem></SelectContent>
                        </Select>
                    <FormMessage /></FormItem>
                )}/>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger>Información de Contacto</AccordionTrigger>
            <AccordionContent className="grid md:grid-cols-2 gap-4 pt-4">
               <FormField control={form.control} name="celular_primario" render={({ field }) => (
                <FormItem><FormLabel>Celular Principal</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
               <FormField control={form.control} name="celular_secundario" render={({ field }) => (
                <FormItem><FormLabel>Celular Secundario (Opcional)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
               <FormField control={form.control} name="correo_primario" render={({ field }) => (
                <FormItem><FormLabel>Correo Principal</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
               <FormField control={form.control} name="correo_secundario" render={({ field }) => (
                <FormItem><FormLabel>Correo Secundario (Opcional)</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger>Información de Domicilio</AccordionTrigger>
            <AccordionContent className="grid md:grid-cols-2 gap-4 pt-4">
                <FormField control={form.control} name="domicilio_ubigeo_id" render={({ field }) => (
                    <FormItem><FormLabel>Ubigeo Domicilio</FormLabel>
                        <Select onValueChange={field.onChange} value={String(field.value)}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Seleccionar Ubigeo..." /></SelectTrigger></FormControl>
                            <SelectContent><SelectItem value="140101">Lima</SelectItem><SelectItem value="040101">Arequipa</SelectItem></SelectContent>
                        </Select>
                    <FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="domicilio" render={({ field }) => (
                    <FormItem><FormLabel>Dirección de Domicilio</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4">
            <AccordionTrigger>Estado de la Persona</AccordionTrigger>
            <AccordionContent className="grid md:grid-cols-2 gap-4 pt-4">
                <FormField control={form.control} name="persona_estado_id" render={({ field }) => (
                    <FormItem><FormLabel>Estado</FormLabel>
                        <Select onValueChange={field.onChange} value={String(field.value)}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Seleccionar Estado..." /></SelectTrigger></FormControl>
                            <SelectContent><SelectItem value="1">Activo</SelectItem><SelectItem value="0">Inactivo</SelectItem></SelectContent>
                        </Select>
                    <FormMessage /></FormItem>
                )}/>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <div className="flex justify-end pt-6">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            {isEditMode ? 'Actualizar Persona' : 'Registrar Persona'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
