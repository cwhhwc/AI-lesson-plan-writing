/**
 * Validates a password based on length and complexity rules.
 * @param {string} password - The password to validate.
 * @returns {{valid: boolean, error: (null|'length'|'complexity')}} 
 *          - valid: true if the password is valid.
 *          - error: null if valid, otherwise a string key for the error type.
 */
export function validatePassword(password) {
  // 1. Length check
  if (password.length < 6 || password.length > 18) {
    return { valid: false, error: 'length' };
  }

  // 2. Complexity check
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  if (!hasUpperCase || !hasLowerCase || !hasNumber) {
    return { valid: false, error: 'complexity' };
  }

  // All checks passed
  return { valid: true, error: null };
}

/**
 * Validates an email format.
 * @param {string} email - The email to validate.
 * @returns {boolean} - True if the email format is valid.
 */
export function isValidEmail(email) {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
