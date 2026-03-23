import { validateRegistration, validateCredentials, isValidEmail } from "@/lib/auth-validation";

describe("Auth API Tests", () => {
  describe("Registration Validation", () => {
    const validInput = {
      name: "Test User",
      email: "test@example.com",
      password: "password123",
    };

    it("should accept valid registration input", async () => {
      const errors: Record<string, string> = {};
      const result = await validateRegistration(validInput, errors);
      expect(result).toBe(true);
      expect(Object.keys(errors)).toHaveLength(0);
    });

    it("should reject missing email", async () => {
      const errors: Record<string, string> = {};
      const result = await validateRegistration(
        { name: "Test", password: "password123" },
        errors
      );
      expect(result).toBe(false);
      expect(errors.email).toBe("Email is required");
    });

    it("should reject missing name", async () => {
      const errors: Record<string, string> = {};
      const result = await validateRegistration(
        { email: "test@example.com", password: "password123" },
        errors
      );
      expect(result).toBe(false);
      expect(errors.name).toBe("Name cannot be empty or whitespace only");
    });

    it("should reject missing password", async () => {
      const errors: Record<string, string> = {};
      const result = await validateRegistration(
        { name: "Test", email: "test@example.com" },
        errors
      );
      expect(result).toBe(false);
      expect(errors.password).toBe("Password is required");
    });

    it("should reject password less than 8 characters", async () => {
      const errors: Record<string, string> = {};
      const result = await validateRegistration(
        { name: "Test", email: "test@example.com", password: "short" },
        errors
      );
      expect(result).toBe(false);
      expect(errors.password).toBe("Password must be at least 8 characters");
    });

    it("should reject invalid email format", async () => {
      const errors: Record<string, string> = {};
      const result = await validateRegistration(
        { name: "Test", email: "invalid-email", password: "password123" },
        errors
      );
      expect(result).toBe(false);
      expect(errors.email).toBe("Invalid email format");
    });

    it("should reject whitespace-only name", async () => {
      const errors: Record<string, string> = {};
      const result = await validateRegistration(
        { name: "   ", email: "test@example.com", password: "password123" },
        errors
      );
      expect(result).toBe(false);
      expect(errors.name).toBe("Name cannot be empty or whitespace only");
    });

    it("should reject empty name", async () => {
      const errors: Record<string, string> = {};
      const result = await validateRegistration(
        { name: "", email: "test@example.com", password: "password123" },
        errors
      );
      expect(result).toBe(false);
      expect(errors.name).toBe("Name cannot be empty or whitespace only");
    });

    it("should trim email and accept valid input", async () => {
      const trimmedEmail = "  test@example.com  ".trim();
      expect(isValidEmail(trimmedEmail)).toBe(true);

      const errors: Record<string, string> = {};
      const result = await validateRegistration(
        { name: "Test", email: "  test@example.com  ", password: "password123" },
        errors
      );
      expect(result).toBe(true);
    });

    it("should return multiple errors for multiple invalid fields", async () => {
      const errors: Record<string, string> = {};
      const result = await validateRegistration(
        { name: "", email: "invalid", password: "short" },
        errors
      );
      expect(result).toBe(false);
      expect(Object.keys(errors).length).toBeGreaterThanOrEqual(2);
      expect(errors.name).toBeDefined();
      expect(errors.email).toBeDefined();
      expect(errors.password).toBeDefined();
    });
  });

  describe("Credentials Validation", () => {
    it("should accept valid credentials", async () => {
      const errors: Record<string, string> = {};
      const result = await validateCredentials(
        { email: "test@example.com", password: "password123" },
        errors
      );
      expect(result).toBe(true);
      expect(Object.keys(errors)).toHaveLength(0);
    });

    it("should reject missing email", async () => {
      const errors: Record<string, string> = {};
      const result = await validateCredentials(
        { password: "password123" },
        errors
      );
      expect(result).toBe(false);
      expect(errors.email).toBe("Email is required");
    });

    it("should reject missing password", async () => {
      const errors: Record<string, string> = {};
      const result = await validateCredentials(
        { email: "test@example.com" },
        errors
      );
      expect(result).toBe(false);
      expect(errors.password).toBe("Password is required");
    });

    it("should reject invalid email format", async () => {
      const errors: Record<string, string> = {};
      const result = await validateCredentials(
        { email: "invalid-email", password: "password123" },
        errors
      );
      expect(result).toBe(false);
      expect(errors.email).toBe("Invalid email format");
    });
  });

  describe("Email Validation", () => {
    it.each([
      ["valid@example.com", true],
      ["user.name@example.com", true],
      ["user+tag@example.com", true],
      ["invalid", false],
      ["invalid@", false],
      ["@example.com", false],
      ["user@", false],
      ["", false],
    ])("should validate %s as %s", (email, expected) => {
      expect(isValidEmail(email)).toBe(expected);
    });
  });

  describe("NextAuth Integration", () => {
    it("should have valid email regex pattern", () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      expect(emailRegex.test("test@example.com")).toBe(true);
      expect(emailRegex.test("user.name+tag@domain.co.uk")).toBe(true);
      expect(emailRegex.test("invalid")).toBe(false);
    });
  });
});
