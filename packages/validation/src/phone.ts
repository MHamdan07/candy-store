export interface PhoneNormalizationResult {
  isValid: boolean;
  normalized: string; // "+923001234567"
  display: string;    // "+92 300 1234567"
  masked: string;     // "+92 300 ••••567"
  error?: string;
}

/**
 * Normalizes a Pakistani phone number into standard international format (+923XXXXXXXXX).
 * Accepts formats:
 * - 03001234567
 * - 0300 1234567
 * - 0300-1234567
 * - +923001234567
 * - 923001234567
 * - 3001234567
 */
export function normalizePakistanPhone(input: string): PhoneNormalizationResult {
  if (!input || typeof input !== 'string') {
    return {
      isValid: false,
      normalized: '',
      display: '',
      masked: '',
      error: 'Phone number is required',
    };
  }

  // Remove spaces, dashes, parentheses
  const cleaned = input.replace(/[\s\-()]/g, '');

  // Check Pakistani mobile patterns
  // Mobile prefixes in PK are 0300 through 0355 (3XX followed by 7 digits)
  const pkRegex = /^(?:\+92|92|0)?(3[0-9]{9})$/;
  const match = cleaned.match(pkRegex);

  if (!match) {
    return {
      isValid: false,
      normalized: '',
      display: input,
      masked: input,
      error: 'Please enter a valid 11-digit Pakistan mobile number (e.g. 0300 1234567)',
    };
  }

  const localTenDigits = match[1]; // "3001234567"
  const normalized = `+92${localTenDigits}`;
  const prefix = localTenDigits.slice(0, 3); // "300"
  const mid = localTenDigits.slice(3, 7);    // "1234"
  const last = localTenDigits.slice(7);      // "567"

  const display = `+92 ${prefix} ${mid}${last}`;
  const masked = `+92 ${prefix} ••••${last}`;

  return {
    isValid: true,
    normalized,
    display,
    masked,
  };
}
