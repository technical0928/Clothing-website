import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/utils/db";

type AdminSession = {
  user?: {
    id?: string;
    role?: string;
  };
};

export async function POST(request: Request) {
  const session = (await getServerSession(authOptions)) as AdminSession | null;

  if (!session?.user?.id) {
    return NextResponse.json({ error: "You must be logged in" }, { status: 401 });
  }

  if (session.user.role !== "admin") {
    return NextResponse.json({ error: "Only admins can update this account" }, { status: 403 });
  }

  const { email, name, currentPassword } = await request.json();

  if (!email || !currentPassword) {
    return NextResponse.json({ error: "Email and current password are required" }, { status: 400 });
  }

  const trimmedEmail = String(email).trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user?.password) {
    return NextResponse.json({ error: "Password cannot be changed for this account" }, { status: 400 });
  }

  const passwordMatches = await bcrypt.compare(currentPassword, user.password);
  if (!passwordMatches) {
    return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
  }

  // Prevent taking over another account's email
  if (trimmedEmail !== user.email) {
    const existing = await prisma.user.findUnique({ where: { email: trimmedEmail } });
    if (existing && existing.id !== user.id) {
      return NextResponse.json({ error: "This email is already in use" }, { status: 400 });
    }
  }

  const trimmedName =
    name !== undefined && name !== null ? String(name).trim() : null;

  await prisma.user.update({
    where: { id: user.id },
    data: {
      email: trimmedEmail,
      ...(trimmedName !== null ? { name: trimmedName || null } : {}),
    },
  });

  return NextResponse.json({
    message: "Account updated successfully. Use your new email to log in next time.",
  });
}
