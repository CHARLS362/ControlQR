
'use client';

import { Pie, PieChart, Cell, Legend, Tooltip, Area, AreaChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LegendProps } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { BookCopy, Users, CheckCircle, XCircle, Clock } from 'lucide-react';
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import type { DashboardStats } from '@/lib/types';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const PIE_COLORS = ['#10B981', '#F43F5E']; // Verde Esmeralda y Rojo Rosa

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-8 py-8">
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-6 w-6" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-4 w-48" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-8">
          <Card className="shadow-subtle">
            <CardHeader>
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-5 w-96 mt-2" />
            </CardHeader>
            <CardContent className="flex justify-center items-center">
              <Skeleton className="h-[250px] w-[250px] rounded-full" />
            </CardContent>
          </Card>
           <Card className="shadow-subtle">
            <CardHeader>
              <Skeleton className="h-8 w-72" />
              <Skeleton className="h-5 w-80 mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[250px] w-full" />
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
               <Skeleton className="h-8 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({length: 3}).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </CardContent>
          </Card>
           <Card>
            <CardHeader>
               <Skeleton className="h-8 w-56" />
            </CardHeader>
            <CardContent className="space-y-4">
               {Array.from({length: 4}).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

const CustomAreaChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col space-y-1">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              {label}
            </span>
            {payload.map((entry: any) => (
               <span key={entry.name} className="font-bold" style={{ color: entry.stroke }}>
                {entry.name}: {entry.value}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const CustomLegend = (props: LegendProps) => {
    const { payload } = props;
    return (
        <ul className="flex justify-center gap-6 pt-4">
        {
            payload?.map((entry, index) => (
            <li key={`item-${index}`} className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full" style={{backgroundColor: entry.color}} />
                <span className="text-sm text-muted-foreground">{entry.value}</span>
            </li>
            ))
        }
        </ul>
    );
}

export default function Dashboard() {
  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/stats/dashboard');
        if (!response.ok) throw new Error('Failed to fetch stats');
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);
  
  const pieData = stats ? [
      { name: 'Presentes', value: stats.totalPresent },
      { name: 'Ausentes', value: stats.totalAbsent },
    ] : [];

  const getAvatar = (avatarId: string) => {
    return PlaceHolderImages.find((img) => img.id === avatarId);
  };

  if (loading || !stats) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="flex flex-col gap-8 py-8">
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card className="shadow-subtle bg-gradient text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Estudiantes</CardTitle>
            <Users className="h-6 w-6 text-white/80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-white/70">Registrados en el sistema</p>
          </CardContent>
        </Card>
        <Card className="shadow-subtle bg-gradient text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Cursos</CardTitle>
            <BookCopy className="h-6 w-6 text-white/80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalCourses}</div>
            <p className="text-xs text-white/70">Activos actualmente</p>
          </CardContent>
        </Card>
        <Card className="shadow-subtle bg-gradient text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Presentes (30 días)</CardTitle>
            <CheckCircle className="h-6 w-6 text-white/80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalPresent}</div>
            <p className="text-xs text-white/70">Registros de asistencia</p>
          </CardContent>
        </Card>
        <Card className="shadow-subtle bg-gradient text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ausentes (30 días)</CardTitle>
            <XCircle className="h-6 w-6 text-white/80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalAbsent}</div>
            <p className="text-xs text-white/70">Registros de asistencia</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-8">
          <Card className="shadow-subtle">
            <CardHeader>
              <CardTitle className="font-headline">Distribución General de Asistencia</CardTitle>
              <CardDescription>Proporción de asistencia (presentes vs. ausentes) en los últimos 30 días.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center items-center">
              <ChartContainer config={{}} className="min-h-[250px] w-full max-w-[250px]">
                <PieChart>
                  <Tooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        hideLabel
                        formatter={(value, name, props) => (
                           <div className="flex items-center gap-2">
                             <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: props.fill}}></div>
                             <span>{name}:</span>
                             <span className="font-bold">{value} ({((value as number / (stats.totalPresent + stats.totalAbsent)) * 100).toFixed(1)}%)</span>
                           </div>
                        )}
                      />
                    }
                  />
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} labelLine={false}>
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                   <Legend content={({ payload }) => (
                      <ul className="flex flex-wrap gap-x-4 gap-y-1 justify-center mt-4">
                        {payload?.map((entry, index) => (
                          <li key={`item-${index}`} className="flex items-center gap-2">
                            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
                            <span className="text-sm text-muted-foreground">{entry.value}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>
          <Card className="shadow-subtle">
              <CardHeader>
                  <CardTitle className="font-headline">Tendencia de Asistencia Mensual</CardTitle>
                  <CardDescription>Resumen de asistencia de los últimos 6 meses.</CardDescription>
              </CardHeader>
              <CardContent>
                  <ChartContainer config={{}} className="min-h-[250px] w-full">
                      <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={stats.chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorAbsent" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#F97316" stopOpacity={0.4}/>
                                    <stop offset="95%" stopColor="#F97316" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.5)" />
                            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={10} fontSize={12} />
                            <YAxis tickLine={false} axisLine={false} tickMargin={10} fontSize={12} allowDecimals={false} />
                            <Tooltip cursor={{fill: 'hsl(var(--accent) / 0.1)', stroke: 'hsl(var(--accent))', strokeWidth: 1}} content={<CustomAreaChartTooltip />} />
                            <Legend content={<CustomLegend />} />
                            <Area type="monotone" dataKey="present" stroke="#3B82F6" fill="url(#colorPresent)" name="Presentes" strokeWidth={2} />
                            <Area type="monotone" dataKey="absent" stroke="#F97316" fill="url(#colorAbsent)" name="Ausentes" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                  </ChartContainer>
              </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-8">
            <Card className="shadow-subtle">
              <CardHeader>
                  <CardTitle>Cursos con Mayor Asistencia</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                  {stats.topCourses.length > 0 ? stats.topCourses.map(course => (
                      <div key={course.id}>
                          <div className="flex justify-between items-center mb-1">
                              <span className="text-sm font-medium text-foreground">{course.name}</span>
                              <span className="text-sm font-bold text-primary">{course.attendancePercentage.toFixed(1)}%</span>
                          </div>
                          <Progress value={course.attendancePercentage} className="h-2" />
                      </div>
                  )) : (
                      <p className="text-sm text-muted-foreground text-center py-4">No hay datos de asistencia suficientes.</p>
                  )}
              </CardContent>
          </Card>
          <Card className="shadow-subtle">
              <CardHeader>
                  <CardTitle>Actividad Reciente</CardTitle>
              </CardHeader>
              <CardContent>
                  <ul className="space-y-4">
                      {stats.recentAttendance.length > 0 ? stats.recentAttendance.map(att => {
                          const avatar = getAvatar(att.studentAvatar);
                          return (
                              <li key={att.id} className="flex items-center gap-4">
                                  {avatar ? (
                                    <Image src={avatar.imageUrl} alt={att.studentName} width={40} height={40} className="rounded-full" data-ai-hint={avatar.imageHint} />
                                  ) : (
                                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-xs">?</div>
                                  )}
                                  <div className="flex-1">
                                      <p className="font-medium text-sm">{att.studentName}</p>
                                      <p className="text-xs text-muted-foreground">{att.courseName}</p>
                                  </div>
                                  <div className="text-right">
                                    <Badge variant={att.status === 'Presente' ? 'default' : 'destructive'} className="capitalize bg-opacity-20 border-opacity-40 text-current">{att.status}</Badge>
                                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 justify-end"><Clock className="h-3 w-3" /> {format(new Date(att.date), 'HH:mm')}</p>
                                  </div>
                              </li>
                          )
                      }) : (
                          <p className="text-sm text-muted-foreground text-center py-4">No hay registros de asistencia recientes.</p>
                      )}
                  </ul>
              </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

    