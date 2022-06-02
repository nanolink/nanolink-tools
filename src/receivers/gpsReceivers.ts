import { Connection } from "../index";
import { StateSubscriptions } from "../definitions/stateSubscriptions";

/**
 * Class to handle GPS updates.
 */
class GPSReceiver {
  connection: Connection;
  /**
   *
   * @param {Connection} connection - The connection handler
   */
  constructor(connection: Connection) {
    this.connection = connection;
  }
  /**
   *
   * @param {boolean} unwind - If true only single updates are sent to onDateReceived, otherwise it's an array
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
   *
   * @param {any | [any]} data - Set this callback to receive data.
   */
  onDataReceived(data: any | [any]) {}
}
export { GPSReceiver };
