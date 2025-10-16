'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AppLogo } from '@/components/icons';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background">
      <Card className="mx-auto max-w-sm w-full shadow-subtle">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center items-center gap-2">
            <AppLogo className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl font-bold font-headline">QRAttendance</CardTitle>
          </div>
          <CardDescription>Ingresa tus datos para acceder a tu cuenta</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input id="email" type="email" placeholder="admin@example.com" required />
            </div>
            <div className="space-y-2">
              <div className="flex items-center">
                <Label htmlFor="password">Contraseña</Label>
                <Link href="#" className="ml-auto inline-block text-sm underline">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <Input id="password" type="password" required />
            </div>
            <Link href="/dashboard" className="w-full">
              <Button className="w-full" type="submit" variant="default">
                Iniciar Sesión
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
