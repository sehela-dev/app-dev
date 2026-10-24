import { redirect } from "next/navigation";

// Email waitlist deep link lands on /book/:sessionId — forward to the session detail page.
export default async function BookSessionRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/book/session/${id}`);
}
