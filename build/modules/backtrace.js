var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "fs", "stack-trace"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const fs_1 = __importDefault(require("fs"));
    const stack_trace_1 = __importDefault(require("stack-trace"));
    /**
     * Number of file lines before and after errored line
     * to be read and send to Hawk for better event view
     */
    const LINES_BUFFER = 8;
    /**
     * Parsing and formatting error's backtrace
     */
    class BacktraceHelper {
        /**
         * Initialize a class
         *
         * @param {Error} error — event error to be processed
         */
        constructor(error) {
            this.error = error;
        }
        /**
         * Return backtrace matching types scheme
         *
         * @returns {BacktraceFrame[]}
         */
        getBacktrace() {
            if (!this.error) {
                return [];
            }
            /**
             * Get stack frames
             */
            const parsedStack = stack_trace_1.default.parse(this.error);
            /**
             * Format frame data and gather them to array
             */
            return parsedStack.map(this.parseStackFrame.bind(this));
        }
        /**
         * Format frame data to BacktraceFrame scheme
         *
         * @param {StackTraceFrame} frame — backtrace step
         * @returns {BacktraceFrame}
         */
        parseStackFrame(frame) {
            /** Create variable for sourceCode data */
            let sourceCode = null;
            /**
             * Get source file for non-internal call frames
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
         *
         * @param {StackTraceFrame} frame — backtrace step
         * @returns {boolean}
         */
        isInternal(frame) {
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
        getSourceFileAsLines(filepath) {
            return fs_1.default.readFileSync(filepath, 'utf-8')
                .split('\n');
        }
        /**
         * Return lines as file chuck with a target line
         *
         * @param {string} filename - path to file to be read
         * @param {number} targetLine - number of line with an call
         * @param {number} linesBuffer — number of lines before and after target line to be read
         */
        getFileChunk(filename, targetLine, linesBuffer = LINES_BUFFER) {
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
            return linesToCollect.map((content, index) => {
                return {
                    line: lineFrom + index + 1,
                    content,
                };
            });
        }
    }
    exports.default = BacktraceHelper;
});
