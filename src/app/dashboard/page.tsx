'use client';

import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Legend } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Button } from '@/components/ui/button';
import { BookCopy, Users, CheckCircle, XCircle, LoaderCircle } from 'lucide-react';
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { DashboardStats } from '@/lib/types';


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
  const [filter, setFilter] = React.useState<'monthly' | 'weekly'>('monthly');
  const [isChartLoading, setIsChartLoading] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    async function fetchStats(range: 'monthly' | 'weekly') {
        if (range === 'monthly' && !stats) { // Only show main loading skeleton on first load
            setLoading(true);
        } else {
            setIsChartLoading(true);
        }

      try {
        const response = await fetch(`/api/stats/dashboard?range=${range}`);
        if (!response.ok) {
          throw new Error('Failed to fetch stats');
        }
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'No se pudieron cargar las estadísticas.',
        });
      } finally {
        setLoading(false);
        setIsChartLoading(false);
      }
    }
    fetchStats(filter);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, toast]);
  

  if (loading || !stats) {
    return (
      <div className="flex flex-col gap-8 py-8">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <Skeleton className="h-36 w-full" />
          <Skeleton className="h-36 w-full" />
          <Skeleton className="h-36 w-full" />
          <Skeleton className="h-36 w-full" />
        </div>
        <Card className="shadow-subtle">
          <CardHeader>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-5 w-96 mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="min-h-[200px] w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  const chartConfig = {
    presentes: {
      label: 'Presentes',
      color: 'hsl(var(--chart-2))',
    },
    ausentes: {
      label: 'Ausentes',
      color: 'hsl(var(--chart-5))',
    },
  };

  return (
    <div className="flex flex-col gap-8 py-8">
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <StatCard 
            title="Total de Estudiantes"
            value={stats.totalStudents.toString()}
            icon={Users}
            changeText="+2 desde el mes pasado"
            gradientColors="bg-gradient-to-br from-green-400 to-green-600"
        />
        <StatCard 
            title="Total de Cursos"
            value={stats.totalCourses.toString()}
            icon={BookCopy}
            changeText="+1 desde el último semestre"
            gradientColors="bg-gradient-to-br from-blue-400 to-blue-600"
        />
        <StatCard 
            title="Total de Presentes"
            value={stats.totalPresent.toString()}
            icon={CheckCircle}
            changeText="en los últimos 30 días"
            gradientColors="bg-gradient-to-br from-purple-400 to-pink-600"
        />
        <StatCard 
            title="Total de Ausentes"
            value={stats.totalAbsent.toString()}
            icon={XCircle}
            changeText="en los últimos 30 días"
            gradientColors="bg-gradient-to-br from-yellow-400 to-orange-500"
        />
      </div>
      <Card className="shadow-subtle">
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-headline">Resumen de Asistencia</CardTitle>
              <CardDescription>
                Un resumen de la asistencia en {filter === 'monthly' ? 'los últimos 6 meses' : 'la última semana'}.
              </CardDescription>
            </div>
            <div className="flex gap-2">
                <Button variant="outline" size="sm" className={cn(filter === 'monthly' && "bg-muted")} onClick={() => setFilter('monthly')}>Mes</Button>
                <Button variant="outline" size="sm" className={cn(filter === 'weekly' && "bg-muted")} onClick={() => setFilter('weekly')}>Semana</Button>
            </div>
        </CardHeader>
        <CardContent className="h-[350px] relative">
            {isChartLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-card/80 z-10 rounded-b-lg">
                    <LoaderCircle className="h-10 w-10 animate-spin" />
                </div>
            )}
          <ChartContainer config={chartConfig} className="h-full w-full">
            <BarChart 
                accessibilityLayer 
                data={stats.chartData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <XAxis
                dataKey="time"
                stroke="hsl(var(--muted-foreground))"
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => filter === 'monthly' ? value.slice(0, 3) : value}
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <ChartTooltip
                cursor={{ fill: 'hsl(var(--muted))', opacity: 0.5 }}
                content={<ChartTooltipContent 
                    indicator="dot" 
                />}
              />
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
              <Bar 
                dataKey="presentes" 
                fill="var(--color-presentes)" 
                name="Presentes"
                radius={[4, 4, 0, 0]} 
                barSize={20}
              />
              <Bar 
                dataKey="ausentes" 
                fill="var(--color-ausentes)" 
                name="Ausentes"
                radius={[4, 4, 0, 0]}
                barSize={20}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
