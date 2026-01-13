'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, Tooltip as RechartsTooltip } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Badge } from '@/components/ui/badge';
import { Users, BookCopy, CheckCircle, XCircle, Clock, LoaderCircle, GraduationCap } from 'lucide-react';
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { DashboardStats, Attendance } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

function StatCard({ 
    title, 
    value, 
    icon: Icon, 
    changeText, 
    gradientColors 
}: { 
    title: string, 
    value: string, 
    icon: React.ElementType, 
    changeText: string,
    gradientColors: string,
}) {
    return (
        <Card className={cn("text-white p-6 relative overflow-hidden shadow-lg", gradientColors)}>
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium text-white/90">{title}</p>
                    <p className="text-4xl font-bold mt-1">{value}</p>
                </div>
                <div className="p-3 rounded-lg bg-white/20">
                    <Icon className="h-6 w-6 text-white" />
                </div>
            </div>
            <div className="text-xs text-white/90 mt-4">{changeText}</div>
        </Card>
    );
}

export default function Dashboard() {
  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [loading, setLoading] = React.useState(true);
  const { toast } = useToast();

  React.useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      try {
        const response = await fetch(`/api/stats/dashboard`);
        if (!response.ok) {
          throw new Error('No se pudieron cargar las estadísticas del panel.');
        }
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: error instanceof Error ? error.message : 'No se pudieron cargar las estadísticas.',
        });
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [toast]);
  

  if (loading || !stats) {
    return (
      <div className="flex flex-col gap-8 py-8">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <Skeleton className="h-36 w-full" />
          <Skeleton className="h-36 w-full" />
          <Skeleton className="h-36 w-full" />
          <Skeleton className="h-36 w-full" />
        </div>
        <div className="grid md:grid-cols-2 gap-8">
            <Card className="shadow-subtle">
              <CardHeader>
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-5 w-96 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="min-h-[250px] w-full" />
              </CardContent>
            </Card>
             <Card className="shadow-subtle">
              <CardHeader>
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-5 w-64 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="min-h-[250px] w-full" />
              </CardContent>
            </Card>
        </div>
      </div>
    )
  }

  const chartConfig = {
    presentes: { label: 'Presentes', color: 'hsl(var(--chart-2))' },
    ausentes: { label: 'Ausentes', color: 'hsl(var(--chart-5))' },
  };
  
  const today = format(new Date(), "eeee, dd 'de' MMMM", { locale: es });

  const badgeVariant = (status: Attendance['estado']) => {
    switch (status) {
        case 'Presente': return 'default';
        case 'Tardanza': return 'secondary';
        case 'Ausente': return 'destructive';
        default: return 'outline';
    }
  };


  return (
    <div className="flex flex-col gap-8 py-8">
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <StatCard 
            title="Total de Personas"
            value={stats.totalPersons.toString()}
            icon={Users}
            changeText="+20 desde el mes pasado"
            gradientColors="bg-gradient-to-br from-green-400 to-green-600"
        />
        <StatCard 
            title="Total de Grados"
            value={stats.totalGrades.toString()}
            icon={GraduationCap}
            changeText="+1 desde el último semestre"
            gradientColors="bg-gradient-to-br from-blue-400 to-blue-600"
        />
        <StatCard 
            title="Presentes (Hoy)"
            value={stats.totalPresentToday.toString()}
            icon={CheckCircle}
            changeText="Registros de asistencia hoy"
            gradientColors="bg-gradient-to-br from-purple-400 to-pink-600"
        />
        <StatCard 
            title="Ausentes (Hoy)"
            value={stats.totalAbsentToday.toString()}
            icon={XCircle}
            changeText="Estimado de ausencias hoy"
            gradientColors="bg-gradient-to-br from-yellow-400 to-orange-500"
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <Card className="lg:col-span-3 shadow-subtle">
            <CardHeader>
                <CardTitle className="font-headline">Asistencia de Hoy por Grado</CardTitle>
                <CardDescription>
                    Resumen de presentes y ausentes por grado para el día de hoy, <span className="capitalize">{today}</span>.
                </CardDescription>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ChartContainer config={chartConfig} className="h-full w-full">
                <BarChart data={stats.todayAttendanceByGrade} layout="vertical" margin={{ left: 10, right: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis type="category" dataKey="gradeName" width={100} tick={{ fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
                  <RechartsTooltip cursor={{ fill: 'hsl(var(--muted))', opacity: 0.5 }} content={<ChartTooltipContent indicator="dot" />} />
                  <Legend content={({ payload }) => (
                    <div className="flex justify-center gap-4 pt-4">
                      {payload?.map((entry, index) => (
                        <div key={`item-${index}`} className="flex items-center gap-1.5">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                          <span className="text-sm text-muted-foreground">{entry.value}</span>
                        </div>
                      ))}
                    </div>
                  )}/>
                  <Bar dataKey="presentes" stackId="a" fill="var(--color-presentes)" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="ausentes" stackId="a" fill="var(--color-ausentes)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
        </Card>
        
        <Card className="lg:col-span-2 shadow-subtle">
            <CardHeader>
                <CardTitle>Registros Recientes</CardTitle>
                <CardDescription>Últimos 5 registros de asistencia del día.</CardDescription>
            </CardHeader>
            <CardContent>
                {stats.recentAttendance.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Estudiante</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Hora</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {stats.recentAttendance.map((att: Attendance) => (
                                <TableRow key={att.id}>
                                    <TableCell className="font-medium">
                                        <div className="truncate">{att.nombres}</div>
                                        <div className="text-xs text-muted-foreground truncate">{att.grado_descripcion} - {att.seccion_descripcion}</div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={badgeVariant(att.estado)}>
                                            {att.estado}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right text-muted-foreground">
                                        {format(parseISO(att.fecha_hora), 'HH:mm:ss')}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center h-full min-h-[250px] text-muted-foreground">
                        <Clock className="w-12 h-12 mb-4 opacity-50" />
                        <p className="font-semibold">Sin registros de asistencia hoy.</p>
                        <p className="text-sm">Los nuevos registros aparecerán aquí.</p>
                    </div>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
