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
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Mockup: Redirige directamente al dashboard para pruebas.
    toast({
      title: 'Acceso de prueba',
      description: 'Omitiendo validación para desarrollo.',
    });
    router.push('/dashboard');
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
                <Label htmlFor="email" className="text-gray-300">Correo Electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
        </CardContent>
      </Card>
    </main>
  );
}
