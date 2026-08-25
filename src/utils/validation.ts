export const isValidEmail = (value: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

// Loose check - good enough for a machine test; tighten if needed
export const isValidPhone = (value: string): boolean =>
  /^[0-9+\-\s()]{7,15}$/.test(value.trim());

export interface LoginFormErrors {
  email?: string;
  password?: string;
}

export function validateLoginForm(email: string, password: string): LoginFormErrors {
  const errors: LoginFormErrors = {};
  if (!email.trim()) errors.email = 'Email is required';
  else if (!isValidEmail(email)) errors.email = 'Enter a valid email address';

  if (!password) errors.password = 'Password is required';
  else if (password.length < 6) errors.password = 'Password must be at least 6 characters';

  return errors;
}

export interface LeadFormErrors {
  name?: string;
  phone?: string;
  email?: string;
}

export function validateLeadForm(values: { name: string; phone: string; email: string }): LeadFormErrors {
  const errors: LeadFormErrors = {};
  if (!values.name.trim()) errors.name = 'Name is required';
  if (!values.phone.trim()) errors.phone = 'Phone is required';
  else if (!isValidPhone(values.phone)) errors.phone = 'Enter a valid phone number';
  if (values.email.trim() && !isValidEmail(values.email)) errors.email = 'Enter a valid email address';
  return errors;
}
