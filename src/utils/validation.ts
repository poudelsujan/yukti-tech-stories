
export const validateFullName = (name: string): string | null => {
  if (!name || name.trim().length === 0) {
    return "Full name is required";
  }
  
  if (name.trim().length < 2) {
    return "Full name must be at least 2 characters long";
  }
  
  // Check if name contains only letters, spaces, and common name characters
  const nameRegex = /^[a-zA-Z\s\u0900-\u097F\u0980-\u09FF.-]+$/;
  if (!nameRegex.test(name.trim())) {
    return "Full name can only contain letters, spaces, dots, and hyphens";
  }
  
  // Check if name has at least one letter
  const hasLetter = /[a-zA-Z\u0900-\u097F\u0980-\u09FF]/.test(name);
  if (!hasLetter) {
    return "Full name must contain at least one letter";
  }
  
  return null;
};

export const validateEmail = (email: string): string | null => {
  if (!email || email.trim().length === 0) {
    return "Email is required";
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return "Please enter a valid email address";
  }
  
  return null;
};

export const validateNepalPhoneNumber = (phone: string): string | null => {
  if (!phone || phone.trim().length === 0) {
    return "Phone number is required";
  }
  
  // Remove spaces, dashes, and plus signs for validation
  const cleanPhone = phone.replace(/[\s\-\+]/g, '');
  
  // Nepal phone number patterns:
  // Mobile: 98XXXXXXXX or 97XXXXXXXX (10 digits starting with 98 or 97)
  // Landline: 01XXXXXXX (8-9 digits starting with area codes like 01, 021, etc.)
  // International format: +977 followed by the above
  
  // Check for international format first
  if (cleanPhone.startsWith('977')) {
    const nepaliPart = cleanPhone.substring(3);
    if (nepaliPart.length === 10 && /^(98|97)\d{8}$/.test(nepaliPart)) {
      return null; // Valid mobile with country code
    }
    if (nepaliPart.length >= 8 && nepaliPart.length <= 9 && /^0[1-9]\d{6,7}$/.test(nepaliPart)) {
      return null; // Valid landline with country code
    }
  }
  
  // Check for local format
  if (cleanPhone.length === 10 && /^(98|97)\d{8}$/.test(cleanPhone)) {
    return null; // Valid mobile number
  }
  
  if (cleanPhone.length >= 8 && cleanPhone.length <= 9 && /^0[1-9]\d{6,7}$/.test(cleanPhone)) {
    return null; // Valid landline number
  }
  
  return "Please enter a valid Nepal phone number (mobile: 98XXXXXXXX or 97XXXXXXXX, landline: 01XXXXXXX)";
};

export const validateAddress = (address: string): string | null => {
  if (!address || address.trim().length === 0) {
    return "Address is required";
  }
  
  if (address.trim().length < 5) {
    return "Address must be at least 5 characters long";
  }
  
  return null;
};

export const validateCity = (city: string): string | null => {
  if (!city || city.trim().length === 0) {
    return "City is required";
  }
  
  if (city.trim().length < 2) {
    return "City name must be at least 2 characters long";
  }
  
  const cityRegex = /^[a-zA-Z\s\u0900-\u097F\u0980-\u09FF.-]+$/;
  if (!cityRegex.test(city.trim())) {
    return "City name can only contain letters, spaces, dots, and hyphens";
  }
  
  return null;
};

export const validatePostalCode = (postalCode: string): string | null => {
  if (!postalCode || postalCode.trim().length === 0) {
    return "Postal code is required";
  }
  
  // Nepal postal codes are typically 5 digits
  const postalRegex = /^\d{5}$/;
  if (!postalRegex.test(postalCode.trim())) {
    return "Please enter a valid 5-digit postal code";
  }
  
  return null;
};
