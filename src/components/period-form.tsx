'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { periodSchema, type PeriodFormValues, type Period, type Institution, type AcademicYear } from '@/lib/types';
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
  const [institutions, setInstitutions] = React.useState<Institution[]>([]);
  const [academicYears, setAcademicYears] = React.useState<AcademicYear[]>([]);
  const [selectedInstitutionId, setSelectedInstitutionId] = React.useState<string>("");

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
      anio_academico_id: 0,
      nombre: '',
      fecha_inicio: '',
      fecha_fin: '',
    },
  });

  // 1. Fetch Institutions on mount
  React.useEffect(() => {
    async function fetchInstitutions() {
      try {
        const response = await fetch('/api/institutions');
        if (response.ok) {
          const data = await response.json();
          setInstitutions(data);
        }
      } catch (error) {
        console.error("Error fetching institutions:", error);
      }
    }
    fetchInstitutions();
  }, []);

  // 2. Fetch Academic Years when Institution changes
  React.useEffect(() => {
    if (!selectedInstitutionId) {
      setAcademicYears([]);
      return;
    }
    async function fetchYears() {
      try {
        const response = await fetch(`/api/academic-year?institutionId=${selectedInstitutionId}`);
        if (response.ok) {
          const data = await response.json();
          setAcademicYears(data);
        }
      } catch (error) {
        console.error("Error fetching academic years:", error);
      }
    }
    fetchYears();
  }, [selectedInstitutionId]);

  // Handle Edit Mode pre-fill (Needs logic to find institution from valid data, but for now we might handle simpler)
  // Since Period doesn't have institution_id directly, we might need to rely on the user re-selecting context or inferring it.
  // For simplicity in this iteration, we focus on Creation flow being robust. For Edit, we assume IDs are valid.

  React.useEffect(() => {
    if (isEditMode && period) {
      form.reset({
        id: period.id,
        anio_academico_id: period.anio_academico_id,
        nombre: period.nombre,
        fecha_inicio: period.fecha_inicio.split('T')[0],
        fecha_fin: period.fecha_fin.split('T')[0],
      });
      // In a real app, we'd fetch the institution of the period's academic year to pre-fill the selectors
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
        setSelectedInstitutionId("");
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

        {/* Institution Selector (Helper for Years) */}
        {!isEditMode && (
          <FormItem>
            <FormLabel>Institución</FormLabel>
            <Select onValueChange={setSelectedInstitutionId} value={selectedInstitutionId}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una institución" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {institutions.map(inst => (
                  <SelectItem key={inst.id} value={String(inst.id)}>{inst.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormItem>
        )}

        {/* Academic Year Selector (Actual Field) */}
        <FormField control={form.control} name="anio_academico_id" render={({ field }) => (
          <FormItem>
            <FormLabel>Año Académico</FormLabel>
            <Select
              onValueChange={(value) => field.onChange(parseInt(value))}
              value={field.value ? String(field.value) : undefined}
              disabled={academicYears.length === 0 && !isEditMode}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={academicYears.length === 0 ? "Selecciona institución primero" : "Selecciona un año"} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {academicYears.map(year => (
                  <SelectItem key={year.id} value={String(year.id)}>
                    {year.anio} {year.fec_mat_inicio ? `(${year.fec_mat_inicio})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />

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
