
'use client';

import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { academicYearGradeAssignmentSchema, type AcademicYearGradeAssignmentFormValues, type Grado } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LoaderCircle, Link as LinkIcon } from 'lucide-react';

export default function AcademicYearPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [grades, setGrades] = React.useState<Grado[]>([]);

  const form = useForm<AcademicYearGradeAssignmentFormValues>({
    resolver: zodResolver(academicYearGradeAssignmentSchema),
    defaultValues: {
      anio_academico_id: undefined,
      grado_ids: [],
    },
  });
  
  React.useEffect(() => {
    async function fetchGrades() {
      try {
        const response = await fetch('/api/grades');
        if (!response.ok) throw new Error('No se pudieron cargar los grados.');
        setGrades(await response.json());
      } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron cargar los grados para la selección.' });
      }
    }
    fetchGrades();
  }, [toast]);


  const onSubmit = async (values: AcademicYearGradeAssignmentFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/academic-year/assign-grades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'Error al asignar los grados.');
      }

      toast({
        title: 'Asignación Exitosa',
        description: 'Los grados han sido asignados al año académico correctamente.',
      });
      form.reset();

    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error en la Asignación',
        description: error instanceof Error ? error.message : 'Ocurrió un error inesperado.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 py-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Gestión de Año Académico</h1>
        <p className="text-muted-foreground mt-1">
          Asigna los grados que estarán disponibles para un año académico específico.
        </p>
      </div>

      <Card className="shadow-subtle max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Asignar Grados a Año Académico</CardTitle>
          <CardDescription>Selecciona un año y los grados que le corresponden.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="anio_academico_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Año Académico</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))} value={String(field.value ?? '')}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un año académico" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">2025</SelectItem>
                        <SelectItem value="2">2024</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="grado_ids"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Grados</FormLabel>
                    </div>
                    <ScrollArea className="h-48 w-full rounded-md border p-4">
                        {grades.map((grade) => (
                        <FormField
                            key={grade.id}
                            control={form.control}
                            name="grado_ids"
                            render={({ field }) => {
                            return (
                                <FormItem
                                key={grade.id}
                                className="flex flex-row items-center space-x-3 space-y-0 py-2"
                                >
                                <FormControl>
                                    <Checkbox
                                    checked={field.value?.includes(grade.id)}
                                    onCheckedChange={(checked) => {
                                        return checked
                                        ? field.onChange([...field.value, grade.id])
                                        : field.onChange(
                                            field.value?.filter(
                                                (value) => value !== grade.id
                                            )
                                            )
                                    }}
                                    />
                                </FormControl>
                                <FormLabel className="font-normal w-full cursor-pointer">
                                    {grade.nombre}
                                </FormLabel>
                                </FormItem>
                            )
                            }}
                        />
                        ))}
                    </ScrollArea>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                  <LinkIcon className="mr-2 h-4 w-4" /> Asignar Grados
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
