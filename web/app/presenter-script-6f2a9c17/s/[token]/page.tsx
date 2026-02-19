import { redirect } from 'next/navigation';
import { decodeSlideToken } from '../../_shared';

export default async function EncodedSlideRedirectPage({
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

