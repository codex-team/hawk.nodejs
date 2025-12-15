/**
 * Test script for @hawk.so/nodejs - Testing error addons
 * This script tests various error types to ensure addons are properly captured
 */
import HawkCatcher from '@hawk.so/nodejs';
import * as fs from 'fs';

/**
 * Initialize Hawk catcher
 * Replace with your actual integration token
 */
const HAWK_TOKEN = process.env.HAWK_TOKEN || 'eyJpbnRlZ3JhdGlvbklkIjoiNWIwZjBmYmUtNTM2OS00ODM0LWEwMjctNTZkMTM1YmU1OGU3Iiwic2VjcmV0IjoiYWY4ZjY1OTQtNzExOS00MWVmLWI4ZTAtMTcyMDYwZjBmODc2In0=';

console.log('Initializing Hawk Catcher...');
HawkCatcher.init({
  token: HAWK_TOKEN,
  beforeSend: (event) => {
    console.log('\n--- Event being sent to Hawk ---');
    console.log('Title:', event.title);
    console.log('Type:', event.type);
    console.log('Addons:', JSON.stringify(event.addons, null, 2));
    console.log('---\n');
    return event;
  }
});
console.log('Hawk Catcher initialized successfully');

/**
 * Test 1: Standard Error (no addons expected)
 */
function testStandardError(): void {
  console.log('\n=== Test 1: Standard Error ===');
  try {
    throw new Error('Standard error - no additional fields');
  } catch (error) {
    if (error instanceof Error) {
      console.log('Sending standard error...');
      HawkCatcher.send(error, { test: 'standard-error' });
    }
  }
}

/**
 * Test 2: Error with Node.js error code
 */
function testErrorWithCode(): void {
  console.log('\n=== Test 2: Error with Node.js Error Code ===');
  try {
    const error = new Error('Error with code');
    // @ts-ignore - adding code property
    error.code = 'ERR_INVALID_ARG_TYPE';
    throw error;
  } catch (error) {
    if (error instanceof Error) {
      console.log('Sending error with code...');
      HawkCatcher.send(error, { test: 'error-with-code' });
    }
  }
}

/**
 * Test 3: SystemError from file system operation
 */
function testSystemError(): void {
  console.log('\n=== Test 3: SystemError (File System) ===');
  try {
    fs.readFileSync('/nonexistent/path/to/file.txt');
  } catch (error) {
    if (error instanceof Error) {
      console.log('Sending SystemError...');
      HawkCatcher.send(error, { test: 'system-error' });
    }
  }
}

/**
 * Test 4: Custom error with multiple additional properties
 */
function testCustomError(): void {
  console.log('\n=== Test 4: Custom Error with Multiple Properties ===');
  try {
    const error = new Error('Custom error with additional fields');
    // @ts-ignore - adding custom properties
    error.code = 'CUSTOM_ERROR_CODE';
    // @ts-ignore
    error.statusCode = 500;
    // @ts-ignore
    error.details = {
      userId: 12345,
      action: 'update_profile',
      timestamp: new Date().toISOString()
    };
    // @ts-ignore
    error.retryable = true;
    throw error;
  } catch (error) {
    if (error instanceof Error) {
      console.log('Sending custom error...');
      HawkCatcher.send(error, { test: 'custom-error' });
    }
  }
}

/**
 * Test 5: TypeError
 */
function testTypeError(): void {
  console.log('\n=== Test 5: TypeError ===');
  try {
    // @ts-ignore - intentional type error
    null.someProperty();
  } catch (error) {
    if (error instanceof Error) {
      console.log('Sending TypeError...');
      HawkCatcher.send(error, { test: 'type-error' });
    }
  }
}

/**
 * Run all tests
 */
console.log('\n=== Hawk Playground - Error Addons Test Suite ===\n');

testStandardError();
setTimeout(() => testErrorWithCode(), 100);
setTimeout(() => testSystemError(), 200);
setTimeout(() => testCustomError(), 300);
setTimeout(() => testTypeError(), 400);

setTimeout(() => {
  console.log('\n=== All tests completed ===');
  console.log('Check the console output above to see the addons for each error type.');
}, 500);
