import { NextResponse } from "next/server";
import { getSession, unauthorizedResponse } from "@/lib/session";

export async function GET() {
  const { user, isAuthenticated } = await getSession();

  if (!isAuthenticated) {
    return unauthorizedResponse();
  }

  return NextResponse.json({ user });
}
