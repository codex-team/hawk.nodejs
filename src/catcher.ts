import {HawkInitialSettings} from '../types/hawk-initial-settings';
import {SourceCodeLine, BacktraceFrame, HawkEvent} from '../types/hawk-event';
import {StackTraceFrame} from "../types/stack-trace";
import {AxiosResponse} from "axios";
const axios = require('axios').default;
const stackTrace = require('stack-trace');

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
    this.collectorEndpoint = settings.collectorEndpoint || 'https://k1.hawk.so/';


    if (!this.token) {
      console.warn(
        'Integration Token is missed. You can get it on https://hawk.so at Project Settings.'
      );

      return;
    }

    /**
     * Set handlers
     */
    this.initGlobalHandlers();
  }

  private initGlobalHandlers(callback?: Function): void {
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
    const fakeEvent = new Error('Hawk NodeJS Catcher test message.');

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private formatAndSend(error: Error, integrationAddons?: { [key: string]: any }): void {
    const errorFormatted = {
      title: error.message,
      type: error.name,
      backtrace: this.composeBacktrace(error)
    };

    const eventFormatted = {
      token: this.token,
      catcherType: this.type,
      payload: errorFormatted
    }

    this.sendErrorFormatted(eventFormatted);
  }

  private composeBacktrace(error: Error): BacktraceFrame[] {
    const parsedStack = stackTrace.parse(error);

    console.log(parsedStack);

    let backtrace: BacktraceFrame[] = [];

    parsedStack.forEach((frame: StackTraceFrame) => {
      // console.log(frame);
      // console.log(frame.fileName);

      const isInternal = frame.native || (frame.fileName &&
          !frame.fileName.startsWith('/') &&
          !frame.fileName.startsWith('.') &&
        frame.fileName.indexOf(':\\') !== 1);

      // console.log('isInterval', isInternal);

      if (!isInternal) {
        const lines = require('fs').readFileSync(frame.fileName, 'utf-8')
          .split('\n');

        const actualLineNumber = frame.lineNumber - 1; // starts from 0;
        const lineFrom = Math.max(0, actualLineNumber - LINES_BUFFER);
        const lineTo = Math.min(lines.length - 1, actualLineNumber + LINES_BUFFER + 1);
        const linesToCollect = lines.slice(lineFrom, lineTo);

        const sourceCode: SourceCodeLine[] = linesToCollect.map((content: string, index: number) => {
          return {
            line: lineFrom + index + 1,
            content,
          };
        });
        console.log(sourceCode);

        backtrace.push({
          file: frame.fileName,
          line: frame.lineNumber,
          column: frame.columnNumber,
          sourceCode: sourceCode,
          function: frame.functionName
        });
      }
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
    await axios.post(this.collectorEndpoint, eventFormatted)
      .then((response: AxiosResponse) => {
        console.log(response.data);
      })
      .catch(console.error);
  }

}
