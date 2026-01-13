
'use client';

import SectionForm from '@/components/section-form';
import SectionList from '@/components/section-list';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { List, PlusCircle } from 'lucide-react';
import React from 'react';

export default function SectionsPage() {
  const [refreshKey, setRefreshKey] = React.useState(0);

  const handleSuccess = () => {
    setRefreshKey(prevKey => prevKey + 1);
  };

  return (
    <div className="space-y-8 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Gestión de Secciones</h1>
          <p className="text-muted-foreground mt-1">
            Crea, visualiza, edita y elimina las secciones de cada grado.
          </p>
        </div>
      </div>
      
      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-lg mx-auto bg-muted/50 p-1 h-auto rounded-lg">
          <TabsTrigger value="list" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md">
            <List className="mr-2" />
            Listar Secciones
          </TabsTrigger>
          <TabsTrigger value="create" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md">
            <PlusCircle className="mr-2" />
            Crear Sección
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list">
           <Card className="shadow-subtle">
             <CardHeader>
                <CardTitle>Listado y Gestión de Secciones</CardTitle>
                <CardDescription>Selecciona un grado para ver y gestionar sus secciones.</CardDescription>
             </CardHeader>
             <CardContent>
                <SectionList key={refreshKey} onActionSuccess={handleSuccess} />
             </CardContent>
           </Card>
        </TabsContent>

        <TabsContent value="create">
            <Card className="shadow-subtle">
                <CardHeader>
                    <CardTitle>Formulario de Creación de Sección</CardTitle>
                    <CardDescription>Completa todos los campos para registrar una nueva sección.</CardDescription>
                </CardHeader>
                <CardContent>
                    <SectionForm onSuccess={handleSuccess} />
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
