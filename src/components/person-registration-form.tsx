
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { personaCompletaSchema, type PersonaCompletaFormValues, type FoundPerson, type Gender, type Grado } from '@/lib/types';
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
  const [genders, setGenders] = React.useState<Gender[]>([]);
  const [grades, setGrades] = React.useState<Grado[]>([]);
  const isEditMode = !!person;

  React.useEffect(() => {
    async function fetchGenders() {
      try {
        const response = await fetch('/api/genders');
        if (!response.ok) {
          throw new Error('No se pudieron cargar los géneros.');
        }
        const data = await response.json();
        setGenders(data);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error instanceof Error ? error.message : 'No se pudieron cargar los géneros.',
        });
      }
    }
    async function fetchGrades() {
        try {
            const response = await fetch('/api/grades');
            if (!response.ok) {
                throw new Error('No se pudieron cargar los grados.');
            }
            const data = await response.json();
            setGrades(data);
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error instanceof Error ? error.message : 'No se pudieron cargar los grados.',
            });
        }
    }
    fetchGenders();
    fetchGrades();
  }, [toast]);

  const form = useForm<PersonaCompletaFormValues>({
    resolver: zodResolver(personaCompletaSchema),
    defaultValues: isEditMode ? {
      ...person,
      documento_tipo_id: String(person.documento_tipo_id),
      genero_id: String(person.genero_id),
      ubigeo_nacimiento_id: String(person.ubigeo_nacimiento_id),
      domicilio_ubigeo_id: String(person.domicilio_ubigeo_id),
      persona_estado_id: String(person.persona_estado_id),
      celular_secundario: person.celular_secundario || '',
      correo_secundario: person.correo_secundario || '',
      grado_id: String(person.grado_id) || '',
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
      documento_tipo_id: '',
      genero_id: '',
      ubigeo_nacimiento_id: '',
      domicilio_ubigeo_id: '',
      persona_estado_id: '',
      grado_id: '',
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
        throw new Error(responseData.details?.message || responseData.message || `Error al ${isEditMode ? 'actualizar' : 'registrar'} la persona.`);
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
            <AccordionContent>
                <div className="grid md:grid-cols-3 gap-4 pt-4">
              <FormField control={form.control} name="documento_tipo_id" render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Documento</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
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
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger></FormControl>
                    <SelectContent>
                      {genders.map((gender) => (
                        <SelectItem key={gender.id} value={String(gender.id)}>
                          {gender.descripcion}
                        </SelectItem>
                      ))}
                    </SelectContent>
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
               <FormField control={form.control} name="grado_id" render={({ field }) => (
                <FormItem>
                  <FormLabel>Grado</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger></FormControl>
                    <SelectContent>
                      {grades.map((grade) => (
                        <SelectItem key={grade.id} value={String(grade.id)}>
                          {grade.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}/>
                <FormField control={form.control} name="ubigeo_nacimiento_id" render={({ field }) => (
                    <FormItem><FormLabel>Ubigeo Nacimiento</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Seleccionar Ubigeo..." /></SelectTrigger></FormControl>
                            <SelectContent><SelectItem value="140101">Lima</SelectItem><SelectItem value="040101">Arequipa</SelectItem></SelectContent>
                        </Select>
                    <FormMessage /></FormItem>
                )}/>
                </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger>Información de Contacto</AccordionTrigger>
            <AccordionContent>
                <div className="grid md:grid-cols-2 gap-4 pt-4">
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
                </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger>Información de Domicilio</AccordionTrigger>
            <AccordionContent>
                <div className="grid md:grid-cols-2 gap-4 pt-4">
                <FormField control={form.control} name="domicilio_ubigeo_id" render={({ field }) => (
                    <FormItem><FormLabel>Ubigeo Domicilio</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Seleccionar Ubigeo..." /></SelectTrigger></FormControl>
                            <SelectContent><SelectItem value="140101">Lima</SelectItem><SelectItem value="040101">Arequipa</SelectItem></SelectContent>
                        </Select>
                    <FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="domicilio" render={({ field }) => (
                    <FormItem><FormLabel>Dirección de Domicilio</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4">
            <AccordionTrigger>Estado de la Persona</AccordionTrigger>
            <AccordionContent>
                <div className="grid md:grid-cols-2 gap-4 pt-4">
                <FormField control={form.control} name="persona_estado_id" render={({ field }) => (
                    <FormItem><FormLabel>Estado</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Seleccionar Estado..." /></SelectTrigger></FormControl>
                            <SelectContent><SelectItem value="1">Activo</SelectItem><SelectItem value="0">Inactivo</SelectItem></SelectContent>
                        </Select>
                    <FormMessage /></FormItem>
                )}/>
                </div>
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
