
'use client';

import SectionForm from '@/components/section-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SectionsPage() {
  return (
    <div className="space-y-8 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Gestión de Secciones</h1>
          <p className="text-muted-foreground mt-1">
            Añade nuevas secciones al sistema.
          </p>
        </div>
      </div>
      
      <Card className="shadow-subtle">
        <CardHeader>
            <CardTitle>Formulario de Creación de Sección</CardTitle>
            <CardDescription>Completa todos los campos para registrar una nueva sección.</CardDescription>
        </CardHeader>
        <CardContent>
            <SectionForm />
        </CardContent>
      </Card>
    </div>
  );
}
