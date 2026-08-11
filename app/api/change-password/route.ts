import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/utils/db";

type UserSession = {
  user?: {
    id?: string;
  };
};

export async function POST(request: Request) {
  const session = (await getServerSession(authOptions)) as UserSession | null;

  if (!session?.user?.id) {
    return NextResponse.json({ error: "You must be logged in" }, { status: 401 });
  }

  const { currentPassword, newPassword, confirmPassword } = await request.json();

  if (!currentPassword || !newPassword || !confirmPassword) {
    return NextResponse.json({ error: "Please fill in all password fields" }, { status: 400 });
  }

  if (newPassword.length < 8) {
    return NextResponse.json({ error: "New password must be at least 8 characters" }, { status: 400 });
  }

  if (newPassword !== confirmPassword) {
    return NextResponse.json({ error: "New password and verify password do not match" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user?.password) {
    return NextResponse.json({ error: "Password cannot be changed for this account" }, { status: 400 });
  }

  const currentPasswordMatches = await bcrypt.compare(currentPassword, user.password);

  if (!currentPasswordMatches) {
    return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 14);

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  });

  return NextResponse.json({ message: "Password changed successfully" });
}
