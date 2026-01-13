'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle, Save } from 'lucide-react';
import { academicYearSchema, type AcademicYearFormValues, type Institution } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AcademicYearFormProps {
    onSuccess: () => void;
    academicYear?: AcademicYearFormValues & { id?: number }; // Optional for edit mode in future
}

export default function AcademicYearForm({ onSuccess, academicYear }: AcademicYearFormProps) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [institutions, setInstitutions] = React.useState<Institution[]>([]);

    const form = useForm<AcademicYearFormValues>({
        resolver: zodResolver(academicYearSchema),
        defaultValues: academicYear || {
            institucion_id: undefined,
            anio: new Date().getFullYear(),
            fec_mat_inicio: '',
            fec_mat_fin: '',
            fec_mat_extemporaneo: '',
            fecha_inicio: '',
        },
    });

    React.useEffect(() => {
        async function fetchInstitutions() {
            try {
                const response = await fetch('/api/institutions');
                if (response.ok) {
                    const data = await response.json();
                    setInstitutions(data);
                }
            } catch (e) {
                console.error("Error loading institutions", e);
            }
        }
        fetchInstitutions();
    }, [])


    async function onSubmit(values: AcademicYearFormValues) {
        setIsSubmitting(true);
        try {
            const isEdit = !!academicYear?.id;
            const url = isEdit ? '/api/academic-year/update' : '/api/academic-year/register';
            const method = isEdit ? 'PUT' : 'POST';

            const payload = isEdit ? { ...values, id: academicYear?.id } : values;

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `Error al ${isEdit ? 'actualizar' : 'guardar'} el año académico.`);
            }

            toast({
                title: 'Éxito',
                description: `Año académico ${isEdit ? 'actualizado' : 'registrado'} correctamente.`,
            });

            if (!isEdit) {
                form.reset();
            }
            onSuccess();
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error instanceof Error ? error.message : 'Error desconocido',
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="institucion_id"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Institución</FormLabel>
                            <Select onValueChange={(val) => field.onChange(parseInt(val))} value={field.value ? String(field.value) : undefined}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccione una institución" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {institutions.map((inst) => (
                                        <SelectItem key={inst.id} value={String(inst.id)}>
                                            {inst.nombre}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="anio"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Año</FormLabel>
                            <FormControl>
                                <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="fec_mat_inicio"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Inicio Matrícula</FormLabel>
                                <FormControl>
                                    <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="fec_mat_fin"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Fin Matrícula</FormLabel>
                                <FormControl>
                                    <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="fec_mat_extemporaneo"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Matrícula Extemporánea</FormLabel>
                                <FormControl>
                                    <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="fecha_inicio"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Inicio de Clases</FormLabel>
                                <FormControl>
                                    <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                        <Save className="mr-2 h-4 w-4" />
                        Guardar
                    </Button>
                </div>
            </form>
        </Form>
    );
}
