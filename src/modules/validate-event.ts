import type { EventData, NodeJSAddons } from '@hawk.so/types';

/**
 * Checks if value is a plain object (not array, Date, etc.)
 *
 * @param v - value to check
 */
function isPlainObject(v: unknown): v is Record<string, unknown> {
  return Object.prototype.toString.call(v) === '[object Object]';
}

/**
 * Runtime check for required EventData fields.
 * Per @hawk.so/types EventData, `title` is the only non-optional field.
 * Additionally validates `backtrace` shape if present (must be an array).
 *
 * @param v - value to validate
 */
// eslint-disable-next-line jsdoc/require-jsdoc -- type guard documented above
export function isValidEventPayload(v: unknown): v is EventData<NodeJSAddons> {
  if (!isPlainObject(v)) {
    return false;
  }

  if (typeof v.title !== 'string' || v.title.trim() === '') {
    return false;
  }

  if (v.backtrace !== undefined && !Array.isArray(v.backtrace)) {
    return false;
  }

  return true;
}
