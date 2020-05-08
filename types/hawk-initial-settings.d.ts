/**
 * Node.js Catcher initial settings
 *
 * @copyright CodeX
 */
export interface HawkInitialSettings {
  /**
   * User project's Integration Token
   */
  token: string;

  /**
   * Current release and bundle version
   */
  release?: string;

  /**
   * Hawk Collector endpoint.
   * Can be overwritten for development purposes.
   *
   * @example https://k1.hawk.so/
   */
  collectorEndpoint?: string;
}
