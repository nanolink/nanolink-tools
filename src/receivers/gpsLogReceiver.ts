import { Connection } from "../index";
import { LogSubscriptions } from "../definitions/logSubscriptions";

/**
 * Class to handle GPS updates.
 */
class GPSLogReceiver {
  connection: Connection;
  from: String;
  startFrom: String;
  /**
   *
   * @param {Connection} connection - The connection handler
   */
  constructor(connection: Connection, from: String, startFrom: String) {
    this.connection = connection;
    this.from = from;
    this.startFrom = startFrom;
  }
  /**
   *
   * @param {boolean} unwind - If true only single updates are sent to onDateReceived, otherwise it's an array
   */
  async run(unwind?: boolean) {
    let iter = await this.connection.subscribelog(
      LogSubscriptions.gpsLog,
      { from: this.from, startFrom: this.startFrom },
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
export { GPSLogReceiver };
