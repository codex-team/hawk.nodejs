import {BacktraceFrame, SourceCodeLine} from "../../types";
import {StackTraceFrame} from "../../types/stack-trace";
const stackTrace = require('stack-trace');
const fs = require('fs');

/**
 * Number of file lines before and after errored line
 * to be read and send to Hawk for better event view
 */
const LINES_BUFFER: number = 8;

/**
 * Parsing and formatting error's backtrace
 */
export default class BacktraceHelper {
  /**
   * Error to be processed
   */
  private err: Error;

  /**
   * Initialize a class
   *
   * @param {Error} err
   */
  constructor(err: Error) {
    this.err = err;
  }

  /**
   * Return backtrace matching types scheme
   *
   * @returns {BacktraceFrame[]}
   */
  public getBacktrace(): BacktraceFrame[] {
    if (!this.err) {
      return [];
    }

    /**
     * Get stack frames
     */
    const parsedStack = stackTrace.parse(this.err);

    /**
     * Format frame data and gather them to array
     */
    return parsedStack.map(this.parseStackFrame.bind(this));
  }

  /**
   * Format frame data to BacktraceFrame scheme
   *
   * @param {StackTraceFrame} frame
   * @returns {BacktraceFrame}
   */
  private parseStackFrame(frame: StackTraceFrame): BacktraceFrame {
    /** Create variable for sourceCode data */
    let sourceCode: SourceCodeLine[] | null = null;

    /**
     * Get source file for non-internal call frames
     */
    if (!this.isInternal(frame) && frame.fileName && frame.lineNumber) {
      sourceCode = this.getFileChunk(frame.fileName, frame.lineNumber)
    }

    /** Push backtrace frame */
    return {
      file: frame.fileName,
      line: frame.lineNumber,
      column: frame.columnNumber,
      function: frame.functionName,
      sourceCode: sourceCode
    };
  }

  /**
   * Check if frame is an internal node call
   *
   * @param {StackTraceFrame} frame
   * @returns {boolean}
   */
  private isInternal(frame: StackTraceFrame): boolean {
    const hasEntriesForNonInternalCalls = frame.fileName
      && frame.fileName.indexOf(':\\') !== 1
      && !frame.fileName.startsWith('.')
      && !frame.fileName.startsWith('/');

    return frame.native || !!hasEntriesForNonInternalCalls;
  }

  /**
   * Read a source file as an array of lines
   *
   * @param {string} filepath
   * @returns {string[]}
   */
  private getSourceFileAsLines(filepath: string): string[] {
    return fs.readFileSync(filepath, 'utf-8')
      .split('\n');
  }

  /**
   * Return lines as file chuck with a target line
   *
   * @param {string} filename
   * @param {number} targetLine
   * @param {number} linesBuffer
   */
  private getFileChunk(filename: string, targetLine: number, linesBuffer: number = LINES_BUFFER) {
    /**
     * Read source file as array of lines
     */
    const lines = this.getSourceFileAsLines(filename);

    /** Count line number in an array */
    const actualLineNumber = targetLine - 1; // starts from 0;

    /** Define line number to start copy code */
    const lineFrom = Math.max(0, actualLineNumber - LINES_BUFFER);

    /** Define line number to end copy code */
    const lineTo = Math.min(lines.length - 1, actualLineNumber + LINES_BUFFER + 1);

    /** Get buffer lines from files */
    const linesToCollect = lines.slice(lineFrom, lineTo);

    /** Compose code chunk of file */
    return linesToCollect.map((content: string, index: number) => {
      return {
        line: lineFrom + index + 1,
        content,
      };
    });
  }
}
