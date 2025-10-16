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
import { courses, students, attendance } from '@/lib/data';

const chartData = [
  { month: 'Enero', present: 186, absent: 30 },
  { month: 'Febrero', present: 305, absent: 20 },
  { month: 'Marzo', present: 237, absent: 50 },
  { month: 'Abril', present: 273, absent: 40 },
  { month: 'Mayo', present: 209, absent: 60 },
  { month: 'Junio', present: 214, absent: 70 },
];

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

export default function Dashboard() {
  const totalStudents = students.length;
  const totalCourses = courses.length;
  const totalPresent = attendance.filter((a) => a.status === 'Present').length;
  const totalAbsent = attendance.filter((a) => a.status === 'Absent').length;

  return (
    <div className="flex flex-col gap-8 py-8">
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card className="shadow-subtle">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Estudiantes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">+2 desde el mes pasado</p>
          </CardContent>
        </Card>
        <Card className="shadow-subtle">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Cursos</CardTitle>
            <BookCopy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCourses}</div>
            <p className="text-xs text-muted-foreground">+1 desde el último semestre</p>
          </CardContent>
        </Card>
        <Card className="shadow-subtle">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Presentes</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPresent}</div>
            <p className="text-xs text-muted-foreground">en los últimos 30 días</p>
          </CardContent>
        </Card>
        <Card className="shadow-subtle">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Ausentes</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAbsent}</div>
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
            <BarChart accessibilityLayer data={chartData}>
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
