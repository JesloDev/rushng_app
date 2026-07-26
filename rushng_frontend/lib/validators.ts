import { isValidEmail, isValidPhone } from './utils';

// ============================================================
// TYPES & INTERFACES
// ============================================================

export interface ValidationResult {
  valid: boolean;
  message?: string;
}

export type ValidationRule = {
  validate: (value: any) => ValidationResult;
  required?: boolean;
  requiredMessage?: string;
};

export type ValidationSchema = Record<string, ValidationRule>;

// ============================================================
// VALIDATION FUNCTIONS
// ============================================================

export const validators = {
  /**
   * Validates a name (minimum 2 characters, letters, spaces, hyphens, apostrophes)
   */
  name: (value: string): ValidationResult => {
    if (!value || value.trim().length < 2) {
      return { valid: false, message: 'Name must be at least 2 characters' };
    }
    // Supports compound/hyphenated names, apostrophes, and unicode letters
    if (!/^[a-zA-Z\u00C0-\u024F\s\-']+$/.test(value.trim())) {
      return { valid: false, message: 'Name can only contain letters and standard characters' };
    }
    return { valid: true };
  },

  /**
   * Validates an email address
   */
  email: (value: string): ValidationResult => {
    if (!value) {
      return { valid: false, message: 'Email is required' };
    }
    if (!isValidEmail(value)) {
      return { valid: false, message: 'Please enter a valid email address' };
    }
    return { valid: true };
  },

  /**
   * Validates a Nigerian phone number
   */
  phone: (value: string): ValidationResult => {
    if (!value) {
      return { valid: false, message: 'Phone number is required' };
    }
    if (!isValidPhone(value)) {
      return { valid: false, message: 'Please enter a valid Nigerian phone number' };
    }
    return { valid: true };
  },

  /**
   * Validates a password (minimum 8 chars, 1 letter, 1 number)
   */
  password: (value: string): ValidationResult => {
    if (!value) {
      return { valid: false, message: 'Password is required' };
    }
    if (value.length < 8) {
      return { valid: false, message: 'Password must be at least 8 characters' };
    }
    if (!/[A-Za-z]/.test(value)) {
      return { valid: false, message: 'Password must contain at least one letter' };
    }
    if (!/\d/.test(value)) {
      return { valid: false, message: 'Password must contain at least one number' };
    }
    return { valid: true };
  },

  /**
   * Validates password confirmation matches
   */
  confirmPassword: (password: string, confirm: string): ValidationResult => {
    if (!confirm) {
      return { valid: false, message: 'Please confirm your password' };
    }
    if (password !== confirm) {
      return { valid: false, message: 'Passwords do not match' };
    }
    return { valid: true };
  },

  /**
   * Validates a physical address
   */
  address: (value: string): ValidationResult => {
    if (!value || value.trim().length < 5) {
      return { valid: false, message: 'Address must be at least 5 characters' };
    }
    return { valid: true };
  },

  /**
   * Validates a title (5 - 255 chars)
   */
  title: (value: string): ValidationResult => {
    if (!value || value.trim().length < 5) {
      return { valid: false, message: 'Title must be at least 5 characters' };
    }
    if (value.trim().length > 255) {
      return { valid: false, message: 'Title cannot exceed 255 characters' };
    }
    return { valid: true };
  },

  /**
   * Validates a description (20 - 5000 chars)
   */
  description: (value: string): ValidationResult => {
    if (!value || value.trim().length < 20) {
      return { valid: false, message: 'Description must be at least 20 characters' };
    }
    if (value.trim().length > 5000) {
      return { valid: false, message: 'Description cannot exceed 5000 characters' };
    }
    return { valid: true };
  },

  /**
   * Validates a price / financial amount
   */
  price: (value: number | string): ValidationResult => {
    if (value === undefined || value === null || value === '') {
      return { valid: true }; // Price is optional unless required by schema
    }
    const numValue = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(numValue)) {
      return { valid: false, message: 'Please enter a valid numeric price' };
    }
    if (numValue < 0) {
      return { valid: false, message: 'Price cannot be negative' };
    }
    if (numValue > 1000000000) {
      return { valid: false, message: 'Price exceeds maximum allowed amount' };
    }
    return { valid: true };
  },

  /**
   * Validates a rating score (1 to 5)
   */
  rating: (value: number): ValidationResult => {
    const num = typeof value === 'string' ? parseInt(value, 10) : value;
    if (isNaN(num) || num < 1 || num > 5) {
      return { valid: false, message: 'Rating must be between 1 and 5' };
    }
    return { valid: true };
  },

  /**
   * Validates a Nigerian NIN (11 digits)
   */
  nin: (value: string): ValidationResult => {
    if (!value) {
      return { valid: false, message: 'NIN is required' };
    }
    const cleanNin = value.trim();
    if (!/^\d{11}$/.test(cleanNin)) {
      return { valid: false, message: 'NIN must be exactly 11 digits' };
    }
    return { valid: true };
  },

  /**
   * Validates a Nigerian BVN (11 digits)
   */
  bvn: (value: string): ValidationResult => {
    if (!value) {
      return { valid: false, message: 'BVN is required' };
    }
    const cleanBvn = value.trim();
    if (!/^\d{11}$/.test(cleanBvn)) {
      return { valid: false, message: 'BVN must be exactly 11 digits' };
    }
    return { valid: true };
  },

  /**
   * Validates a URL
   */
  url: (value: string): ValidationResult => {
    if (!value) return { valid: true }; // Optional unless required
    try {
      new URL(value);
      return { valid: true };
    } catch {
      return { valid: false, message: 'Please enter a valid URL (e.g. https://...)' };
    }
  },

  /**
   * Validates geographic coordinates
   */
  location: (lat: number, lng: number): ValidationResult => {
    if (lat === undefined || lng === undefined || lat === null || lng === null) {
      return { valid: false, message: 'Location coordinates are required' };
    }
    if (isNaN(lat) || lat < -90 || lat > 90) {
      return { valid: false, message: 'Invalid latitude value' };
    }
    if (isNaN(lng) || lng < -180 || lng > 180) {
      return { valid: false, message: 'Invalid longitude value' };
    }
    return { valid: true };
  },
};

// ============================================================
// FORM VALIDATION HELPER
// ============================================================

/**
 * Validates form state objects against a validation schema
 */
export function validateForm(
  data: Record<string, any>,
  schema: ValidationSchema
): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  let isValid = true;

  for (const [field, rule] of Object.entries(schema)) {
    const value = data[field];

    const isEmpty =
      value === undefined ||
      value === null ||
      (typeof value === 'string' && value.trim() === '') ||
      (Array.isArray(value) && value.length === 0);

    if (rule.required && isEmpty) {
      const fieldLabel = field.replace(/_/g, ' ');
      errors[field] = rule.requiredMessage || `${fieldLabel.charAt(0).toUpperCase() + fieldLabel.slice(1)} is required`;
      isValid = false;
      continue;
    }

    if (!isEmpty) {
      const result = rule.validate(value);
      if (!result.valid) {
        errors[field] = result.message || `Invalid ${field}`;
        isValid = false;
      }
    }
  }

  return { valid: isValid, errors };
}