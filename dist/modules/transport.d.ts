import { HawkEvent } from '../../types/hawk-event';
/**
 * Custom transport class for sending errors
 *
 * @copyright CodeX
 */
export default class Transport {
    private readonly url;
    /**
     *
     * @param collectorEndpoint
     */
    constructor(collectorEndpoint: string);
    /**
     *
     * @param event
     */
    send(event: HawkEvent): Promise<void>;
}
