
'use client';

import PersonRegistrationForm from '@/components/person-registration-form';
import PersonSearch from '@/components/person-search';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus, Search } from 'lucide-react';


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
        <TabsList className="grid w-full grid-cols-2 max-w-lg mx-auto bg-transparent p-0">
          <TabsTrigger value="register" className="data-[state=active]:bg-card data-[state=active]:text-card-foreground data-[state=active]:shadow-sm data-[state=inactive]:bg-transparent text-muted-foreground">
            <UserPlus className="mr-2" />
            Registrar Persona
          </TabsTrigger>
          <TabsTrigger value="search" className="data-[state=active]:bg-card data-[state=active]:text-card-foreground data-[state=active]:shadow-sm data-[state=inactive]:bg-transparent text-muted-foreground">
            <Search className="mr-2" />
            Buscar Persona
          </TabsTrigger>
        </TabsList>
        <TabsContent value="register">
          <PersonRegistrationForm />
        </TabsContent>
        <TabsContent value="search">
          <PersonSearch />
        </TabsContent>
      </Tabs>

    </div>
  );
}
