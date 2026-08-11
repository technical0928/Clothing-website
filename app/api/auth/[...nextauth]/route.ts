import NextAuth from "next-auth";
import { authOptions } from "@/lib/authOptions";

const handler = (NextAuth as any)(authOptions);

export { handler as GET, handler as POST };