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
import { AcademicYear } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Institution } from '@/lib/types';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import AcademicYearForm from './academic-year-form';

interface AcademicYearListProps {
    onActionSuccess: () => void;
}

export default function AcademicYearList({ onActionSuccess }: AcademicYearListProps) {
    const [years, setYears] = React.useState<AcademicYear[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [institutions, setInstitutions] = React.useState<Institution[]>([]);
    const [selectedInstitution, setSelectedInstitution] = React.useState<string>("");
    const [editYear, setEditYear] = React.useState<AcademicYear | null>(null);
    const [isEditOpen, setIsEditOpen] = React.useState(false);
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

    // 2. Fetch Years when Institution changes
    const fetchYears = React.useCallback(async () => {
        if (!selectedInstitution) return;

        setLoading(true);
        setYears([]);
        try {
            const response = await fetch(`/api/academic-year?institutionId=${selectedInstitution}`);
            if (!response.ok) throw new Error('Error al cargar años académicos');
            const data = await response.json();
            setYears(data);
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron cargar los datos.' });
        } finally {
            setLoading(false);
        }
    }, [selectedInstitution, toast]);

    React.useEffect(() => {
        fetchYears();
    }, [fetchYears, onActionSuccess]);

    const handleEditSuccess = () => {
        setIsEditOpen(false);
        fetchYears();
        onActionSuccess();
    }

    return (
        <div className="space-y-4">
            {/* Institution Filter */}
            <div className="flex items-center space-x-4 p-4 bg-muted/30 rounded-lg border border-white/5">
                <Label htmlFor="inst-select" className="min-w-fit">Filtrar por Institución:</Label>
                <Select value={selectedInstitution} onValueChange={setSelectedInstitution}>
                    <SelectTrigger className="w-[300px]" id="inst-select">
                        <SelectValue placeholder="Seleccione una institución" />
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

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Año</TableHead>
                        <TableHead>Inicio Clases</TableHead>
                        <TableHead>Matrícula</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading ? (
                        Array.from({ length: 3 }).map((_, index) => (
                            <TableRow key={index}>
                                <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-10 ml-auto" /></TableCell>
                            </TableRow>
                        ))
                    ) : years.length > 0 ? (
                        years.map((y) => (
                            <TableRow key={y.id}>
                                <TableCell className="font-medium text-lg">{y.anio}</TableCell>
                                <TableCell>{y.fecha_inicio}</TableCell>
                                <TableCell className="text-muted-foreground text-sm">
                                    Del {y.fec_mat_inicio} al {y.fec_mat_fin}
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={y.estado === 'Activo' ? 'bg-green-500/10 text-green-500 border-green-500/20' : ''}>
                                        {y.estado || 'Registrado'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Dialog open={isEditOpen && editYear?.id === y.id} onOpenChange={(open) => { if (!open) setEditYear(null); setIsEditOpen(open); }}>
                                        <DialogTrigger asChild>
                                            <Button variant="ghost" size="icon" onClick={() => { setEditYear(y); setIsEditOpen(true); }}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Editar Año Académico</DialogTitle>
                                            </DialogHeader>
                                            {editYear && (
                                                <AcademicYearForm
                                                    academicYear={{
                                                        institucion_id: y.institucion_id,
                                                        anio: y.anio,
                                                        fec_mat_inicio: y.fec_mat_inicio,
                                                        fec_mat_fin: y.fec_mat_fin,
                                                        fec_mat_extemporaneo: y.fec_mat_extemporaneo,
                                                        fecha_inicio: y.fecha_inicio,
                                                        id: y.id
                                                    }}
                                                    onSuccess={handleEditSuccess}
                                                />
                                            )}
                                        </DialogContent>
                                    </Dialog>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center">
                                {selectedInstitution ? 'No se encontraron años académicos para esta institución.' : 'Seleccione una institución para ver los datos.'}
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
