import { redirect } from "next/navigation";

// ponytail: edit lives in the detail dialog — route redirects instead of a duplicate page
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/admin/products/${id}`);
}
