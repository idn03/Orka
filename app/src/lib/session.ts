import { auth } from "@/lib/auth";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
}

export interface SessionResult {
  user: SessionUser | null;
  isAuthenticated: boolean;
}

export async function getSession(): Promise<SessionResult> {
  const session = await auth();

  if (!session?.user) {
    return { user: null, isAuthenticated: false };
  }

  return {
    user: {
      id: session.user.id!,
      email: session.user.email!,
      name: session.user.name!,
    },
    isAuthenticated: true,
  };
}

export function unauthorizedResponse() {
  return new Response(
    JSON.stringify({ errors: { auth: "Not authenticated" } }),
    {
      status: 401,
      headers: { "Content-Type": "application/json" },
    }
  );
}
