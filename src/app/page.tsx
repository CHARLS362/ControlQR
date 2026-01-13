'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AppLogo } from '@/components/icons';
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle, Lock, User, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

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
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-animated-gradient p-4">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="glass-card rounded-2xl p-8 border-t border-white/20 shadow-[0_0_40px_-10px_rgba(0,0,0,0.5)]">
          {/* Header */}
          <div className="flex flex-col items-center space-y-4 mb-8 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="p-3 bg-blue-600/20 rounded-full ring-1 ring-blue-400/30 shadow-[0_0_15px_rgba(37,99,235,0.3)]"
            >
              <AppLogo className="h-10 w-10 text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
            </motion.div>
            
            <div className="space-y-1">
              <h1 className="text-3xl font-bold text-white tracking-tight text-glow">
                QRAttendance
              </h1>
              <p className="text-blue-100/60 text-sm">
                Gestión académica inteligente
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {/* User Input */}
              <div className="space-y-2">
                <Label htmlFor="usuario" className="text-blue-100/80 text-xs uppercase tracking-wider font-semibold ml-1">
                  Usuario
                </Label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300/50 transition-colors group-focus-within:text-blue-400">
                    <User className="h-5 w-5" />
                  </div>
                  <Input
                    id="usuario"
                    type="text"
                    placeholder="Ingrese su usuario"
                    required
                    value={usuario}
                    onChange={(e) => setUsuario(e.target.value)}
                    className="pl-10 bg-black/20 border-white/10 text-white placeholder:text-blue-200/20 focus:bg-black/40 focus:border-blue-500/50 focus:ring-blue-500/20 rounded-xl h-12 transition-all duration-300"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-blue-100/80 text-xs uppercase tracking-wider font-semibold ml-1">
                    Contraseña
                  </Label>
                  <Link href="#" className="text-xs text-blue-400/80 hover:text-blue-300 transition-colors">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300/50 transition-colors group-focus-within:text-blue-400">
                    <Lock className="h-5 w-5" />
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-black/20 border-white/10 text-white placeholder:text-blue-200/20 focus:bg-black/40 focus:border-blue-500/50 focus:ring-blue-500/20 rounded-xl h-12 transition-all duration-300"
                  />
                </div>
              </div>
            </div>

            <Button 
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold rounded-xl shadow-[0_4px_20px_-4px_rgba(37,99,235,0.5)] hover:shadow-[0_8px_30px_-4px_rgba(37,99,235,0.6)] transition-all duration-300 transform hover:-translate-y-0.5"
              type="submit" 
              disabled={loading}
            >
              {loading ? (
                <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <span className="flex items-center gap-2">
                  Iniciar Sesión <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-blue-200/40">
              ¿No tienes cuenta?{' '}
              <Link href="/register" className="text-blue-400 hover:text-blue-300 font-medium transition-colors hover:underline underline-offset-4">
                Solicita acceso aquí
              </Link>
            </p>
          </div>
        </div>
        
        {/* Decorative footer text */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="mt-8 text-center text-xs text-white/20 font-light"
        >
          © 2024 QRAttendance System. V1.5
        </motion.p>
      </motion.div>
    </main>
  );
}
