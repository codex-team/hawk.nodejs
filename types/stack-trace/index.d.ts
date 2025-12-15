/**
 * Small types file for stack-trace package
 * @see https://github.com/felixge/node-stack-trace
 */
export as namespace stackTrace;

/**
 * Returns an array of CallSite objects, where element 0 is the current call site.
 * When passing a function on the current stack as the belowFn parameter,
 * the returned array will only include CallSite objects below this function.
 * @param [belowFn] - Function to get call sites below
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export function get(belowFn?: Function): CallSiteObject[];

/**
 * Parses the err.stack property of an Error object into an array
 * compatible with those returned by stackTrace.get(). However,
 * only the following methods are implemented on the returned CallSite objects.
 * @param err - Error object to parse
 */
export function parse(err: Error): StackTraceFrame[];

/**
 * @see https://deno.land/typedoc/interfaces/_deno_.callsite.html
 */
export interface CallSiteObject {
  /**
   * Returns the value of this
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getThis(): any;

  /**
   * Returns the type of this as a string. This is the name of
   * the function stored in the constructor field of this,
   * if available, otherwise the object's [[Class]] internal property.
   */
  getTypeName(): string | null;

  /**
   * Returns the current function
   */
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  getFunction(): Function | undefined;

  /**
   * Returns the name of the current function, typically its name property.
   * If a name property is not available an attempt will be made to try
   * to infer a name from the function's context.
   */
  getFunctionName(): string | null;

  /**
   * Returns the name of the property of this or one of its prototypes
   * that holds the current function
   */
  getMethodName(): string | null;

  /**
   * If this function was defined in a script returns the name of the script
   */
  getFileName(): string | null;

  /**
   * If this function was defined in a script returns the current line number
   */
  getLineNumber(): number | null;

  /**
   * If this function was defined in a script returns the current column number
   */
  getColumnNumber(): number | null;

  /**
   * If this function was created using a call to eval returns a CallSite object
   * representing the location where eval was called
   */
  getEvalOrigin(): string | undefined;

  /**
   * Is this a toplevel invocation, that is, is this the global object?
   */
  isToplevel(): boolean;

  /**
   * Does this call take place in code defined by a call to eval?
   */
  isEval(): boolean;

  /**
   * Is this call in native V8 code?
   */
  isNative(): boolean;

  /**
   * Is this a constructor call?
   */
  isConstructor(): boolean;
}

/**
 * Stack trace frame object
 */
export interface StackTraceFrame {
  /**
   * Name of the script if this function was defined in a script
   */
  fileName: string;

  /**
   * Name of the current function, typically its name property.
   * If a name property is not available an attempt will be made
   * to try to infer a name from the function's context.
   */
  functionName: string;

  /**
   * Current line number if this function was defined in a script
   */
  lineNumber: number;

  /**
   * Current column number if this function was defined in a script
   */
  columnNumber: number;

  /**
   * Type of this as a string. This is the name of the function
   * stored in the constructor field of this, if available,
   * otherwise the object's [[Class]] internal property.
   */
  typeName: string | null;

  /**
   * Name of the property of this or one of its prototypes that holds the current function
   */
  methodName: string | null;

  /**
   * Is this call in native V8 code?
   */
  native: boolean;
}
