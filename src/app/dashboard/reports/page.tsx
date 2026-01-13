'use client';

import * as React from 'react';
import AttendanceReport from '@/components/attendance-report';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ReportsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Reportes de Asistencia</h1>
        <p className="text-muted-foreground mt-1">
          Genera y visualiza reportes detallados de asistencia por institución y fecha.
        </p>
      </div>

      <Card className="shadow-subtle">
        <CardHeader>
          <CardTitle>Consultar Reportes</CardTitle>
          <CardDescription>
            Utiliza los filtros de Institución y Fecha para obtener el listado completo de asistencias.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AttendanceReport />
        </CardContent>
      </Card>
    </div>
  );
}
