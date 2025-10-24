
'use client';

import { Pie, PieChart, Cell, Legend, Tooltip } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { BookCopy, Users, CheckCircle, XCircle } from 'lucide-react';
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

type Stats = {
    totalStudents: number;
    totalCourses: number;
    totalPresent: number;
    totalAbsent: number;
    chartData: { month: string, present: number, absent: number }[];
}

const COLORS = ['#10B981', '#F43F5E']; // Verde Esmeralda y Rojo Rosa

export default function Dashboard() {
  const [stats, setStats] = React.useState<Stats | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/stats/dashboard');
        if (!response.ok) {
          throw new Error('Failed to fetch stats');
        }
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

  if (loading || !stats) {
    return (
      <div className="flex flex-col gap-8 py-8">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Estudiantes</CardTitle>
              <Skeleton className="h-6 w-6" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-4 w-48" />
            </CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Cursos</CardTitle>
              <Skeleton className="h-6 w-6" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-4 w-44" />
            </CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Presentes</CardTitle>
              <Skeleton className="h-6 w-6" />
            </CardHeader>
            <CardContent>
               <Skeleton className="h-8 w-16 mb-1" />
               <Skeleton className="h-4 w-32" />
            </CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Ausentes</CardTitle>
              <Skeleton className="h-6 w-6" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-4 w-32" />
            </CardContent>
          </Card>
        </div>
        <Card className="shadow-subtle">
          <CardHeader>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-5 w-96 mt-2" />
          </CardHeader>
          <CardContent className="flex justify-center items-center">
            <Skeleton className="min-h-[250px] w-[250px] rounded-full" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-4 w-80" />
          </CardFooter>
        </Card>
      </div>
    )
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
            <p className="text-xs text-white/70">+2 desde el mes pasado</p>
          </CardContent>
        </Card>
        <Card className="shadow-subtle bg-gradient text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Cursos</CardTitle>
            <BookCopy className="h-6 w-6 text-white/80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalCourses}</div>
            <p className="text-xs text-white/70">+1 desde el último semestre</p>
          </CardContent>
        </Card>
        <Card className="shadow-subtle bg-gradient text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Presentes</CardTitle>
            <CheckCircle className="h-6 w-6 text-white/80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalPresent}</div>
            <p className="text-xs text-white/70">en los últimos 30 días</p>
          </CardContent>
        </Card>
        <Card className="shadow-subtle bg-gradient text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Ausentes</CardTitle>
            <XCircle className="h-6 w-6 text-white/80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalAbsent}</div>
            <p className="text-xs text-white/70">en los últimos 30 días</p>
          </CardContent>
        </Card>
      </div>
      <Card className="shadow-subtle">
        <CardHeader>
          <CardTitle className="font-headline">Distribución General de Asistencia</CardTitle>
          <CardDescription>
            Proporción de asistencia registrada en los últimos 30 días.
          </CardDescription>
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
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                labelLine={false}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
               <Legend
                  content={({ payload }) => {
                    return (
                      <ul className="flex flex-wrap gap-x-4 gap-y-1 justify-center mt-4">
                        {payload?.map((entry, index) => (
                          <li key={`item-${index}`} className="flex items-center gap-2">
                            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
                            <span className="text-sm text-muted-foreground">{entry.value}</span>
                          </li>
                        ))}
                      </ul>
                    )
                  }}
                />
            </PieChart>
          </ChartContainer>
        </CardContent>
        <CardFooter>
          <div className="text-xs text-muted-foreground">
            Mostrando la distribución total de la asistencia.
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
