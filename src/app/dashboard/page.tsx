'use client';

import { AreaChart } from '@tremor/react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';


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

const customTooltip = (props: any) => {
  const { payload, active } = props;
  if (!active || !payload) return null;
  return (
    <div className="w-56 rounded-tremor-default border border-tremor-border bg-tremor-background p-2 text-tremor-default shadow-tremor-dropdown">
      {payload.map((category: any, idx: number) => (
        <div key={idx} className="flex flex-1 space-x-2.5">
          <div className={`flex w-1 flex-col bg-${category.color}-500 rounded`} />
          <div className="space-y-1">
            <p className="text-tremor-content">{category.dataKey}</p>
            <p className="font-medium text-tremor-content-emphasis">{category.value} estudiantes</p>
          </div>
        </div>
      ))}
    </div>
  );
};


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
  
  const getAvatar = (avatarId: string) => {
    return PlaceHolderImages.find((img) => img.id === avatarId);
  };

  if (loading || !stats) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="flex flex-col gap-8 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-emerald-500 text-white shadow-lg">
                <CardContent className="p-6 flex justify-between items-start">
                    <div>
                        <p className="text-sm font-medium text-emerald-100">Total de Estudiantes</p>
                        <p className="text-4xl font-bold mt-1">{stats.totalStudents}</p>
                        <p className="text-xs text-emerald-100 mt-2">Registrados en el sistema</p>
                    </div>
                    <div className="bg-white/20 p-2 rounded-lg">
                        <Users className="h-6 w-6 text-white" />
                    </div>
                </CardContent>
            </Card>
            <Card className="bg-blue-500 text-white shadow-lg">
                <CardContent className="p-6 flex justify-between items-start">
                    <div>
                        <p className="text-sm font-medium text-blue-100">Total de Cursos</p>
                        <p className="text-4xl font-bold mt-1">{stats.totalCourses}</p>
                        <p className="text-xs text-blue-100 mt-2">Activos actualmente</p>
                    </div>
                    <div className="bg-white/20 p-2 rounded-lg">
                        <BookCopy className="h-6 w-6 text-white" />
                    </div>
                </CardContent>
            </Card>
            <Card className="bg-fuchsia-500 text-white shadow-lg">
                <CardContent className="p-6 flex justify-between items-start">
                    <div>
                        <p className="text-sm font-medium text-fuchsia-100">Total de Presentes</p>
                        <p className="text-4xl font-bold mt-1">{stats.totalPresent}</p>
                        <p className="text-xs text-fuchsia-100 mt-2">en los últimos 30 días</p>
                    </div>
                    <div className="bg-white/20 p-2 rounded-lg">
                        <CheckCircle className="h-6 w-6 text-white" />
                    </div>
                </CardContent>
            </Card>
            <Card className="bg-orange-500 text-white shadow-lg">
                <CardContent className="p-6 flex justify-between items-start">
                    <div>
                        <p className="text-sm font-medium text-orange-100">Total de Ausentes</p>
                        <p className="text-4xl font-bold mt-1">{stats.totalAbsent}</p>
                        <p className="text-xs text-orange-100 mt-2">en los últimos 30 días</p>
                    </div>
                    <div className="bg-white/20 p-2 rounded-lg">
                        <XCircle className="h-6 w-6 text-white" />
                    </div>
                </CardContent>
            </Card>
        </div>


      <div className="grid grid-cols-1 gap-8">
        <Card className="shadow-subtle">
            <CardHeader>
                 <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="font-headline">Resumen de Asistencia</CardTitle>
                        <CardDescription>Un resumen de la asistencia en los últimos 6 meses.</CardDescription>
                    </div>
                    <Tabs defaultValue="mes" className="w-[180px]">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="mes">Mes</TabsTrigger>
                            <TabsTrigger value="semana">Semana</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </CardHeader>
            <CardContent>
               <AreaChart
                    className="h-80"
                    data={stats.chartData}
                    index="month"
                    categories={['Presentes', 'Ausentes']}
                    colors={['emerald', 'rose']}
                    yAxisWidth={60}
                    curveType='monotone'
                    customTooltip={customTooltip}
                    showLegend={true}
                    showGridLines={true}
                 />
            </CardContent>
          </Card>
      </div>

       <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
         <div className="lg:col-span-3 space-y-8">
           <Card className="shadow-subtle">
              <CardHeader>
                  <CardTitle>Cursos con Mayor Asistencia</CardTitle>
                  <CardDescription>Top 4 de cursos con mejor porcentaje de asistencia.</CardDescription>
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
        </div>

        <div className="lg:col-span-2 space-y-8">
          <Card className="shadow-subtle">
              <CardHeader>
                  <CardTitle>Actividad Reciente</CardTitle>
                  <CardDescription>Últimos 5 registros de asistencia.</CardDescription>
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
