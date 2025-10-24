'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
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
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { BookCopy, Users, CheckCircle, XCircle } from 'lucide-react';
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const chartConfig = {
  present: {
    label: 'Presente',
    color: 'hsl(var(--chart-2))',
  },
  absent: {
    label: 'Ausente',
    color: 'hsl(var(--chart-5))',
  },
};

type Stats = {
    totalStudents: number;
    totalCourses: number;
    totalPresent: number;
    totalAbsent: number;
    chartData: { month: string, present: number, absent: number }[];
}

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
          <CardContent>
            <Skeleton className="min-h-[200px] w-full" />
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
        <Card className="shadow-subtle">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Presentes</CardTitle>
            <CheckCircle className="h-6 w-6 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalPresent}</div>
            <p className="text-xs text-muted-foreground">en los últimos 30 días</p>
          </CardContent>
        </Card>
        <Card className="shadow-subtle">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Ausentes</CardTitle>
            <XCircle className="h-6 w-6 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalAbsent}</div>
            <p className="text-xs text-muted-foreground">en los últimos 30 días</p>
          </CardContent>
        </Card>
      </div>
      <Card className="shadow-subtle">
        <CardHeader>
          <CardTitle className="font-headline">Resumen de Asistencia</CardTitle>
          <CardDescription>
            Un resumen de la asistencia de los estudiantes en los últimos 6 meses.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
            <BarChart accessibilityLayer data={stats.chartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <YAxis />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Bar dataKey="present" fill="var(--color-present)" radius={4} />
              <Bar dataKey="absent" fill="var(--color-absent)" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
        <CardFooter>
          <div className="text-xs text-muted-foreground">
            Mostrando la asistencia total de los últimos 6 meses.
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
