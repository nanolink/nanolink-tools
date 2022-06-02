import { Connection } from "../index";
import { LogSubscriptions } from "../definitions/logsubscriptions";

const DoubleFieldsLog: any = {
  EXTERNAL_VOLTAGE: "EXTERNAL_VOLTAGE",
  TOTAL_ODOMETER: "TOTAL_ODOMETER",
  UPTIME: "UPTIME",
  INTERNAL_VOLTAGE: "INTERNAL_VOLTAGE",
  INITIAL_ODOMETER: "INITIAL_ODOMETER",
  CALCULATED_ODOMETER: "CALCULATED_ODOMETER",
};

const IntFieldsLog: any = {
  TEMPERATURE: "TEMPERATURE",
  BATTERY_LEVEL: "BATTERY_LEVEL",
  NANO_LINKS_FOUND: "NANO_LINKS_FOUND",
  ALL_TAGS_FOUND: "ALL_TAGS_FOUND",
};

const BoolFieldsLog: any = {
  MOVEMENT: "MOVEMENT",
  IGNITION: "IGNITION",
  GPS_ENABLED: "GPS_ENABLED",
  BLUETOOTH_ENABLED: "BLUETOOTH_ENABLED",
  BLUETOOTH_FAILURE: "BLUETOOTH_FAILURE",
};

const LongFieldsLog: any = {
  ACTIVE_COUNTER: "ACTIVE_COUNTER",
};
const AnyFieldsLog: any = {
  ...DoubleFieldsLog,
  ...IntFieldsLog,
  ...BoolFieldsLog,
  ...LongFieldsLog,
};

class LogStateReceiverBase {
  connection: Connection;
  variables: any = {
    subscribe: false,
    includeInitial: false,
    filter: {
      trackerVIDs: [] as string[],
      field: "",
      start: "",
      end: "",
      cursor: {
        from: "",
        count: 0,
      },
    },
  };
  query: string = "";

  /**
   *
   * @param {Connection} connection - THe connection handler
   * @param {boolean} subscribe - Send updates if changes occur
   * @param {boolean} includeInitial - Include initial data
   * @param {string[]} trackerVIDs - array of tracker VIDs
   * @param {string} field - State field
   * @param {date} startTime - Start time
   * @param {date} endTime - End time
   * @param {string} fromId - Start id
   * @param {number} limit - Limit no. of docs (if not set then all)
   */
  constructor(
    connection: Connection,
    subscribe: boolean,
    includeInitial: boolean,
    trackerVIDs: string[],
    field: string,
    startTime?: string,
    endTime?: string,
    fromId?: string,
    limit?: number
  ) {
    this.validateField(field);
    this.connection = connection;
    this.variables.subscribe = subscribe;
    this.variables.includeInitial = includeInitial;
    this.variables.filter.trackerVIDs = trackerVIDs;
    this.variables.filter.field = field;
    this.variables.filter.start = startTime;
    this.variables.filter.end = endTime;
    this.variables.filter.cursor.from = fromId;
    this.variables.filter.cursor.count = limit;
  }
  validateField(field: string) {
    throw "Not implemented";
  }

  /**
   * Start the subscription
   * @param {*} unwind - Give single updates otherwise an array
   */
  async run(unwind?: boolean) {
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
      let sub = await this.connection.subscribelog(this.query, vars, unwind);
      let gotData = false;
      for await (let doc of sub) {
        let data = doc.data;
        if (data) {
          gotData = false;
          this.onDataReceived(data);
          cursor.from = data.id;
        }
      }
      if (!gotData) {
        break;
      }
    }
  }
  onDataReceived(data: any) {}
}

/**
 * Bool fields
 */
class LogStateReceiverBool extends LogStateReceiverBase {
  constructor(
    connection: Connection,
    subscribe: boolean,
    includeInitial: boolean,
    trackerVIDs: string[],
    field: string,
    startTime?: string,
    endTime?: string,
    fromId?: string,
    limit?: number
  ) {
    super(
      connection,
      subscribe,
      includeInitial,
      trackerVIDs,
      field,
      startTime,
      endTime,
      fromId,
      limit
    );
    this.query = LogSubscriptions.statesBool;
  }
  validateField(field: string) {
    if (BoolFieldsLog[field] == undefined) {
      throw `field: ${field} is not a bool field`;
    }
  }
}
/**
 * Double fields
 */
class LogStateReceiverInt extends LogStateReceiverBase {
  constructor(
    connection: Connection,
    subscribe: boolean,
    includeInitial: boolean,
    trackerVIDs: string[],
    field: string,
    startTime?: string,
    endTime?: string,
    fromId?: string,
    limit?: number
  ) {
    super(
      connection,
      subscribe,
      includeInitial,
      trackerVIDs,
      field,
      startTime,
      endTime,
      fromId,
      limit
    );
    this.query = LogSubscriptions.statesInt;
  }
  validateField(field: string) {
    if (IntFieldsLog[field] == undefined) {
      throw `field: ${field} is not a int field`;
    }
  }
}
class LogStateReceiverDouble extends LogStateReceiverBase {
  constructor(
    connection: Connection,
    subscribe: boolean,
    includeInitial: boolean,
    trackerVIDs: string[],
    field: string,
    startTime?: string,
    endTime?: string,
    fromId?: string,
    limit?: number
  ) {
    super(
      connection,
      subscribe,
      includeInitial,
      trackerVIDs,
      field,
      startTime,
      endTime,
      fromId,
      limit
    );
    this.query = LogSubscriptions.statesDouble;
  }
  validateField(field: string) {
    if (DoubleFieldsLog[field] == undefined) {
      throw `field: ${field} is not a double field`;
    }
  }
}
/**
 * Long fields
 */
class LogStateReceiverLong extends LogStateReceiverBase {
  constructor(
    connection: Connection,
    subscribe: boolean,
    includeInitial: boolean,
    trackerVIDs: string[],
    field: string,
    startTime?: string,
    endTime?: string,
    fromId?: string,
    limit?: number
  ) {
    super(
      connection,
      subscribe,
      includeInitial,
      trackerVIDs,
      field,
      startTime,
      endTime,
      fromId,
      limit
    );
    this.query = LogSubscriptions.statesLong;
  }
  validateField(field: string) {
    if (LongFieldsLog[field] == undefined) {
      throw `field: ${field} is not a long field`;
    }
  }
}
/**
 * Field of any type (value as a string)
 */
class LogStateReceiverAny extends LogStateReceiverBase {
  constructor(
    connection: Connection,
    subscribe: true,
    includeInitial: true,
    trackerVIDs: string[],
    field: string,
    startTime?: string,
    endTime?: string,
    fromId?: string,
    limit?: number
  ) {
    super(
      connection,
      subscribe,
      includeInitial,
      trackerVIDs,
      field,
      startTime,
      endTime,
      fromId,
      limit
    );
    this.query = LogSubscriptions.statesAll;
  }
  validateField(field: string) {
    if (AnyFieldsLog[field] == undefined) {
      throw `field: ${field} is not a field`;
    }
  }
}

export {
  LogStateReceiverBool,
  BoolFieldsLog,
  LogStateReceiverInt,
  IntFieldsLog,
  LogStateReceiverDouble,
  DoubleFieldsLog,
  LogStateReceiverLong,
  LongFieldsLog,
  LogStateReceiverAny,
  AnyFieldsLog,
};
