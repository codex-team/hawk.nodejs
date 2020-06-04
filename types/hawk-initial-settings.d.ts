/**
 * HawkJS Catcher initial settings
 *
 * @copyright CodeX
 */
export interface HawkInitialSettings {
  /**
   * User project's Integration Token
   */
  token: string;

  /**
   * Hawk Collector endpoint.
   * Can be overwritten for development purposes.
   * @example http://localhost:3000/
   */
  collectorEndpoint?: string;
}
