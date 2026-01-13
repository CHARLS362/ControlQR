'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle, Save, CheckCircle } from 'lucide-react';
import { attendanceSchema, type AttendanceFormValues } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';

interface AttendanceFormProps {
    onSuccess: () => void;
}

export default function AttendanceForm({ onSuccess }: AttendanceFormProps) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const form = useForm<AttendanceFormValues>({
        resolver: zodResolver(attendanceSchema),
        defaultValues: {
            estudiante_id: 0,
            fecha: format(new Date(), 'yyyy-MM-dd'),
            hora_ingreso: format(new Date(), 'HH:mm:ss'),
            asistencia_estado_id: 1, // Default 'Presente'
        },
    });

    async function onSubmit(values: AttendanceFormValues) {
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/attendance/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(values),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al registrar la asistencia.');
            }

            toast({
                title: 'Asistencia Registrada',
                description: data.message || 'El registro se guardó correctamente.',
            });
            form.reset({
                estudiante_id: 0,
                fecha: format(new Date(), 'yyyy-MM-dd'),
                hora_ingreso: format(new Date(), 'HH:mm:ss'),
                asistencia_estado_id: 1
            });
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
                    name="estudiante_id"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>ID del Estudiante</FormLabel>
                            <FormControl>
                                <Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="fecha"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Fecha</FormLabel>
                                <FormControl>
                                    <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="hora_ingreso"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Hora (HH:mm:ss)</FormLabel>
                                <FormControl>
                                    <Input type="time" step="1" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="asistencia_estado_id"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Estado</FormLabel>
                            <Select onValueChange={(val) => field.onChange(parseInt(val))} value={String(field.value)}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccione estado" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="1">Presente</SelectItem>
                                    <SelectItem value="2">Tardanza</SelectItem>
                                    <SelectItem value="3">Ausente</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Registrar Asistencia
                    </Button>
                </div>
            </form>
        </Form>
    );
}
