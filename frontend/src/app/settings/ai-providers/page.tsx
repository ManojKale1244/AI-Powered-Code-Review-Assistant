import { redirect } from 'next/navigation';

export default function AiProvidersRedirect() {
  redirect('/dashboard/settings');
}
