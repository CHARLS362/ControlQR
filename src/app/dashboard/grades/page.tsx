
'use client';

import GradeForm from '@/components/grade-form';
import GradeList from '@/components/grade-list';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { List, PlusCircle } from 'lucide-react';
import React from 'react';

export default function GradesPage() {
  const [activeTab, setActiveTab] = React.useState("list");
  const [refreshKey, setRefreshKey] = React.useState(0);

  const handleSuccess = () => {
    setRefreshKey(prevKey => prevKey + 1);
    setActiveTab("list"); // Cambia a la lista después de crear/editar
  };

  return (
    <div className="space-y-8 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Gestión de Grados</h1>
          <p className="text-muted-foreground mt-1">
            Crea, visualiza, edita y elimina los grados académicos.
          </p>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-lg mx-auto bg-muted/50 p-1 h-auto rounded-lg">
          <TabsTrigger value="list" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md">
            <List className="mr-2" />
            Listar Grados
          </TabsTrigger>
          <TabsTrigger value="create" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md">
            <PlusCircle className="mr-2" />
            Crear Grado
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list">
           <Card className="shadow-subtle">
             <CardHeader>
                <CardTitle>Listado de Grados Académicos</CardTitle>
                <CardDescription>Aquí puedes ver, editar y eliminar los grados existentes.</CardDescription>
             </CardHeader>
             <CardContent>
                <GradeList key={refreshKey} onActionSuccess={handleSuccess} />
             </CardContent>
           </Card>
        </TabsContent>

        <TabsContent value="create">
            <Card className="shadow-subtle">
                <CardHeader>
                    <CardTitle>Formulario de Creación de Grado</CardTitle>
                    <CardDescription>Completa los campos para registrar un nuevo grado.</CardDescription>
                </CardHeader>
                <CardContent>
                    <GradeForm onSuccess={handleSuccess} />
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
