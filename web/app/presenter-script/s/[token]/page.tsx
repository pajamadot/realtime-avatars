import { redirect } from 'next/navigation';
import { decodeSlideToken } from '../../../presenter-script-6f2a9c17/_shared';

export default async function PublicEncodedSlideRedirectPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const slide = decodeSlideToken(token);

  if (!slide) {
    redirect('/slides');
  }

  redirect(`/slides/${slide}`);
}

