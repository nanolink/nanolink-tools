import { Connection } from "../index";
import { LogSubscriptions } from "../definitions/logsubscriptions";

/**
 * Valid double type tracker states 
 * @date 6/5/2023 - 9:24:48 AM
 *
 * @enum {string}
 */
enum DoubleFieldsLog {  
  /** EXTERNAL_VOLTAGE */
  EXTERNAL_VOLTAGE = "EXTERNAL_VOLTAGE",
  /** TOTAL_ODOMETER */
  TOTAL_ODOMETER =  "TOTAL_ODOMETER",
  /** UPTIME */
  UPTIME = "UPTIME",
  /** INTERNAL_VOLTAGE */
  INTERNAL_VOLTAGE =  "INTERNAL_VOLTAGE",
  /** INITIAL_ODOMETER */
  INITIAL_ODOMETER = "INITIAL_ODOMETER",
  /** CALCULATED_ODOMETER */
  CALCULATED_ODOMETER = "CALCULATED_ODOMETER",
};

/**
 * Valid integer type tracker states
 * @date 6/1/2023 - 8:10:51 AM
 *
 * @enum {string}
 */
enum IntFieldsLog {
  /** TEMPERATURE */
  TEMPERATURE = "TEMPERATURE",
  /** BATTERY_LEVEL */
  BATTERY_LEVEL = "BATTERY_LEVEL",
  /** NANO_LINKS_FOUND */
  NANO_LINKS_FOUND = "NANO_LINKS_FOUND",
  /** ALL_TAGS_FOUND */
  ALL_TAGS_FOUND = "ALL_TAGS_FOUND",
};
/**
 * Valid boolean type tracker states
 * @date 6/1/2023 - 8:10:51 AM
 *
 * @enum {string}
 */
enum BoolFieldsLog {
  /** MOVEMENT */
  MOVEMENT = "MOVEMENT",
  /** IGNITION */
  IGNITION = "IGNITION",
  /** GPS_ENABLED */
  GPS_ENABLED = "GPS_ENABLED",
  /** BLUETOOTH_ENABLED */
  BLUETOOTH_ENABLED = "BLUETOOTH_ENABLED",
  /** BLUETOOTH_FAILURE */
  BLUETOOTH_FAILURE = "BLUETOOTH_FAILURE",
};
/**
 * Valid long integer (64 bit) tracker states
 * @date 6/1/2023 - 8:10:51 AM
 *
 * @enum {string}
 */
enum LongFieldsLog {
  /** ACTIVE_COUNTER */
  ACTIVE_COUNTER = "ACTIVE_COUNTER",
};
/**
 * Any fields
 * @date 6/5/2023 - 9:26:04 AM
 *
 * @typedef {AnyFieldsLog}
 */
type AnyFieldsLog = DoubleFieldsLog | IntFieldsLog | BoolFieldsLog | LongFieldsLog;

/**
 * Subscription to retrieve tracker states (Base class)
 * @date 6/1/2023 - 8:10:51 AM
 *
 * @class LogStateReceiverBase
 * @param {Connection} connection - The connection handler
 * @param {boolean} subscribe- Send updates if changes occur
 * @param {boolean} includeInitial - Include initial data
 * @param {string[]} trackerVIDs - array of tracker VIDs
 * @param {AnyFieldsLog} field - State field
 * @param {?string} [startTime] - Start time
 * @param {?string} [endTime] - End time
 * @param {?string} [fromId] - Start id
 * @param {?number} [limit] - Limit no. of docs (if not set then all)
 */
class LogStateReceiverBase {
  /**
   * Core and log connection object
   * @date 6/1/2023 - 8:10:51 AM
   *
   * @type {Connection}
   */
  connection: Connection;
  /**
   * Subscription variables
   * @date 6/1/2023 - 8:10:51 AM
   *
   * @type {*}
   */
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
  /**
   * Query to run retrieving tracker states
   * @date 6/1/2023 - 8:10:51 AM
   *
   * @type {string}
   */
  query: string = "";

