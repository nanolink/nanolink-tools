import { Connection } from "../index";
import { StateSubscriptions } from "../definitions/stateSubscriptions";

/**
 * Class to get GPS states and updates
 * @date 6/1/2023 - 1:14:17 PM
 *
 * @class GPSReceiver
 * @param {Connection} connection - Connection handler
 */
class GPSReceiver {
  /**
   * Connection handler
   * @date 6/1/2023 - 1:14:10 PM
   *
   * @type {Connection}
   */
  connection: Connection;
  /**
   * Creates an instance of GPSReceiver.
   * @date 6/1/2023 - 1:15:22 PM
   *
   * @constructor
   * @param {Connection} connection - The connection handler
   */
  constructor(connection: Connection) {
    this.connection = connection;
  }
  /**
   * Run subscription
   * @date 6/1/2023 - 1:15:47 PM
   *
   * @async
   * @param {?boolean} [unwind]- If true only single updates are sent to onDateReceived, otherwise it's an array
   * @returns {*}
   */
  async run(unwind?: boolean) {
    let iter = await this.connection.subscribe(
      StateSubscriptions.gps,
      {},
      unwind
    );
    for await (let r of iter) {
      if (r.data) {
        this.onDataReceived(r.data);
      }
    }
  }
  /**
   * Data received call back
   * @date 6/1/2023 - 1:16:20 PM
   *
   * @param {(any | [any])} data
   */
  onDataReceived(data: any | [any]) {}
}
export { GPSReceiver };
