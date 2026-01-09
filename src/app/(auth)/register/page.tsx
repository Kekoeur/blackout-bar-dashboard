import { Suspense } from 'react';
import RegisterForm from './RegisterForm';

export const dynamic = 'force-dynamic';

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="text-white">Chargement...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
