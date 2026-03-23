import { prisma } from "@/lib/prisma";
import { GET } from "@/app/api/users/route";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findMany: jest.fn(),
    },
  },
}));

jest.mock("@/lib/session", () => ({
  getSession: jest.fn(),
  unauthorizedResponse: jest.fn(() => 
    new Response(JSON.stringify({ errors: { auth: "Not authenticated" } }), { status: 401 })
  ),
}));

import { getSession } from "@/lib/session";

describe("GET /api/users", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 when not authenticated", async () => {
    (getSession as jest.Mock).mockResolvedValue({
      isAuthenticated: false,
      user: null,
    });

    const response = await GET();

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body).toEqual({ errors: { auth: "Not authenticated" } });
  });

  it("should return users when authenticated", async () => {
    (getSession as jest.Mock).mockResolvedValue({
      isAuthenticated: true,
      user: { id: "user-1", email: "test@example.com", name: "Test User" },
    });

    const mockUsers = [
      { id: "1", email: "alice@example.com", name: "Alice" },
      { id: "2", email: "bob@example.com", name: "Bob" },
    ];
    (prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual(mockUsers);
  });

  it("should return only id, email, and name fields", async () => {
    (getSession as jest.Mock).mockResolvedValue({
      isAuthenticated: true,
      user: { id: "user-1", email: "test@example.com", name: "Test User" },
    });

    (prisma.user.findMany as jest.Mock).mockResolvedValue([
      { id: "1", email: "test@example.com", name: "Test User" },
    ]);

    const response = await GET();
    const body = await response.json();

    expect(body[0]).toHaveProperty("id");
    expect(body[0]).toHaveProperty("email");
    expect(body[0]).toHaveProperty("name");
    expect(body[0]).not.toHaveProperty("password");
    expect(body[0]).not.toHaveProperty("avatar_url");
    expect(body[0]).not.toHaveProperty("created_at");
    expect(body[0]).not.toHaveProperty("updated_at");
  });

  it("should not return password in response", async () => {
    (getSession as jest.Mock).mockResolvedValue({
      isAuthenticated: true,
      user: { id: "user-1", email: "test@example.com", name: "Test User" },
    });

    (prisma.user.findMany as jest.Mock).mockResolvedValue([
      { id: "1", email: "test@example.com", name: "Test User" },
    ]);

    const response = await GET();
    const body = await response.json();

    expect(body[0]).toHaveProperty("id");
    expect(body[0]).toHaveProperty("email");
    expect(body[0]).toHaveProperty("name");
    expect(body[0]).not.toHaveProperty("password");
  });

  it("should not return avatar_url field in response", async () => {
    (getSession as jest.Mock).mockResolvedValue({
      isAuthenticated: true,
      user: { id: "user-1", email: "test@example.com", name: "Test User" },
    });

    (prisma.user.findMany as jest.Mock).mockResolvedValue([
      { id: "1", email: "test@example.com", name: "Test User" },
    ]);

    const response = await GET();
    const body = await response.json();

    expect(body[0]).toHaveProperty("id");
    expect(body[0]).toHaveProperty("email");
    expect(body[0]).toHaveProperty("name");
    expect(body[0]).not.toHaveProperty("avatar_url");
  });

  it("should order users by name ascending", async () => {
    (getSession as jest.Mock).mockResolvedValue({
      isAuthenticated: true,
      user: { id: "user-1", email: "test@example.com", name: "Test User" },
    });

    const mockUsers = [
      { id: "1", email: "charlie@example.com", name: "Charlie" },
      { id: "2", email: "alice@example.com", name: "Alice" },
      { id: "3", email: "bob@example.com", name: "Bob" },
    ];
    (prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers);

    await GET();

    expect(prisma.user.findMany).toHaveBeenCalledWith({
      orderBy: { name: "asc" },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });
  });

  it("should return all users", async () => {
    (getSession as jest.Mock).mockResolvedValue({
      isAuthenticated: true,
      user: { id: "user-1", email: "test@example.com", name: "Test User" },
    });

    const mockUsers = [
      { id: "1", email: "user1@example.com", name: "User One" },
      { id: "2", email: "user2@example.com", name: "User Two" },
      { id: "3", email: "user3@example.com", name: "User Three" },
    ];
    (prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers);

    const response = await GET();
    const body = await response.json();

    expect(body).toHaveLength(3);
  });

  it("should return 500 when database error occurs", async () => {
    (getSession as jest.Mock).mockResolvedValue({
      isAuthenticated: true,
      user: { id: "user-1", email: "test@example.com", name: "Test User" },
    });

    (prisma.user.findMany as jest.Mock).mockRejectedValue(new Error("Database error"));

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ errors: { auth: "An error occurred" } });
  });
});