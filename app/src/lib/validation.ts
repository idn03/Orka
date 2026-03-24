export interface FormErrors {
  title?: string;
  dueDate?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: FormErrors;
}

export function validateTaskForm(title: string, dueDate: string): ValidationResult {
  const errors: FormErrors = {};

  const trimmedTitle = title.trim();
  if (!trimmedTitle) {
    errors.title = "Title is required";
  } else if (trimmedTitle.length > 255) {
    errors.title = "Title must be 255 characters or less";
  }

  if (dueDate) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dueDate)) {
      errors.dueDate = "Due date must be a valid date (YYYY-MM-DD)";
    } else {
      const date = new Date(dueDate);
      if (isNaN(date.getTime())) {
        errors.dueDate = "Due date must be a valid date";
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
