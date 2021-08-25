import { BacktraceFrame, SourceCodeLine } from '@hawk.so/types';
import fs from 'fs';
import stackTrace, { StackTraceFrame } from 'stack-trace';

/**
 * Number of file lines before and after errored line
 * to be read and send to Hawk for better event view
 */
const LINES_BUFFER = 8;

/**
 * Parsing and formatting error's backtrace
 */
export default class BacktraceHelper {
  /**
   * Error to be processed
   */
  private error: Error;

  /**
   * Initialize a class
   *
   * @param {Error} error — event error to be processed
   */
  constructor(error: Error) {
    this.error = error;
  }

  /**
   * Return backtrace matching types scheme
   *
   * @returns {BacktraceFrame[]}
   */
  public getBacktrace(): BacktraceFrame[] {
    if (!this.error) {
      return [];
    }

    /**
     * Get stack frames
     */
    const parsedStack = stackTrace.parse(this.error);

    /**
     * Format frame data and gather them to array
     */
    const parsedFrames = parsedStack.map(this.parseStackFrame.bind(this));

    /**
     * Filter backtrace frames
     * Remove calls with a missing source code (internal calls)
     */
    return parsedFrames.filter((frame: BacktraceFrame) => frame.sourceCode);
  }

  /**
   * Format frame data to BacktraceFrame scheme
   *
   * @param {StackTraceFrame} frame — backtrace step
   * @returns {BacktraceFrame}
   */
  private parseStackFrame(frame: StackTraceFrame): BacktraceFrame {
    /** Create variable for sourceCode data */
    let sourceCode: SourceCodeLine[] = [];

    /**
     * Get source file for non-internal call frames
     * Check if we need to try to reach sources and show code pieces
     */
    if (!this.isInternal(frame) && frame.fileName && frame.lineNumber) {
      sourceCode = this.getFileChunk(frame.fileName, frame.lineNumber);
    }

    /** Push backtrace frame */
    return {
      file: frame.fileName,
      line: frame.lineNumber,
      column: frame.columnNumber,
      function: frame.functionName,
      sourceCode: sourceCode,
    };
  }

  /**
   * Check if frame is an internal node call
   * You should not reach sources and show code pieces for internal calls
   *
   * @param {StackTraceFrame} frame — backtrace step
   * @returns {boolean}
   */
  private isInternal(frame: StackTraceFrame): boolean {
    const hasEntriesForNonInternalCalls = frame.fileName &&
      frame.fileName.indexOf(':\\') !== 1 &&
      !frame.fileName.startsWith('.') &&
      !frame.fileName.startsWith('/');

    return frame.native || !!hasEntriesForNonInternalCalls;
  }

  /**
   * Read a source file as an array of lines
   *
   * @param {string} filepath - path to file to be read
   * @returns {string[]}
   */
  private getSourceFileAsLines(filepath: string): string[] {
    return fs.readFileSync(filepath, 'utf-8')
      .split('\n');
  }

  /**
   * Return lines as file chuck with a target line
   *
   * @param {string} filename - path to file to be read
   * @param {number} targetLine - number of line with an call
   * @param {number} linesBuffer — number of lines before and after target line to be read
   */
  private getFileChunk(filename: string, targetLine: number, linesBuffer: number = LINES_BUFFER): SourceCodeLine[] {
    /**
     * Read source file as array of lines
     */
    const lines = this.getSourceFileAsLines(filename);

    /** Count line number in an array */
    const actualLineNumber = targetLine - 1; // starts from 0;

    /** Define line number to start copy code */
    const lineFrom = Math.max(0, actualLineNumber - linesBuffer);

    /** Define line number to end copy code */
    const lineTo = Math.min(lines.length - 1, actualLineNumber + linesBuffer + 1);

    /** Get buffer lines from files */
    const linesToCollect = lines.slice(lineFrom, lineTo);

    /** Compose code chunk of file */
    return linesToCollect.map((content: string, index: number): SourceCodeLine => {
      return {
        line: lineFrom + index + 1,
        content,
      };
    });
  }
}
