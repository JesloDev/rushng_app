import { isValidEmail, isValidPhone } from './utils';

// ============================================================
// VALIDATION FUNCTIONS
// ============================================================

export const validators = {
  /**
   * Validates a name (minimum 2 characters, letters only)
   */
  name: (value: string): { valid: boolean; message?: string } => {
    if (!value || value.trim().length < 2) {
      return { valid: false, message: 'Name must be at least 2 characters' };
    }
    if (!/^[a-zA-Z\s\-']+$/.test(value)) {
      return { valid: false, message: 'Name can only contain letters' };
    }
    return { valid: true };
  },

  /**
   * Validates an email address
   */
  email: (value: string): { valid: boolean; message?: string } => {
    if (!value) {
      return { valid: false, message: 'Email is required' };
    }
    if (!isValidEmail(value)) {
      return { valid: false, message: 'Please enter a valid email address' };
    }
    return { valid: true };
  },

  /**
   * Validates a phone number
   */
  phone: (value: string): { valid: boolean; message?: string } => {
    if (!value) {
      return { valid: false, message: 'Phone number is required' };
    }
    if (!isValidPhone(value)) {
      return { valid: false, message: 'Please enter a valid Nigerian phone number' };
    }
    return { valid: true };
  },

  /**
   * Validates a password
   */
  password: (value: string): { valid: boolean; message?: string } => {
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
   * Validates password confirmation
   */
  confirmPassword: (password: string, confirm: string): { valid: boolean; message?: string } => {
    if (password !== confirm) {
      return { valid: false, message: 'Passwords do not match' };
    }
    return { valid: true };
  },

  /**
   * Validates an address
   */
  address: (value: string): { valid: boolean; message?: string } => {
    if (!value || value.trim().length < 5) {
      return { valid: false, message: 'Address must be at least 5 characters' };
    }
    return { valid: true };
  },

  /**
   * Validates a title
   */
  title: (value: string): { valid: boolean; message?: string } => {
    if (!value || value.trim().length < 5) {
      return { valid: false, message: 'Title must be at least 5 characters' };
    }
    if (value.trim().length > 255) {
      return { valid: false, message: 'Title cannot exceed 255 characters' };
    }
    return { valid: true };
  },

  /**
   * Validates a description
   */
  description: (value: string): { valid: boolean; message?: string } => {
    if (!value || value.trim().length < 20) {
      return { valid: false, message: 'Description must be at least 20 characters' };
    }
    if (value.trim().length > 5000) {
      return { valid: false, message: 'Description cannot exceed 5000 characters' };
    }
    return { valid: true };
  },

  /**
   * Validates a price
   */
  price: (value: number): { valid: boolean; message?: string } => {
    if (value === undefined || value === null) {
      return { valid: true }; // Price is optional
    }
    if (value < 0) {
      return { valid: false, message: 'Price cannot be negative' };
    }
    if (value > 1000000000) {
      return { valid: false, message: 'Price exceeds maximum allowed' };
    }
    return { valid: true };
  },

  /**
   * Validates a rating (1-5)
   */
  rating: (value: number): { valid: boolean; message?: string } => {
    if (!value || value < 1 || value > 5) {
      return { valid: false, message: 'Rating must be between 1 and 5' };
    }
    return { valid: true };
  },

  /**
   * Validates NIN (11 digits)
   */
  nin: (value: string): { valid: boolean; message?: string } => {
    if (!value) {
      return { valid: false, message: 'NIN is required' };
    }
    if (!/^\d{11}$/.test(value)) {
      return { valid: false, message: 'NIN must be 11 digits' };
    }
    return { valid: true };
  },

  /**
   * Validates BVN (11 digits)
   */
  bvn: (value: string): { valid: boolean; message?: string } => {
    if (!value) {
      return { valid: false, message: 'BVN is required' };
    }
    if (!/^\d{11}$/.test(value)) {
      return { valid: false, message: 'BVN must be 11 digits' };
    }
    return { valid: true };
  },

  /**
   * Validates a URL
   */
  url: (value: string): { valid: boolean; message?: string } => {
    if (!value) return { valid: true }; // URL is optional
    try {
      new URL(value);
      return { valid: true };
    } catch {
      return { valid: false, message: 'Please enter a valid URL' };
    }
  },

  /**
   * Validates a location (latitude/longitude)
   */
  location: (lat: number, lng: number): { valid: boolean; message?: string } => {
    if (lat === undefined || lng === undefined) {
      return { valid: false, message: 'Location is required' };
    }
    if (lat < -90 || lat > 90) {
      return { valid: false, message: 'Invalid latitude' };
    }
    if (lng < -180 || lng > 180) {
      return { valid: false, message: 'Invalid longitude' };
    }
    return { valid: true };
  },
};

// ============================================================
// FORM VALIDATION HELPERS
// ============================================================

export type ValidationRule = {
  validate: (value: any) => { valid: boolean; message?: string };
  required?: boolean;
};

export type ValidationSchema = Record<string, ValidationRule>;

/**
 * Validates a form against a schema
 */
export function validateForm(
  data: Record<string, any>,
  schema: ValidationSchema
): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  let isValid = true;

  for (const [field, rule] of Object.entries(schema)) {
    const value = data[field];
    
    if (rule.required && (value === undefined || value === null || value === '')) {
      errors[field] = `${field} is required`;
      isValid = false;
      continue;
    }

    if (value !== undefined && value !== null && value !== '') {
      const result = rule.validate(value);
      if (!result.valid) {
        errors[field] = result.message || `Invalid ${field}`;
        isValid = false;
      }
    }
  }

  return { valid: isValid, errors };
}