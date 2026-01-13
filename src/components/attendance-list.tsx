'use client';

import * as React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Attendance } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import { RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AttendanceListProps {
    key?: number; // allow forcing refresh from parent
}

export default function AttendanceList({ key }: AttendanceListProps) {
    const [attendance, setAttendance] = React.useState<Attendance[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [date, setDate] = React.useState<string>(format(new Date(), 'yyyy-MM-dd'));

    const fetchAttendance = React.useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/attendance?date=${date}`);
            if (response.ok) {
                const data = await response.json();
                setAttendance(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [date]);

    React.useEffect(() => {
        fetchAttendance();
    }, [fetchAttendance, key]);

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-muted/30 p-4 rounded-lg border border-white/5">
                <div className="flex items-center gap-4">
                    <span className="text-sm font-medium">Fecha de Reporte:</span>
                    <Input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-auto"
                    />
                </div>
                <Button variant="outline" size="sm" onClick={fetchAttendance} disabled={loading}>
                    <RefreshCcw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Actualizar
                </Button>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Hora</TableHead>
                        <TableHead>Estudiante</TableHead>
                        <TableHead>Grado/Sección</TableHead>
                        <TableHead>Estado</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading ? (
                        Array.from({ length: 5 }).map((_, index) => (
                            <TableRow key={index}>
                                <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                <TableCell>
                                    <div className="space-y-1">
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-3 w-20" />
                                    </div>
                                </TableCell>
                                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                            </TableRow>
                        ))
                    ) : attendance.length > 0 ? (
                        attendance.map((att) => (
                            <TableRow key={att.id}>
                                <TableCell className="font-mono text-muted-foreground">
                                    {att.hora_ingreso}
                                </TableCell>
                                <TableCell className="font-medium">
                                    <div>{att.nombres}</div>
                                    <div className="text-xs text-muted-foreground">ID: {att.estudiante_id}</div>
                                </TableCell>
                                <TableCell className="text-sm">
                                    {att.grado_descripcion} - {att.seccion_descripcion}
                                </TableCell>
                                <TableCell>
                                    <Badge variant={att.estado === 'Presente' ? 'default' : att.estado === 'Tardanza' ? 'secondary' : 'destructive'}>
                                        {att.estado}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center">
                                No hay registros de asistencia para hoy.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
