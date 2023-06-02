import { Connection } from "../index";
import { LogSubscriptions } from "../definitions/logsubscriptions";

/**
 * Receiver for gps log
 * @date 6/1/2023 - 12:45:27 PM
 *
 * @class GPSLogReceiver
 * @param {Connection} connection - The connection handler
 * @param {String} from - ObjectId to start from. Can be used to get incremental changes
 * @param {String} startFrom - Date and time where the selection should start (RFC 3339) 
 */
class GPSLogReceiver {
  /**
   * Connection to the core and log server
   * @date 5/31/2023 - 3:53:43 PM
   *
   * @private
   * @type {Connection}
   */
  private connection: Connection;
  /**
   * Date/time when the selection should start
   * @date 5/31/2023 - 3:53:43 PM
   *
   * @private
   * @type {String}
   */
  private from: String;
  /**
   * ObjectId from where selection should start
   * @date 5/31/2023 - 3:53:43 PM
   *
   * @private
   * @type {String}
   */
  private startFrom: String;

  /**
   * Number of results
   * @date 6/1/2023 - 2:18:19 PM
   *
   * @private
   * @type {?Number}
   */
  private count: Number
  /**
   * Creates an instance of GPSLogReceiver.
   * @date 5/31/2023 - 3:56:08 PM
   *
   * @constructor
   * @param {Connection} connection - The connection handler
   * @param {String} from - ObjectId to start from. Can be used to get incremental changes
   * @param {String} startFrom - Date and time where the selection should start (RFC 3339) 
   */
  constructor(connection: Connection, from: String, startFrom: String, count?: Number) {
    this.connection = connection;
    this.from = from;
    this.startFrom = startFrom;
    this.count = count ?? 100000;
  }
  /**
   * Start the subscription
   * @date 5/31/2023 - 3:56:17 PM
   *
   * @async
   * @param {?boolean} [unwind] - If true then single documents are return, otherwise an array
   * @returns {*}
   */
  async run(unwind?: boolean) {
    let iter = await this.connection.subscribelog(
      LogSubscriptions.gpsLog,
      { from: this.from, startFrom: this.startFrom, count: this.count },
      unwind
    );
    for await (let r of iter) {
      if (r.data) {
        this.onDataReceived(r.data);
      }
    }
  }
  /**
   * Called when data is received from the subscription
   * @date 5/31/2023 - 3:56:58 PM
   *
   * @param {(any | [any])} data
   */
  onDataReceived(data: any | [any]) {}
}
export { GPSLogReceiver };
