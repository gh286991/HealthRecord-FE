import { redirect } from 'next/navigation';

export default function RegisterRootRedirect() {
  redirect('/register/email');
}

