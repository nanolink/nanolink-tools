import { Connection } from "../index";
import { StateSubscriptions } from "../definitions/stateSubscriptions";

/**
 * Tag position receiver
 * @date 6/1/2023 - 1:32:15 PM
 *
 * @class TagPositionReceiver
 */
class TagPositionReceiver {
  /**
   * Connection handler
   * @date 6/1/2023 - 1:32:15 PM
   *
   * @type {Connection}
   */
  connection: Connection;
  /**
   * Creates an instance of TagPositionReceiver.
   * @date 6/1/2023 - 1:33:38 PM
   *
   * @constructor
   * @param {Connection} connection - The connection handler
   */
  constructor(connection: Connection) {
    this.connection = connection;
  }
  /**
   * Run subscription
   * @date 6/1/2023 - 1:34:24 PM
   *
   * @async
   * @param {?boolean} [unwind] - If true only single updates are sent to onDateReceived, otherwise it's an array
   * @param {?boolean} [subscribe] - Keep subscription running to receive updates
   * @returns {*}
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
      } else {
        if (r.type == "DONE") {
          this.onInitialReceived();
        }
      }
    }
  }
  /**
   * Called when initial data has been received
   * @date 6/1/2023 - 1:32:15 PM
   */
  onInitialReceived() {}
  /**
   * Call back receiving data
   * @param {any | [any]} data - Set this callback to receive data.
   */
  onDataReceived(data: any | [any]): void {}
}
export { TagPositionReceiver };
