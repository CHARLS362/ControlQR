
'use client';

import PersonRegistrationForm from '@/components/person-registration-form';
import PersonSearch from '@/components/person-search';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';


export default function PersonRegistrationPage() {
  return (
    <div className="space-y-8 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Gestión de Personas</h1>
          <p className="text-muted-foreground mt-1">
            Registra nuevas personas o busca registros existentes en el sistema externo.
          </p>
        </div>
      </div>
      
      <Tabs defaultValue="register" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-lg mx-auto bg-muted/50 p-1 h-auto rounded-lg">
          <TabsTrigger value="register" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:bg-primary/20 data-[state=inactive]:text-primary rounded-md">
            <UserPlus className="mr-2" />
            Registrar Persona
          </TabsTrigger>
          <TabsTrigger value="search" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:bg-primary/20 data-[state=inactive]:text-primary rounded-md">
            <Search className="mr-2" />
            Buscar Persona
          </TabsTrigger>
        </TabsList>
        <TabsContent value="register">
          <Card className="shadow-subtle">
            <CardHeader>
                <CardTitle>Formulario de Registro</CardTitle>
                <CardDescription>Completa todos los campos para registrar una nueva persona en el sistema.</CardDescription>
            </CardHeader>
            <CardContent>
                <PersonRegistrationForm />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="search">
          <PersonSearch />
        </TabsContent>
      </Tabs>

    </div>
  );
}
