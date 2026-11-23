import mongoose from 'mongoose';

/**
 * Escapes regex special characters to prevent Regular Expression Denial of Service (ReDoS)
 * and regex injection vulnerabilities.
 */
export const escapeRegex = (str: string): string => {
  if (typeof str !== 'string') return '';
  return str.slice(0, 100).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Validates whether a given string is a valid MongoDB ObjectId.
 */
export const isValidObjectId = (id: any): boolean => {
  if (!id || typeof id !== 'string') return false;
  return mongoose.Types.ObjectId.isValid(id) && new mongoose.Types.ObjectId(id).toString() === id;
};
