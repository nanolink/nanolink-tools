import { Connection } from "../index";
import { StateSubscriptions } from "../definitions/stateSubscriptions";

class TagPositionReceiver {
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
  async run(unwind?: boolean, subscribe?: boolean) {
    let iter = await this.connection.subscribe(
      StateSubscriptions.tag_positions,
      { subscribe: subscribe ?? true },
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
  onDataReceived(data: any | [any]): void {}
}
export { TagPositionReceiver };
