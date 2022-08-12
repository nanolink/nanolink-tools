import { Connection } from "../index";
import { LogSubscriptions } from "../definitions/logsubscriptions";

class TripReceiver {
  connection: Connection;
  /**
   *
   * @param {Connection} connection
   */
  constructor(connection: Connection) {
    this.connection = connection;
  }

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
  onInitialReceived() {}
  makecopy_notype(o: any) {
    let retVal: any = new Object();
    Object.assign(retVal, o);
    delete retVal.__typename;
    return retVal;
  }

  /**
   *
   * @param {object} data - Set this callback to receive data.
   */
  onDataReceived(data: any) {}
}
export { TripReceiver };
