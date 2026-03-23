export interface AuthValidationErrors {
  [field: string]: string;
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function validateRegistration(
  input: { name?: string; email?: string; password?: string },
  errors: AuthValidationErrors
): Promise<boolean> {
  const trimmedEmail = input.email?.trim();
  const trimmedName = input.name?.trim();

  if (!trimmedEmail) {
    errors.email = "Email is required";
  } else if (!isValidEmail(trimmedEmail)) {
    errors.email = "Invalid email format";
  }

  if (!trimmedName) {
    errors.name = "Name cannot be empty or whitespace only";
  }

  if (!input.password) {
    errors.password = "Password is required";
  } else if (input.password.length < 8) {
    errors.password = "Password must be at least 8 characters";
  }

  return Object.keys(errors).length === 0;
}

export async function validateCredentials(
  input: { email?: string; password?: string },
  errors: AuthValidationErrors
): Promise<boolean> {
  if (!input.email) {
    errors.email = "Email is required";
  } else if (!isValidEmail(input.email)) {
    errors.email = "Invalid email format";
  }

  if (!input.password) {
    errors.password = "Password is required";
  }

  return Object.keys(errors).length === 0;
}
