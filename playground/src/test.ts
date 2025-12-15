/**
 * Test script for @hawk.so/nodejs
 * This script raises an exception and checks if it's sent to Hawk
 */
import HawkCatcher from '@hawk.so/nodejs';

/**
 * Initialize Hawk catcher
 * Replace with your actual integration token
 */
const HAWK_TOKEN = process.env.HAWK_TOKEN || 'eyJpbnRlZ3JhdGlvbklkIjoiNWIwZjBmYmUtNTM2OS00ODM0LWEwMjctNTZkMTM1YmU1OGU3Iiwic2VjcmV0IjoiYWY4ZjY1OTQtNzExOS00MWVmLWI4ZTAtMTcyMDYwZjBmODc2In0=';

console.log('Initializing Hawk Catcher...');
HawkCatcher.init(HAWK_TOKEN);
console.log('Hawk Catcher initialized successfully');

/**
 * Test function that raises an exception
 */
function testException(): void {
  console.log('\n--- Testing exception handling ---');

  try {
    /**
     * Raise a test error
     */
    throw new Error('Test exception from Hawk playground - this should be sent to Hawk');
  } catch (error) {
    /**
     * TypeScript strict mode: error is of type 'unknown'
     */
    if (error instanceof Error) {
      console.log('Caught exception:', error.message);
      console.log('Sending exception to Hawk...');

      /**
       * Send the exception to Hawk
       */
      HawkCatcher.send(error, {
        testContext: 'playground-test',
        timestamp: new Date().toISOString()
      });

      console.log('Exception sent to Hawk (check your Hawk dashboard)');
    } else {
      console.error('Caught non-Error exception:', error);
    }
  }
}

/**
 * Run the test
 */
console.log('\n=== Hawk Playground Test ===');
testException();
console.log('\n=== Test completed ===');

