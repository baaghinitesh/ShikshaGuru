import { Suspense } from 'react';
import { ShikshaLogin } from '../shiksha-login';

export default function SignInPage() {
  return (
    <Suspense>
      <ShikshaLogin mode="signin" />
    </Suspense>
  );
}
