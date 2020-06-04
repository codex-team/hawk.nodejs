export interface StackTrace {
  //get(): StackTraceFrame[];

  parse(err: Error): StackTraceFrame[];
}

export interface StackTraceFrame {
  fileName: string;

  lineNumber: number;

  functionName: string,

  typeName: string,

  methodName: string,

  columnNumber: number,

  native: boolean;
}
