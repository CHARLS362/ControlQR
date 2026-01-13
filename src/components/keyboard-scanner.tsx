'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { CheckCircle, XCircle, Clock, AlertCircle, Scan, Usb, Wifi, WifiOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Console } from 'console';

interface Registro {
  id: string;
  codigo: string;
  nombres: string;
  fechaHora: string;
  estado: 'exito' | 'error' | 'duplicado';
  mensaje?: string;
}

interface DispositivoUSB {
  conectado: boolean;
  nombre: string;
  ultimaActividad: number;
}

export default function KeyboardScanner() {
  const bufferRef = useRef('');
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastScanTime = useRef<Record<string, number>>({});
  const activityTimeoutRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();

  const [registros, setRegistros] = useState<Registro[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [dispositivo, setDispositivo] = useState<DispositivoUSB>({
    conectado: false,
    nombre: 'Scanner ZKB207',
    ultimaActividad: 0
  });
  const [config, setConfig] = useState({
    deduplicacionSeg: 5,
    timeoutBuffer: 100,
    longitudMin: 4,
    longitudMax: 150,
    inactividadSeg: 10
  });

  // Detectar actividad del scanner
  const detectarActividad = useCallback(() => {
    const now = Date.now();
    setDispositivo(prev => ({
      ...prev,
      conectado: true,
      ultimaActividad: now
    }));

    if (activityTimeoutRef.current) {
      clearTimeout(activityTimeoutRef.current);
    }

    activityTimeoutRef.current = setTimeout(() => {
      setDispositivo(prev => ({
        ...prev,
        conectado: false
      }));
    }, config.inactividadSeg * 1000);
  }, [config.inactividadSeg]);

  // Validar formato del código
  const validarCodigo = useCallback((codigo: string): { valido: boolean; mensaje?: string } => {
    if (codigo.length < config.longitudMin) {
      return { valido: false, mensaje: 'Código muy corto' };
    }
    if (codigo.length > config.longitudMax) {
      return { valido: false, mensaje: 'Código muy largo' };
    }
    if (!/^[a-zA-Z0-9-_]+$/.test(codigo)) {
      return { valido: false, mensaje: 'Caracteres no válidos' };
    }
    return { valido: true };
  }, [config]);

  // Verificar duplicados
  const esDuplicado = useCallback((codigo: string): boolean => {
    const now = Date.now();
    const ultimoScan = lastScanTime.current[codigo];
    if (ultimoScan && now - ultimoScan < config.deduplicacionSeg * 1000) {
      return true;
    }
    return false;
  }, [config.deduplicacionSeg]);



  // Registrar asistencia
  const registrarAsistencia = useCallback(async (codigo: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const fechaHora = new Date().toISOString();

    const validacion = validarCodigo(codigo);
    // if (!validacion.valido) {
    //   setRegistros(prev => [{
    //     id,
    //     codigo,
    //     fechaHora,
    //     estado: 'error',
    //     mensaje: validacion.mensaje
    //   }, ...prev].slice(0, 10));
    //   return;
    // }

    // if (esDuplicado(codigo)) {
    //   setRegistros(prev => [{
    //     id,
    //     codigo,
    //     fechaHora,
    //     estado: 'duplicado',
    //     mensaje: 'Escaneado recientemente'
    //   }, ...prev].slice(0, 10));
    //   return;
    // }

    lastScanTime.current[codigo] = Date.now();
    try {
      //obtenemos la asistencia

      const res = await fetch('http://31.97.169.107:8093/api/estudiante/consultar-estudiante-qr/' + codigo, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        // body: JSON.stringify({ codigo_hash: codigo })
      });

      const data = await res.json();
      console.log('Respuesta del servidor:', data.data);


      if (!res.ok) {
        throw new Error(data.message || 'Error al registrar');
      }

      const resRegistro = await fetch('/api/proxy/api/asistencia/registrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estudiante_id: data.data.id, fecha: data.data.fecha_hora_marcacion.substring(0, 10), hora_ingreso: data.data.fecha_hora_marcacion.substring(11, 19), asistencia_estado_id: data.data.marcacion_estado_id })
      });

      const dataRegistro = await resRegistro.json();
      console.log('Respuesta del servidor:', dataRegistro);


      setRegistros(prev => [{
        id,
        codigo: 'Asistencia Registrada de ' + data.data.nombres,
        fechaHora,
        estado: 'exito',
        mensaje: 'Estado: ' + data.data.marcacion_estado + ' -> ' + data.data.fecha_hora_marcacion.substring(0, 10).replaceAll("-", "") + ' => ' + data.data.fecha_hora_marcacion.substring(11, 19)
      }, ...prev].slice(0, 10));

      toast({
        title: 'Asistencia Registrada de ' + data.data.nombres,
        description: data.message,
      });

    } catch (err) {
      console.error('Error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error de conexión';
      setRegistros(prev => [{
        id,
        codigo,
        fechaHora,
        estado: 'error',
        mensaje: errorMessage
      }, ...prev].slice(0, 10));
      toast({
        variant: 'destructive',
        title: 'Error en el registro',
        description: errorMessage,
      });
    }
  }, [validarCodigo, esDuplicado, toast]);

  // Procesar buffer
  const procesarBuffer = useCallback(() => {
    const codigo = bufferRef.current.trim();
    bufferRef.current = '';
    setIsScanning(false);

    if (!codigo) return;

    registrarAsistencia(codigo);
  }, [registrarAsistencia]);

  // Listener del teclado
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA'].includes(target.tagName)) {
        return;
      }

      detectarActividad();

      if (e.key === 'Enter') {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        procesarBuffer();
        return;
      }

      if (e.key.length > 1) return;

      setIsScanning(true);
      bufferRef.current += e.key;

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(procesarBuffer, config.timeoutBuffer);
    };

    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (activityTimeoutRef.current) clearTimeout(activityTimeoutRef.current);
    };
  }, [procesarBuffer, config.timeoutBuffer, detectarActividad]);

  const getIcon = (estado: string) => {
    switch (estado) {
      case 'exito': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'duplicado': return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default: return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getColorClasses = (estado: string) => {
    switch (estado) {
      case 'exito': return 'bg-green-50/50 border-green-200';
      case 'error': return 'bg-red-50/50 border-red-200';
      case 'duplicado': return 'bg-yellow-50/50 border-yellow-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="shadow-subtle">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold font-headline flex items-center gap-2">
                <Scan className="w-6 h-6" />
                Control de Asistencia por Teclado
              </CardTitle>
              <CardDescription className="mt-1">
                Conecta un scanner USB (modo teclado) y comienza a escanear.
              </CardDescription>
            </div>

            <div className="flex items-center gap-4">
              {isScanning && (
                <div className="flex items-center gap-2 text-primary animate-pulse">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-sm font-medium">Escaneando...</span>
                </div>
              )}
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 transition-all ${dispositivo.conectado
                ? 'bg-green-100/50 border-green-400'
                : 'bg-muted/50 border-gray-300'
                }`}>
                <Usb className={`w-5 h-5 ${dispositivo.conectado ? 'text-green-600' : 'text-gray-400'}`} />
                <div className="text-left">
                  <div className={`text-xs font-semibold ${dispositivo.conectado ? 'text-green-700' : 'text-gray-500'}`}>
                    {dispositivo.conectado ? 'CONECTADO' : 'INACTIVO'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!dispositivo.conectado && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md mb-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 shrink-0" />
                <div>
                  <h3 className="text-sm font-semibold text-yellow-800">
                    Scanner no detectado o inactivo
                  </h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    Conecta el scanner USB y escanea un código para activar el sistema. El indicador de estado cambiará a "Conectado".
                  </p>
                </div>
              </div>
            </div>
          )}
          <div className="bg-blue-50/50 rounded-lg border border-blue-200 p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">Instrucciones</h3>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Conecta el scanner USB en modo Teclado.</li>
              <li>El indicador superior mostrará "CONECTADO" al escanear.</li>
              <li>Los escaneos duplicados se bloquean por {config.deduplicacionSeg} segundos.</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* <Card className="shadow-subtle">
        <CardHeader>
            <h2 className="text-lg font-semibold text-card-foreground">Configuración Avanzada</h2>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
                <Label htmlFor="dedup" className="block text-sm font-medium text-gray-700 mb-1">Anti-duplicado (s)</Label>
                <Input id="dedup" type="number" min="1" max="60" value={config.deduplicacionSeg} onChange={e => setConfig(c => ({ ...c, deduplicacionSeg: +e.target.value }))} />
            </div>
            <div>
                <Label htmlFor="timeout" className="block text-sm font-medium text-gray-700 mb-1">Timeout (ms)</Label>
                <Input id="timeout" type="number" min="50" max="500" value={config.timeoutBuffer} onChange={e => setConfig(c => ({ ...c, timeoutBuffer: +e.target.value }))} />
            </div>
            <div>
                <Label htmlFor="minlen" className="block text-sm font-medium text-gray-700 mb-1">Long. Mínima</Label>
                <Input id="minlen" type="number" min="1" max="20" value={config.longitudMin} onChange={e => setConfig(c => ({ ...c, longitudMin: +e.target.value }))} />
            </div>
            <div>
                <Label htmlFor="maxlen" className="block text-sm font-medium text-gray-700 mb-1">Long. Máxima</Label>
                <Input id="maxlen" type="number" min="10" max="100" value={config.longitudMax} onChange={e => setConfig(c => ({ ...c, longitudMax: +e.target.value }))} />
            </div>
            <div>
                <Label htmlFor="inactive" className="block text-sm font-medium text-gray-700 mb-1">Inactividad (s)</Label>
                <Input id="inactive" type="number" min="5" max="60" value={config.inactividadSeg} onChange={e => setConfig(c => ({ ...c, inactividadSeg: +e.target.value }))} />
            </div>
            </div>
        </CardContent>
       </Card> */}

      <Card className="shadow-subtle">
        <CardHeader>
          <h2 className="text-lg font-semibold text-card-foreground">Historial de Registros ({registros.length})</h2>
        </CardHeader>
        <CardContent>
          {registros.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Scan className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Esperando escaneos...</p>
              <p className="text-sm mt-1">Escanea un código para comenzar</p>
            </div>
          ) : (
            <div className="space-y-2">
              {registros.map((registro) => (
                <div
                  key={registro.id}
                  className={`p-3 rounded-lg border ${getColorClasses(registro.estado)} transition-all`}
                >
                  <div className="flex items-start gap-3">
                    {getIcon(registro.estado)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <code className="text-sm font-mono font-semibold text-gray-900">
                          {registro.codigo}
                        </code>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(registro.fechaHora).toLocaleTimeString('es-PE')}
                        </span>
                      </div>
                      {registro.mensaje && (
                        <p className="text-sm text-muted-foreground mt-1">{registro.mensaje}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
