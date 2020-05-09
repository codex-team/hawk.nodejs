import axios from 'axios';
import { HawkEvent } from '../../types/hawk-event';

/**
 * Custom transport class for sending errors
 *
 * @copyright CodeX
 */
export default class Transport {
  private readonly url: string;

  /**
   *
   * @param collectorEndpoint
   */
  constructor(collectorEndpoint: string) {
    this.url = collectorEndpoint;
  }

  /**
   *
   * @param event
   */
  public async send(event: HawkEvent): Promise<void> {
    await axios.post(this.url, event);
  }
}