  /**
   * Creates an instance of LogStateReceiverBase.
   * @date 6/1/2023 - 12:50:05 PM
   *
   * @constructor
   * @param {Connection} connection - The connection handler
   * @param {boolean} subscribe- Send updates if changes occur
   * @param {boolean} includeInitial - Include initial data
   * @param {string[]} trackerVIDs - array of tracker VIDs
   * @param {AnyFieldsLog} field - State field
   * @param {?string} [startTime] - Start time
   * @param {?string} [endTime] - End time
   * @param {?string} [fromId] - Start id
   * @param {?number} [limit] - Limit no. of docs (if not set then all)
   */
  constructor(
    connection: Connection,
    subscribe: boolean,
    includeInitial: boolean,
    trackerVIDs: string[],
    field: AnyFieldsLog,
    startTime?: string,
    endTime?: string,
    fromId?: string,
    limit?: number
  ) {
    this.connection = connection;
    this.variables.subscribe = subscribe;
    this.variables.includeInitial = includeInitial;
    this.variables.filter.trackerVIDs = trackerVIDs;
    this.variables.filter.field = field.toString();
    this.variables.filter.start = startTime;
    this.variables.filter.end = endTime;
    this.variables.filter.cursor.from = fromId;
    this.variables.filter.cursor.count = limit;
  }
  /**
   * Start the subscription
   * @date 6/1/2023 - 8:17:36 AM
   *
   * @async
   * @param {?boolean} [unwind]
   * @returns {*}
   */
  async run(unwind?: boolean) {
    if (!this.connection.logSubscriptionHandler) {
      this.connection.connectLog(false);
    }
    // Setup for paging to not flood the client with data
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
  /**
   * Call back receiving data
   * @date 6/1/2023 - 8:10:51 AM
   *
   * @param {*} data
   */
  onDataReceived(data: any) {}
}

/**
 * Bool fields
 * @date 6/1/2023 - 12:47:26 PM
 *
 * @class LogStateReceiverBool
 * @param {Connection} connection - The connection handler
 * @param {boolean} subscribe- Send updates if changes occur
 * @param {boolean} includeInitial - Include initial data
 * @param {string[]} trackerVIDs - array of tracker VIDs
 * @param {BoolFieldsLog} field - State field
 * @param {?string} [startTime] - Start time
 * @param {?string} [endTime] - End time
 * @param {?string} [fromId] - Start id
 * @param {?number} [limit] - Limit no. of docs (if not set then all)
 * @extends {LogStateReceiverBase}
 */
class LogStateReceiverBool extends LogStateReceiverBase {
  /**
   * Creates an instance of LogStateReceiverBool.
   * @date 6/1/2023 - 8:10:51 AM
   *
   * @constructor
   * @param {Connection} connection - The connection handler
   * @param {boolean} subscribe- Send updates if changes occur
   * @param {boolean} includeInitial - Include initial data
   * @param {string[]} trackerVIDs - array of tracker VIDs
   * @param {BoolFieldsLog} field - State field
   * @param {?string} [startTime] - Start time
   * @param {?string} [endTime] - End time
   * @param {?string} [fromId] - Start id
   * @param {?number} [limit] - Limit no. of docs (if not set then all)
   */
  constructor(
    connection: Connection,
    subscribe: boolean,
    includeInitial: boolean,
    trackerVIDs: string[],
    field: BoolFieldsLog,
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
}
/**
 * Integer fields
 * @date 6/1/2023 - 12:47:51 PM
 *
 * @class LogStateReceiverInt
 * @param {Connection} connection - The connection handler
 * @param {boolean} subscribe- Send updates if changes occur
 * @param {boolean} includeInitial - Include initial data
 * @param {string[]} trackerVIDs - array of tracker VIDs
 * @param {IntFieldsLog} field - State field
 * @param {?string} [startTime] - Start time
 * @param {?string} [endTime] - End time
 * @param {?string} [fromId] - Start id
 * @param {?number} [limit] - Limit no. of docs (if not set then all)
 * @extends {LogStateReceiverBase}
 */
class LogStateReceiverInt extends LogStateReceiverBase {
  /**
   * Creates an instance of LogStateReceiverInt.
   * @date 6/1/2023 - 8:10:51 AM
   *
   * @constructor
   * @param {Connection} connection - The connection handler
   * @param {boolean} subscribe- Send updates if changes occur
   * @param {boolean} includeInitial - Include initial data
   * @param {string[]} trackerVIDs - array of tracker VIDs
   * @param {IntFieldsLog} field - State field
   * @param {?string} [startTime] - Start time
   * @param {?string} [endTime] - End time
   * @param {?string} [fromId] - Start id
   * @param {?number} [limit] - Limit no. of docs (if not set then all)
   */
  constructor(
    connection: Connection,
    subscribe: boolean,
    includeInitial: boolean,
    trackerVIDs: string[],
    field: IntFieldsLog,
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
}
/**
 * Double fields
 * @date 6/1/2023 - 8:10:51 AM
 *
 * @class LogStateReceiverDouble
 * @param {Connection} connection - The connection handler
 * @param {boolean} subscribe- Send updates if changes occur
 * @param {boolean} includeInitial - Include initial data
 * @param {string[]} trackerVIDs - array of tracker VIDs
 * @param {DoubleFieldsLog} field - State field
 * @param {?string} [startTime] - Start time
 * @param {?string} [endTime] - End time
 * @param {?string} [fromId] - Start id
 * @param {?number} [limit] - Limit no. of docs (if not set then all)
 * @extends {LogStateReceiverBase}
 */
class LogStateReceiverDouble extends LogStateReceiverBase {
  /**
   * Creates an instance of LogStateReceiverDouble.
   * @date 6/1/2023 - 8:10:51 AM
   *
   * @constructor
   * @param {Connection} connection - The connection handler
   * @param {boolean} subscribe- Send updates if changes occur
   * @param {boolean} includeInitial - Include initial data
   * @param {string[]} trackerVIDs - array of tracker VIDs
   * @param {DoubleFieldsLog} field - State field
   * @param {?string} [startTime] - Start time
   * @param {?string} [endTime] - End time
   * @param {?string} [fromId] - Start id
   * @param {?number} [limit] - Limit no. of docs (if not set then all)
   */
  constructor(
    connection: Connection,
    subscribe: boolean,
    includeInitial: boolean,
    trackerVIDs: string[],
    field: DoubleFieldsLog,
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
}
/**
 * Long fields
 * @date 6/1/2023 - 12:49:29 PM
 *
 * @class LogStateReceiverLong
 * @param {Connection} connection - The connection handler
 * @param {boolean} subscribe- Send updates if changes occur
 * @param {boolean} includeInitial - Include initial data
 * @param {string[]} trackerVIDs - array of tracker VIDs
 * @param {LongFieldsLog} field - State field
 * @param {?string} [startTime] - Start time
 * @param {?string} [endTime] - End time
 * @param {?string} [fromId] - Start id
 * @param {?number} [limit] - Limit no. of docs (if not set then all)
 * @extends {LogStateReceiverBase}
 */
class LogStateReceiverLong extends LogStateReceiverBase {
  /**
   * Creates an instance of LogStateReceiverLong.
   * @date 6/1/2023 - 8:10:51 AM
   *
   * @constructor
   * @param {Connection} connection - The connection handler
   * @param {boolean} subscribe- Send updates if changes occur
   * @param {boolean} includeInitial - Include initial data
   * @param {string[]} trackerVIDs - array of tracker VIDs
   * @param {LongFieldsLog} field - State field
   * @param {?string} [startTime] - Start time
   * @param {?string} [endTime] - End time
   * @param {?string} [fromId] - Start id
   * @param {?number} [limit] - Limit no. of docs (if not set then all)
   */
  constructor(
    connection: Connection,
    subscribe: boolean,
    includeInitial: boolean,
    trackerVIDs: string[],
    field: LongFieldsLog,
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
}
/**
 * Field of any type (value as a string)
 * @date 6/1/2023 - 12:53:38 PM
 *
 * @class LogStateReceiverAny
 * @param {Connection} connection - The connection handler
 * @param {boolean} subscribe- Send updates if changes occur
 * @param {boolean} includeInitial - Include initial data
 * @param {string[]} trackerVIDs - array of tracker VIDs
 * @param {string} field - State field
 * @param {?string} [startTime] - Start time
 * @param {?string} [endTime] - End time
 * @param {?string} [fromId] - Start id
 * @param {?number} [limit] - Limit no. of docs (if not set then all)
 * @extends {LogStateReceiverBase}
 */
class LogStateReceiverAny extends LogStateReceiverBase {
  /**
   * Creates an instance of LogStateReceiverAny.
   * @date 6/1/2023 - 8:10:51 AM
   *
   * @constructor
   * @param {Connection} connection - The connection handler
   * @param {boolean} subscribe- Send updates if changes occur
   * @param {boolean} includeInitial - Include initial data
   * @param {string[]} trackerVIDs - array of tracker VIDs
   * @param {AnyFieldsLog} field - State field
   * @param {?string} [startTime] - Start time
   * @param {?string} [endTime] - End time
   * @param {?string} [fromId] - Start id
   * @param {?number} [limit] - Limit no. of docs (if not set then all)
   */
  constructor(
    connection: Connection,
    subscribe: true,
    includeInitial: true,
    trackerVIDs: string[],
    field: AnyFieldsLog,
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
