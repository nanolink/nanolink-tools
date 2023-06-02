import { Connection } from "../index";
import { StateSubscriptions } from "../definitions/stateSubscriptions";

/**
 * Transmitter links receiver
 * @date 6/1/2023 - 1:36:21 PM
 *
 * @class TransmitterLinksReceiver
 * @param {Connection} connection - Connection handler
 */
class TransmitterLinksReceiver {
  /**
   * Connection handler
   * @date 6/1/2023 - 1:36:15 PM
   *
   * @type {Connection}
   */
  connection: Connection;
  /**
   * Receiver types 
   * @date 6/1/2023 - 1:36:15 PM
   *
   * @type {?string[]}
   */
  receiverTypes?: string[];
  /**
   * If set then only return data when nearest change
   * @date 6/1/2023 - 1:36:15 PM
   *
   * @type {?boolean}
   */
  onlyWhenNearestChange?: boolean;
  /**
   * Creates an instance of TransmitterLinksReceiver.
   * @date 6/1/2023 - 1:37:52 PM
   *
   * @constructor
   * @param {Connection} connection - The connection handler
   * @param {?string[]} [receiverTypes] - Array of tracker types. Valid values: GPS_TRACKER, GPS_GATE_TRACKER, LAN_GATE_TRACKER, MOBILE_TRACKER, MESH_GATE_TRACKER, CROWD_TRACKER
   * @param {?boolean} [onlyWhenNearestChange] - Tells the subscription to only sent updates if the nearest link changes.
   */
  constructor(
    connection: Connection,
    receiverTypes?: string[],
    onlyWhenNearestChange?: boolean
  ) {
    this.connection = connection;
    this.receiverTypes = receiverTypes;
    this.onlyWhenNearestChange = onlyWhenNearestChange;
  }
  /**
   * Description placeholder
   * @date 6/1/2023 - 1:39:04 PM
   *
   * @async
   * @param {boolean} unwind - If true only single updates are sent to onDateReceived, otherwise it's an array
   * @param {?boolean} [includeLinks] - If true the specific links are resolved
   * @param {?boolean} [includeNewest]  - If true the newest link is resolved
   * @param {?boolean} [includeNearest]- if true the nearest link is resolved according to RSSI
   * @param {?boolean} [includeNewestByTrackerType] - Include newest by tracker type
   * @param {?boolean} [includeNewestByReferenceType] - Include newest by reference type
   * @returns {*}
   */
  async run(
    unwind: boolean,
    includeLinks?: boolean,
    includeNewest?: boolean,
    includeNearest?: boolean,
    includeNewestByTrackerType?: boolean,
    includeNewestByReferenceType?: boolean
  ) {
    let iter = await this.connection.subscribe(
      StateSubscriptions.transmitterLinks(
        includeLinks,
        includeNewest,
        includeNearest,
        includeNewestByTrackerType,
        includeNewestByReferenceType
      ),
      {
        subscribe: true,
        receiverTypes: this.receiverTypes,
        onlyWhenNearestChange: this.onlyWhenNearestChange,
      },
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
   * @date 6/1/2023 - 1:36:15 PM
   */
  onInitialReceived() {}
  /**
   * Call back receiving data
   * @param {any | [any]} data - Set this callback to receive data.
   */
  onDataReceived(data: any | [any]) {}
}
export { TransmitterLinksReceiver };
