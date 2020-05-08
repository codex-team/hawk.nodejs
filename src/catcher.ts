import Transport from './modules/transport';
import { HawkEvent } from '../types/hawk-event';
import { HawkInitialSettings } from '../types/hawk-initial-settings';

/**
 * Hawk Node.js Catcher
 * Module for errors and exceptions tracking
 *
 * @copyright CodeX
 */
export default class Catcher {
  /**
   * Node.js Catcher version
   */
  public readonly version: string;

  /**
   * Catcher Type
   */
  private readonly type: string = 'errors/nodejs';

  /**
   * User project's Integration Token
   */
  private readonly token: string;

  /**
   * Transport for dialog between Catcher and Collector
   */
  private readonly transport: Transport;

  /**
   * Current bundle version
   */
  private readonly release: string;

  /**
   * Catcher constructor
   *
   * @param settings - if settings is a string, it means an Integration Token
   */
  constructor(settings: HawkInitialSettings | string) {
    if (typeof settings === 'string') {
      settings = {
        token: settings,
      } as HawkInitialSettings;
    }

    this.token = settings.token;
    this.release = settings.release;

    /**
     * Init transport
     */
    this.transport = new Transport(settings.collectorEndpoint || 'https://k1.hawk.so/');

    /**
     * Set handlers
     */
    this.initGlobalHandlers();
  }

  /**
   * Init global errors handler
   */
  private initGlobalHandlers(): void {
    process.on('uncaughtException', (event: Error) => {
      this.handleEvent(event);
    });

    process.on('unhandledRejection', (event: Error) => {
      this.handleEvent(event);
    });
  }

  /**
   * Event handler
   *
   * @param event - handled error
   */
  private async handleEvent(event: Error): Promise<void> {
    await this.formatAndSend(event);
  }

  /**
   * Formatting error and send it to collector
   *
   * @param error - error for sending
   */
  private async formatAndSend(error: Error): Promise<void> {
    const preparedEvent = this.prepareErrorFormatted(error);

    await this.transport.send(preparedEvent);
  }

  /**
   * Prepare error to hawk event format
   *
   * @param error - error for preparing
   */
  private prepareErrorFormatted(error: Error): HawkEvent {
    return {
      catcherType: this.type,
      payload: {
        title: error.message,
        type: error.name,
        backtrace: error.stack,
      },
      token: this.token,
    };
  }
}
