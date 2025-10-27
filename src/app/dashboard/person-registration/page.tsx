'use client';

import PersonRegistrationForm from '@/components/person-registration-form';

export default function PersonRegistrationPage() {
  return (
    <div className="space-y-8 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Registro Completo de Persona</h1>
          <p className="text-muted-foreground mt-1">
            Completa todos los campos para registrar una nueva persona en el sistema externo.
          </p>
        </div>
      </div>
      <PersonRegistrationForm />
    </div>
  );
}
