/**
 * Utility functions for form input validation.
 */

/**
 * Validates whether a given string is a valid Vietnamese phone number.
 * Format requirements:
 * - 10 digits starting with 03, 05, 07, 08, 09 (e.g. 0912345678)
 * - Or international format starting with +84 or 84 (e.g. +84912345678, 84912345678)
 * Ignores spaces, dots, and hyphens.
 *
 * @param {string} phone
 * @returns {boolean}
 */
export const isValidVietnamesePhone = (phone) => {
  if (!phone || typeof phone !== "string") return false;
  const cleanPhone = phone.trim().replace(/[\s.\-()]/g, "");
  // Standard Vietnamese mobile prefix: (0 | +84 | 84) + [3|5|7|8|9] + 8 digits
  const vnPhoneRegex = /^(?:\+84|84|0)(3|5|7|8|9)\d{8}$/;
  return vnPhoneRegex.test(cleanPhone);
};

/**
 * Normalizes a Vietnamese phone number to standard 10-digit format (0xxxxxxxxx).
 *
 * @param {string} phone
 * @returns {string}
 */
export const normalizeVietnamesePhone = (phone) => {
  if (!phone || typeof phone !== "string") return "";
  const cleanPhone = phone.trim().replace(/[\s.\-()]/g, "");
  return cleanPhone.replace(/^(?:\+84|84)/, "0");
};

/**
 * Validates whether a given string is a valid email format.
 *
 * @param {string} email
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
  if (!email || typeof email !== "string") return false;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim());
};
