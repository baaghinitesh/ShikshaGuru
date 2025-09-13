import { Suspense } from 'react';
import { ShikshaLogin } from '../shiksha-login';

export default function SignUpPage() {
  return (
    <Suspense>
      <ShikshaLogin mode="signup" />
    </Suspense>
  );
}
