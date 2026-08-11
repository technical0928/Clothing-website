import { revalidatePath, revalidateTag } from "next/cache";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/authOptions";

type AdminSession = {
  user?: {
    role?: string;
  };
};

export async function POST() {
  const session = (await getServerSession(authOptions)) as AdminSession | null;

  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Only admins can refresh products" }, { status: 403 });
  }

  // Purge the tagged fetch cache so product data is re-fetched from Neon
  revalidateTag("products");

  // Also revalidate the pages that display products so a newly created
  // product shows up immediately instead of after the 30s revalidate window.
  revalidatePath("/", "page");
  revalidatePath("/shop", "page");

  return NextResponse.json({ revalidated: true });
}
