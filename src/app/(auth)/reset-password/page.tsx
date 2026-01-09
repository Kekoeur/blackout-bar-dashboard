import { Suspense } from 'react';
import ResetPassword from './ResetPassword';

export const dynamic = 'force-dynamic';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-white">Chargement...</div>}>
      <ResetPassword />
    </Suspense>
  )
}
