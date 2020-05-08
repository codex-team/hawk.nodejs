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
    readonly version: string;
    /**
     * Catcher Type
     */
    private readonly type;
    /**
     * User project's Integration Token
     */
    private readonly token;
    /**
     * Transport for dialog between Catcher and Collector
     */
    private readonly transport;
    /**
     * Current bundle version
     */
    private readonly release;
    /**
     * Catcher constructor
     *
     * @param settings - if settings is a string, it means an Integration Token
     */
    constructor(settings: HawkInitialSettings | string);
    /**
     * Init global errors handler
     */
    private initGlobalHandlers;
    /**
     * Event handler
     *
     * @param event - handled error
     */
    private handleEvent;
    /**
     * Formatting error and send it to collector
     *
     * @param error - error for sending
     */
    private formatAndSend;
    /**
     * Prepare error to hawk event format
     *
     * @param error - error for preparing
     */
    private prepareErrorFormatted;
}
