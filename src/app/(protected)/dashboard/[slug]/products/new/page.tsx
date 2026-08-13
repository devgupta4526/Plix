import NewProductForm from "./_components/new-product-form";

type Props = { params: { slug: string } };

export default function NewProductPage({ params }: Props) {
  return <NewProductForm slug={params.slug} />;
}
