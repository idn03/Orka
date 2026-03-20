import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, unauthorizedResponse } from "@/lib/session";

export async function GET() {
  const { isAuthenticated } = await getSession();

  if (!isAuthenticated) {
    return unauthorizedResponse();
  }

  try {
    const users = await prisma.user.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    return NextResponse.json(users);
  } catch {
    return NextResponse.json(
      { errors: { auth: "An error occurred" } },
      { status: 500 }
    );
  }
}
