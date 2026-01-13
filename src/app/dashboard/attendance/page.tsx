'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { List, CheckCircle, FileBarChart } from 'lucide-react';
import AttendanceForm from '@/components/attendance-form';
import AttendanceList from '@/components/attendance-list';
import AttendanceReport from '@/components/attendance-report';

export default function AttendancePage() {
    const [activeTab, setActiveTab] = React.useState("list");
    const [refreshKey, setRefreshKey] = React.useState(0);

    const handleSuccess = () => {
        setRefreshKey(prev => prev + 1);
        setActiveTab("list");
    };

    return (
        <div className="space-y-8 py-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">Gestión de Asistencia</h1>
                <p className="text-muted-foreground mt-1">
                    Monitoriza asistencias, genera reportes detallados y realiza registros manuales.
                </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto bg-muted/50 p-1 h-auto rounded-lg">
                    <TabsTrigger value="list" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md">
                        <List className="mr-2" />
                        Asistencia de Hoy
                    </TabsTrigger>
                    <TabsTrigger value="report" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md">
                        <FileBarChart className="mr-2" />
                        Reportes
                    </TabsTrigger>
                    <TabsTrigger value="create" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md">
                        <CheckCircle className="mr-2" />
                        Registro Manual
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="list" className="mt-6">
                    <Card className="shadow-subtle">
                        <CardHeader>
                            <CardTitle>Monitor de Hoy</CardTitle>
                            <CardDescription>Vista rápida de asistencias del día actual (Global).</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <AttendanceList key={refreshKey} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="report" className="mt-6">
                    <Card className="shadow-subtle">
                        <CardHeader>
                            <CardTitle>Reporte Detallado</CardTitle>
                            <CardDescription>Consulta asistencias por institución y fecha específica.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <AttendanceReport />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="create" className="mt-6">
                    <Card className="shadow-subtle max-w-2xl mx-auto">
                        <CardHeader>
                            <CardTitle>Registrar Asistencia Manualmente</CardTitle>
                            <CardDescription>Usa este formulario si el estudiante no tiene su carnet o QR.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <AttendanceForm onSuccess={handleSuccess} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
