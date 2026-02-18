import SlidesDeck from '../SlidesDeck';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function SlidesByIdPage({ params }: PageProps) {
  const { id } = await params;
  const parsed = Number(id);
  const initialSlide = Number.isFinite(parsed) ? parsed : 1;

  return <SlidesDeck initialSlide={initialSlide} />;
}
