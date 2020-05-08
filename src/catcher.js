import Transport from './modules/transport';
/**
 * Hawk Node.js Catcher
 * Module for errors and exceptions tracking
 *
 * @copyright CodeX
 */
export default class Catcher {
    /**
     * Catcher constructor
     *
     * @param settings - if settings is a string, it means an Integration Token
     */
    constructor(settings) {
        /**
         * Catcher Type
         */
        this.type = 'errors/nodejs';
        if (typeof settings === 'string') {
            settings = {
                token: settings,
            };
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
    initGlobalHandlers() {
        process.on('uncaughtException', (event) => {
            this.handleEvent(event);
        });
        process.on('unhandledRejection', (event) => {
            this.handleEvent(event);
        });
    }
    /**
     * Event handler
     *
     * @param event - handled error
     */
    async handleEvent(event) {
        await this.formatAndSend(event);
    }
    /**
     * Formatting error and send it to collector
     *
     * @param error - error for sending
     */
    async formatAndSend(error) {
        const preparedEvent = this.prepareErrorFormatted(error);
        await this.transport.send(preparedEvent);
    }
    /**
     * Prepare error to hawk event format
     *
     * @param error - error for preparing
     */
    prepareErrorFormatted(error) {
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
//# sourceMappingURL=catcher.js.map