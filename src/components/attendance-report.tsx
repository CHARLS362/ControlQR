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
import { Attendance, Institution } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import { RefreshCcw, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export default function AttendanceReport() {
    const [attendance, setAttendance] = React.useState<Attendance[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [date, setDate] = React.useState<string>(format(new Date(), 'yyyy-MM-dd'));
    const [institutions, setInstitutions] = React.useState<Institution[]>([]);
    const [selectedInstitution, setSelectedInstitution] = React.useState<string>("");
    const { toast } = useToast();

    // 1. Fetch Institutions
    React.useEffect(() => {
        async function fetchInstitutions() {
            try {
                const response = await fetch('/api/institutions');
                if (response.ok) {
                    const data = await response.json();
                    setInstitutions(data);
                    if (data.length > 0) {
                        setSelectedInstitution(String(data[0].id));
                    }
                }
            } catch (error) {
                console.error("Error fetching institutions:", error);
            }
        }
        fetchInstitutions();
    }, []);

    const fetchReport = React.useCallback(async () => {
        if (!selectedInstitution) return;

        setLoading(true);
        setAttendance([]);
        try {
            const response = await fetch(`/api/attendance/report?date=${date}&institutionId=${selectedInstitution}`);
            if (response.ok) {
                const data = await response.json();
                setAttendance(data);
            } else {
                throw new Error("Error fetching report");
            }
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron cargar los reportes.' });
        } finally {
            setLoading(false);
        }
    }, [date, selectedInstitution, toast]);

    React.useEffect(() => {
        fetchReport();
    }, [fetchReport]);

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-muted/30 p-4 rounded-lg border border-white/5 gap-4">

                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="inst-select">Institución</Label>
                        <Select value={selectedInstitution} onValueChange={setSelectedInstitution}>
                            <SelectTrigger className="w-[280px]" id="inst-select">
                                <SelectValue placeholder="Seleccione institución" />
                            </SelectTrigger>
                            <SelectContent>
                                {institutions.map((inst) => (
                                    <SelectItem key={inst.id} value={String(inst.id)}>
                                        {inst.nombre}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="date-select">Fecha</Label>
                        <Input
                            id="date-select"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-[180px]"
                        />
                    </div>
                </div>

                <Button variant="outline" size="sm" onClick={fetchReport} disabled={loading || !selectedInstitution}>
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
                                    <div className="text-xs text-muted-foreground">DNI: {att.estudiante_id}</div>
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
                            <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                                <div className="flex flex-col items-center justify-center gap-2">
                                    <FileText className="h-8 w-8 opacity-20" />
                                    <p>{selectedInstitution ? 'No hay reportes para los filtros seleccionados.' : 'Seleccione una institución.'}</p>
                                </div>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
