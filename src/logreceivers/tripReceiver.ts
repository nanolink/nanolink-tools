import { Connection } from "../index";
import { LogSubscriptions } from "../definitions/logsubscriptions";

/**
 * Returns trip
 * @date 6/1/2023 - 8:52:27 AM
 *
 * @class TripReceiver
 */
class TripReceiver {
  /**
   * Connection handler
   * @date 6/1/2023 - 8:52:27 AM
   *
   * @type {Connection}
   */
  connection: Connection;
  /**
   * Creates an instance of TripReceiver.
   * @date 6/1/2023 - 1:03:08 PM
   *
   * @constructor
   * @param {Connection} connection
   */
  constructor(connection: Connection) {
    this.connection = connection;
  }

  /**
   * Run subscription
   * @date 6/1/2023 - 8:52:27 AM
   *
   * @async
   * @param {?boolean} [includeLinks] - Include what the receiver has links to
   * @param {?boolean} [includeGPS] - Include gps points in the link timerange
   * @param {?boolean} [includeOdometer] - Include odemeter values
   * @param {?string[]} [trackerVIDs] - Filter receivers. If null then all
   * @param {?string} [startTime] - Start time
   * @param {?string} [endTime] - End time
   * @param {?number} [minStopTimeInSeconds] - Min time between trips before they are consolidated
   * @param {?boolean} [includeInitial] - Include initial data
   * @param {?boolean} [subscribe] - Subcribe to changes
   * @returns {*}
   */
  async run(
    includeLinks?: boolean,
    includeGPS?: boolean,
    includeOdometer?: boolean,
    trackerVIDs?: string[],
    startTime?: string,
    endTime?: string,
    minStopTimeInSeconds?: number,
    includeInitial?: boolean,
    subscribe?: boolean
  ) {
    if (!this.connection.logSubscriptionHandler) {
      await this.connection.connectLog(true);
    }
    let iter = await this.connection.subscribelog(
      LogSubscriptions.trips(includeLinks, includeGPS, includeOdometer),
      {
        linkOption: includeLinks ? "ALL" : "NONE",
        gpsOption: includeGPS ? "ALL" : "NONE",
        odometerOption: includeOdometer ? "START_AND_END" : "NONE",
        includeInitial: includeInitial,
        trackerVIDs: trackerVIDs,
        subscribe: subscribe,
        start: startTime,
        end: endTime,
        minStopTime: minStopTimeInSeconds,
      }
    );
    let curTrip: any = null;
    for await (let r of iter) {
      if (r.type == "DONE" || r.type == "REC_DONE") {
        if (curTrip) {
          this.onDataReceived(curTrip);
          curTrip = null;
        }
        if (r.type == "DONE") {
          this.onInitialReceived();
        }
      } else if (r.data) {
        if (r.data.__typename == "QTrip") {
          if (curTrip) {
            this.onDataReceived(curTrip);
          }
          curTrip = this.makecopy_notype(r.data);
        } else if (r.data.__typename == "QOdomterTripInfo") {
          if (curTrip.odoStart) {
            curTrip.odoEnd = this.makecopy_notype(r.data);
          } else {
            curTrip.odoStart = this.makecopy_notype(r.data);
          }
        } else if (r.data.__typename == "QGPSTripInfo") {
          if (!curTrip.gps) {
            curTrip.gps = [];
          }
          curTrip.gps.push(this.makecopy_notype(r.data));
        } else if (r.data.__typename == "QLinkTripInfo") {
          if (!curTrip.links) {
            curTrip.links = [];
          }
          curTrip.links.push(this.makecopy_notype(r.data));
        }
      }
    }
  }
  /**
   * Called when initial data has been received
   * @date 6/1/2023 - 8:52:27 AM
   */
  onInitialReceived() {}
  /**
   * Internal function copy an object without the __typename property
   * @date 6/1/2023 - 8:52:27 AM
   *
   * @param {*} o
   * @returns {*}
   */
  private makecopy_notype(o: any) {
    let retVal: any = new Object();
    Object.assign(retVal, o);
    delete retVal.__typename;
    return retVal;
  }

  /**
   * Called when data is received
   * @param {object} data - Set this callback to receive data.
   */
  onDataReceived(data: any) {}
}
export { TripReceiver };
