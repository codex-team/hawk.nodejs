import {SourceCodeLine, BacktraceFrame, HawkEvent, HawkInitialSettings} from '../types/index';
import {CallSiteObject, StackTraceFrame} from "../types/stack-trace";
const axios = require('axios').default;
const stackTrace = require('stack-trace');
const fs = require('fs');

/**
 * Default Collector's URL
 */
const DEFAULT_EVENT_COLLECTOR_URL = 'https://k1.hawk.so/';

/**
 * Number of file lines before and after errored line
 * to be read and send to Hawk for better event view
 */
const LINES_BUFFER: number = 5;

/**
 * Hawk NodeJS Catcher
 * Module for errors and exceptions tracking
 *
 * @copyright CodeX
 */
export default class Catcher {

  /**
   * Catcher Type
   */
  private readonly type: string = 'errors/nodejs';

  /**
   * User project's Integration Token
   */
  private readonly token: string;

  /**
   * Collector's url
   */
  private readonly collectorEndpoint: string;

  /**
   * Catcher constructor
   *
   * @param {HawkInitialSettings|string} settings - If settings is a string, it means an Integration Token
   */
  constructor(settings: HawkInitialSettings | string) {
    if (typeof settings === 'string') {
      settings = {
        token: settings,
      } as HawkInitialSettings;
    }

    this.token = settings.token;
    this.collectorEndpoint = settings.collectorEndpoint || DEFAULT_EVENT_COLLECTOR_URL;

    if (!this.token) {
      throw new Error('Integration Token is missed. You can get it on https://hawk.so at Project Settings.');
    }

    /**
     * Set handlers
     */
    this.initGlobalHandlers();
  }

  /**
   * Define own error handlers
   */
  private initGlobalHandlers(): void {
    const process = require('process');

    process.on('uncaughtException', (err: Error) => {
      this.catchError(err);
    });

    process.on('unhandledRejection',  (err: Error) => {
      this.catchError(err);
    });
  };

  /**
   * Send test event from client
   */
  public test(): void {
    const fakeEvent = new Error('Hawk NodeJS Catcher test message');

    this.catchError(fakeEvent);
  }

  /**
   * This method prepares and sends an Error to Hawk
   * User can fire it manually on try-catch
   *
   * @param error - error to catch
   */
  public catchError(error: Error): void {
    this.formatAndSend(error);
  }

  /**
   * Format and send an error
   *
   * @param error - error to send
   * @param {object} integrationAddons - addons spoiled by Integration
   */
  private formatAndSend(error: Error, integrationAddons?: { [key: string]: any }): void {
    const payloadFormatted = {
      title: error.message,
      type: error.name,
      backtrace: this.composeBacktrace(error)
    };

    const eventFormatted = {
      token: this.token,
      catcherType: this.type,
      payload: payloadFormatted
    }

    this.sendErrorFormatted(eventFormatted);
  }

  private composeBacktrace(error: Error): BacktraceFrame[] {
    const parsedStack = stackTrace.parse(error);

    stackTrace.get().forEach((site: CallSiteObject) => {
      console.log(site.getThis().getFileName())
    });

    let backtrace: BacktraceFrame[] = [];

    parsedStack.forEach((frame: StackTraceFrame) => {
      /**
       * Check if a frame is an internal Node's call
       */
      const isInternal = frame.native || (frame.fileName &&
        !frame.fileName.startsWith('/') &&
        !frame.fileName.startsWith('.') &&
        frame.fileName.indexOf(':\\') !== 1);

      /** Create variable for sourceCode data */
      let sourceCode: SourceCodeLine[] | null;

      if (isInternal) {
        /**
         * Do not find file for internal call frame
         */
        sourceCode = null;
      } else {
        /**
         * Read source file as array of lines
         */
        const lines = fs.readFileSync(frame.fileName, 'utf-8')
          .split('\n');

        /** Count line number in an array */
        const actualLineNumber = frame.lineNumber - 1; // starts from 0;

        /** Define line number to start copy code */
        const lineFrom = Math.max(0, actualLineNumber - LINES_BUFFER);

        /** Define line number to end copy code */
        const lineTo = Math.min(lines.length - 1, actualLineNumber + LINES_BUFFER + 1);

        /** Get buffer lines from files */
        const linesToCollect = lines.slice(lineFrom, lineTo);

        /** Compose code chunk of file */
        sourceCode = linesToCollect.map((content: string, index: number) => {
          return {
            line: lineFrom + index + 1,
            content,
          };
        });
      }

      /** Create a backtrace frame data */
      let backtraceFrame: BacktraceFrame = {
        file: frame.fileName,
        line: frame.lineNumber,
        column: frame.columnNumber,
        function: frame.functionName
      }

      /** Add source code data if it is not empty */
      if (!!sourceCode) {
        backtraceFrame.sourceCode = sourceCode;
      }

      /** Add frame to backtrace array */
      backtrace.push(backtraceFrame);
    })

    console.log(backtrace);

    return backtrace;
  }

  /**
   * Sends formatted HawkEvent to the Collector
   *
   * @param {HawkEvent} eventFormatted - formatted event to send
   */
  private async sendErrorFormatted(eventFormatted: HawkEvent): Promise<void> {
    return axios.post(this.collectorEndpoint, eventFormatted);
  }
}

export {
  HawkInitialSettings
};
