import { Connection } from "../index";
import { LogSubscriptions } from "../definitions/logsubscriptions";

/**
 * Log data containing all information about a historic link
 */

class LogLinksReceiver {
  connection: Connection;

  variables = {
    subscribe: false,
    includeInitial: false,
    includeGPS: false,
    includeRSSI: false,
    includeTrackerReference: false,
    excludeNullGPS: false,
    filter: {
      receiver: "",
      transmitter: "",
      trackers: [] as string[],
      start: "",
      end: "",
      cursor: {
        count: 0,
        from: "",
      },
    },
  };

  constructor(
    connection: Connection,
    subscribe: boolean,
    includeInitial: boolean,
    includeGPS: boolean,
    includeRSSI: boolean,
    includeTrackerReference: boolean,
    excludeNullGPS: boolean,
    receiverVID: string,
    transmitterVID: string,
    trackers: string[],
    startTime: string,
    endTime: string,
    fromId: string,
    limit: number
  ) {
    this.connection = connection;
    this.variables.subscribe = subscribe;
    this.variables.includeInitial = includeInitial;
    this.variables.includeGPS = includeGPS;
    this.variables.includeRSSI = includeRSSI;
    this.variables.includeTrackerReference = includeTrackerReference;
    this.variables.excludeNullGPS = excludeNullGPS;
    this.variables.filter.receiver = receiverVID;
    this.variables.filter.transmitter = transmitterVID;
    this.variables.filter.trackers = trackers;
    this.variables.filter.start = startTime;
    this.variables.filter.end = endTime;
    this.variables.filter.cursor.from = fromId;
    this.variables.filter.cursor.count = limit;
    console.log(this.variables);
  }

  async run() {
    if (!this.connection.logSubscriptionHandler) {
      this.connection.connectLog(false);
    }
    /**
     * Setup for paging to not flood the client with data
     */
    // Make copy of filter to be able to manipulate without destroying
    let vars = { ...this.variables };
    let cursor = { ...this.variables.filter.cursor };
    vars.filter = { ...this.variables.filter };
    vars.filter.cursor = cursor;

    let hasLimit = cursor.count ? true : false;
    let limitLeft = cursor.count;
    while (true) {
      if (hasLimit) {
        if (limitLeft > 1000) {
          cursor.count = 1000;
          limitLeft -= 1000;
        } else {
          if (limitLeft) {
            cursor.count = limitLeft;
            limitLeft = 0;
          } else {
            break;
          }
        }
      } else {
        cursor.count = 1000;
      }
      let sub = await this.connection.subscribelog(
        LogSubscriptions.linksCompound,
        vars
      );
      let curLink = null;
      for await (let doc of sub) {
        let data = doc.data;
        if (data) {
          if (!curLink || curLink.linkId != data.linkId) {
            if (curLink) {
              this.onDataReceived(curLink);
            }
            curLink = {
              linkId: data.linkId,
              linkStart: data.linkStart,
              gps: [] as any[],
              references: [] as any[],
              rssi: [] as any[],
            };
          }
          cursor.from = curLink.linkId;
          switch (data.info.__typename) {
            case "QBLELinkInfo":
              Object.assign(curLink, data.info);
              break;
            case "QBLELinkGPS":
              curLink.gps.push({ ...data.info });
              break;
            case "QBLELinkRSSI":
              curLink.rssi.push({ ...data.info });
              break;
            case "QTrackerReferenceInfo":
              curLink.references.push({ ...data.info });
              break;
          }
        }
      }
      if (curLink) {
        this.onDataReceived(curLink);
        curLink = null;
      } else {
        break;
      }
    }
  }
  onDataReceived(data: any) {}
}
export { LogLinksReceiver };
