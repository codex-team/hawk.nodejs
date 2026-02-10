import { describe, it, expect } from 'vitest';
import { isValidEventPayload } from '../src/utils/validate-event.js';

describe('isValidEventPayload', () => {
  it('accepts a valid payload with title', () => {
    expect(isValidEventPayload({ title: 'Error: test' })).toBe(true);
  });

  it('accepts a full payload', () => {
    expect(isValidEventPayload({
      title: 'TypeError: x is not a function',
      type: 'TypeError',
      backtrace: [{ file: 'index.js', line: 1, column: 1 }],
      release: '1.0.0',
      context: { foo: 'bar' },
    })).toBe(true);
  });

  it('rejects non-objects', () => {
    expect(isValidEventPayload(null)).toBe(false);
    expect(isValidEventPayload(undefined)).toBe(false);
    expect(isValidEventPayload(true)).toBe(false);
    expect(isValidEventPayload(42)).toBe(false);
    expect(isValidEventPayload('string')).toBe(false);
  });

  it('rejects arrays', () => {
    expect(isValidEventPayload([{ title: 'test' }])).toBe(false);
  });

  it('rejects empty object (missing title)', () => {
    expect(isValidEventPayload({})).toBe(false);
  });

  it('rejects empty string title', () => {
    expect(isValidEventPayload({ title: '' })).toBe(false);
  });

  it('rejects whitespace-only title', () => {
    expect(isValidEventPayload({ title: '   ' })).toBe(false);
  });

  it('rejects non-string title', () => {
    expect(isValidEventPayload({ title: 123 })).toBe(false);
    expect(isValidEventPayload({ title: null })).toBe(false);
    expect(isValidEventPayload({ title: {} })).toBe(false);
  });

  it('rejects non-array backtrace', () => {
    expect(isValidEventPayload({ title: 'Error', backtrace: 'not an array' })).toBe(false);
    expect(isValidEventPayload({ title: 'Error', backtrace: {} })).toBe(false);
    expect(isValidEventPayload({ title: 'Error', backtrace: 42 })).toBe(false);
  });

  it('accepts undefined backtrace', () => {
    expect(isValidEventPayload({ title: 'Error' })).toBe(true);
  });

  it('accepts empty array backtrace', () => {
    expect(isValidEventPayload({ title: 'Error', backtrace: [] })).toBe(true);
  });
});
