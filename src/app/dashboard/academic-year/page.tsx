'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { List, PlusCircle, Link as LinkIcon } from 'lucide-react';
import AcademicYearForm from '@/components/academic-year-form';
import AcademicYearList from '@/components/academic-year-list';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { academicYearGradeAssignmentSchema, type AcademicYearGradeAssignmentFormValues, type Grado } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LoaderCircle } from 'lucide-react';

function AssignGradesForm() {
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
        if (response.ok) setGrades(await response.json());
      } catch (error) {
        console.error("Error fetching grades", error);
      }
    }
    fetchGrades();
  }, []);

  const onSubmit = async (values: AcademicYearGradeAssignmentFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/academic-year/assign-grades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error al asignar');

      toast({ title: 'Asignación Exitosa', description: 'Grados asignados correctamente.' });
      form.reset();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: error instanceof Error ? error.message : 'Error desconocido' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="anio_academico_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Año Académico (ID)</FormLabel>
              {/* Note: In a real app this should be a dynamic select of the Created Years */}
              <Select onValueChange={(value) => field.onChange(parseInt(value))} value={String(field.value ?? '')}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione ID de año" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="1">1 (2025)</SelectItem>
                  <SelectItem value="2">2 (2026)</SelectItem>
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
                <FormLabel className="text-base">Grados Disponibles</FormLabel>
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
            <LinkIcon className="mr-2 h-4 w-4" /> Asignar
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default function AcademicYearPage() {
  const [activeTab, setActiveTab] = React.useState("list");
  const [refreshKey, setRefreshKey] = React.useState(0);

  const handleSuccess = () => {
    setRefreshKey(prev => prev + 1);
    setActiveTab("list");
  };

  return (
    <div className="space-y-8 py-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Gestión de Año Académico</h1>
        <p className="text-muted-foreground mt-1">
          Administra los periodos anuales, sus fechas de matrícula y asignación de grados.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto bg-muted/50 p-1 h-auto rounded-lg">
          <TabsTrigger value="list" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md">
            <List className="mr-2" />
            Listar Años
          </TabsTrigger>
          <TabsTrigger value="create" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md">
            <PlusCircle className="mr-2" />
            Nuevo Año
          </TabsTrigger>
          <TabsTrigger value="assign" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md">
            <LinkIcon className="mr-2" />
            Asignar Grados
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-6">
          <Card className="shadow-subtle">
            <CardHeader>
              <CardTitle>Años Registrados</CardTitle>
              <CardDescription>Historial de configuraciones anuales.</CardDescription>
            </CardHeader>
            <CardContent>
              <AcademicYearList key={refreshKey} onActionSuccess={handleSuccess} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create" className="mt-6">
          <Card className="shadow-subtle max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Registrar Año Académico</CardTitle>
              <CardDescription>Define las fechas clave para el ciclo escolar.</CardDescription>
            </CardHeader>
            <CardContent>
              <AcademicYearForm onSuccess={handleSuccess} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assign" className="mt-6">
          <Card className="shadow-subtle max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Asignación de Grados</CardTitle>
              <CardDescription>Habiliita los grados para un año específico.</CardDescription>
            </CardHeader>
            <CardContent>
              <AssignGradesForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
