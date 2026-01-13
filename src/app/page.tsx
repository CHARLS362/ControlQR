'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AppLogo } from '@/components/icons';
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [usuario, setUsuario] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: usuario, password }), // El endpoint espera 'email' internamente por ahora
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al iniciar sesión.');
      }
      
      toast({
        title: 'Inicio de Sesión Exitoso',
        description: `Bienvenido de nuevo, ${data.name || 'usuario'}.`,
      });
      router.push('/dashboard');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error inesperado.';
      toast({
        variant: 'destructive',
        title: 'Error de Autenticación',
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center p-4 overflow-hidden bg-animated-gradient">
      <Card className={cn(
          "relative z-10 mx-auto w-full max-w-sm rounded-2xl border border-white/10 shadow-2xl shadow-black/50",
          "bg-black/30 backdrop-blur-lg"
      )}>
        <div className="absolute -top-px left-1/2 -translate-x-1/2 h-px w-3/4 bg-gradient-to-r from-transparent via-blue-400 to-transparent"></div>
        <div className="absolute -bottom-px left-1/2 -translate-x-1/2 h-px w-3/4 bg-gradient-to-r from-transparent via-blue-400 to-transparent"></div>

        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center items-center gap-3 text-white">
            <AppLogo className="h-8 w-8 text-blue-400" />
            <CardTitle className="text-4xl font-bold font-headline">QRAttendance</CardTitle>
          </div>
          <CardDescription className="pt-2 text-gray-400">Ingresa tus datos para acceder a tu cuenta</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="text-white">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="usuario" className="text-gray-300">Usuario</Label>
                <Input
                  id="usuario"
                  type="text"
                  placeholder="tu-usuario"
                  required
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  className="bg-black/30 border-white/20 text-white placeholder:text-gray-500 focus:ring-blue-400"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Contraseña</Label>
                  <Link href="#" className="ml-auto inline-block text-sm text-gray-400 hover:text-white underline">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-black/30 border-white/20 text-white placeholder:text-gray-500 focus:ring-blue-400"
                />
              </div>
              <Button className="w-full font-bold bg-blue-600 hover:bg-blue-500 text-white" type="submit" disabled={loading}>
                {loading && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                Iniciar Sesión
              </Button>
            </div>
          </form>
           <div className="mt-4 text-center text-sm text-gray-400">
            ¿No tienes una cuenta?{' '}
            <Link href="/register" className="underline text-blue-400 hover:text-blue-300">
              Crear una cuenta
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
