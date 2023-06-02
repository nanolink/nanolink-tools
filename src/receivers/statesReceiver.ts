import { Connection } from "../index";
import { StateSubscriptions } from "../definitions/stateSubscriptions";
import { SrvRecord } from "dns";

/**
 * Double state fields
 * @date 6/1/2023 - 1:17:43 PM
 *
 * @type {*}
 */
const DoubleFields: any = {
  /** EXTERNAL_VOLTAGE */
  EXTERNAL_VOLTAGE: "EXTERNAL_VOLTAGE",
  /** TOTAL_ODOMETER */
  TOTAL_ODOMETER: "TOTAL_ODOMETER",
  /** UPTIME */
  UPTIME: "UPTIME",
  /** INTERNAL_VOLTAGE */
  INTERNAL_VOLTAGE: "INTERNAL_VOLTAGE",
  /** INITIAL_ODOMETER */
  INITIAL_ODOMETER: "INITIAL_ODOMETER",
  /** CALCULATED_ODOMETER */
  CALCULATED_ODOMETER: "CALCULATED_ODOMETER",
  /** BATTERY_PERCENT */
  BATTERY_PERCENT: "BATTERY_PERCENT",
};
/**
 * Receiver for double states
 * @date 6/1/2023 - 1:17:12 PM
 *
 * @class StatesReceiverDouble
 * @param {Connection} connection - The connection handler
 * @param {string} field - double field @see {@link DoubleFields}
 * @param {?string[]} [trackers] - tracker vid's
 */
class StatesReceiverDouble {
  /**
   * Conntection handler
   * @date 6/1/2023 - 1:17:12 PM
   *
   * @type {Connection}
   */
  connection: Connection;
  /**
   * Field this receiver handles
   * @date 6/1/2023 - 1:17:12 PM
   *
   * @type {string}
   */
  field: string;
  /**
   * Tracker filter. If null then all trackers
   * @date 6/1/2023 - 1:17:12 PM
   *
   * @type {?string[]}
   */
  trackers?: string[];
  /**
   * Creates an instance of StatesReceiverDouble.
   * @date 6/1/2023 - 1:19:26 PM
   *
   * @constructor
   * @param {Connection} connection - The connection handler
   * @param {string} field - double field @see {@link DoubleFields}
   * @param {?string[]} [trackers] - tracker vid's
   */
  constructor(connection: Connection, field: string, trackers?: string[]) {
    if (DoubleFields[field] == undefined) {
      throw `field: ${field} is not a double field`;
    }
    this.connection = connection;
    this.field = field;
    this.trackers = trackers;
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
    let iter = await this.connection.subscribe(
      StateSubscriptions.statesDouble,
      { field: this.field, trackerVIDs: this.trackers },
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
   * Called when initial data is received
   * @date 6/1/2023 - 1:17:12 PM
   */
  onInitialReceived() {}
  /**
   * Call back receiving data
   * @date 6/1/2023 - 1:23:18 PM
   *
   * @param {(any | any[])} data
   */
  onDataReceived(data: any | any[]) {}
}
/**
 * Int states
 */
const IntFields: any = {
  /** TEMPERATURE */
  TEMPERATURE: "TEMPERATURE",
  /** BATTERY_LEVEL */
  BATTERY_LEVEL: "BATTERY_LEVEL",
  /** NANO_LINKS_FOUND */
  NANO_LINKS_FOUND: "NANO_LINKS_FOUND",
  /** ALL_TAGS_FOUND */
  ALL_TAGS_FOUND: "ALL_TAGS_FOUND",
};
/**
 * Integer state fields
 * @date 6/1/2023 - 1:17:12 PM
 *
 * @class StatesReceiverInt
 * @param {Connection} connection - The connection handler
 * @param {string} field - Integer field @see {@link IntFields}
 * @param {?string[]} [trackers] - tracker vid's
 */
class StatesReceiverInt {
  /**
   * Connection handler
   * @date 6/1/2023 - 1:17:12 PM
   *
   * @type {Connection}
   */
  connection: Connection;
  /**
   * Field this receiver handles
   * @date 6/1/2023 - 1:17:12 PM
   *
   * @type {string}
   */
  field: string;
  /**
   * Tracker filter. If null then all trackers
   * @date 6/1/2023 - 1:17:12 PM
   *
   * @type {?string[]}
   */
  trackers?: string[];
  /**
   * Creates an instance of StatesReceiverInt.
   * @date 6/1/2023 - 1:22:02 PM
   *
   * @constructor
   * @param {Connection} connection - The connection handler
   * @param {string} field - Integer field @see {@link IntFields}
   * @param {?string[]} [trackers] - tracker vid's
   */
  constructor(connection: Connection, field: string, trackers?: string[]) {
    if (IntFields[field] == undefined) {
      throw `field: ${field} is not a int field`;
    }
    this.connection = connection;
    this.field = field;
    this.trackers = trackers;
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
    let iter = await this.connection.subscribe(
      StateSubscriptions.statesInt,
      {
        field: this.field,
        trackerVIDs: this.trackers,
      },
      unwind
    );
    for await (let r of iter) {
      if (r.data) {
        this.onDataReceived(r.data);
      }
    }
  }
  /**
   * Call back receiving data
   * @param {any | [any]} data - Set this callback to receive data.
   */
  onDataReceived(data: any | any[]) {}
}
/**
 * Bool states
 */
const BoolFields: any = {
  /** MOVEMENT */
  MOVEMENT: "MOVEMENT",
  /** IGNITION */
  IGNITION: "IGNITION",
  /** GPS_ENABLED */
  GPS_ENABLED: "GPS_ENABLED",
  /** BLUETOOTH_ENABLED */
  BLUETOOTH_ENABLED: "BLUETOOTH_ENABLED",
  /** BLUETOOTH_FAILURE */
  BLUETOOTH_FAILURE: "BLUETOOTH_FAILURE",
};
/**
 * Bool states
 * @date 6/1/2023 - 1:17:12 PM
 *
 * @class StatesReceiverBool
 * @param {Connection} connection - The connection handler
 * @param {string} field - Boolean field @see {@link BoolFields}
 * @param {?string[]} [trackers] - tracker vid's
 */
class StatesReceiverBool {
  /**
   * Connection handler
   * @date 6/1/2023 - 1:17:12 PM
   *
   * @type {Connection}
   */
  connection: Connection;
  /**
   * Field this receiver handles
   * @date 6/1/2023 - 1:17:12 PM
   *
   * @type {string}
   */
  field: string;
  /**
   * Tracker filter. If null then all trackers
   * @date 6/1/2023 - 1:17:12 PM
   *
   * @type {?string[]}
   */
  trackers?: string[];
  /**
   * Creates an instance of StatesReceiverBool.
   * @date 6/1/2023 - 1:27:06 PM
   *
   * @constructor
   * @param {Connection} connection - The connection handler
   * @param {string} field - Boolean field @see {@link BoolFields}
   * @param {?string[]} [trackers] - tracker vid's
   */
  constructor(connection: Connection, field: string, trackers?: string[]) {
    if (BoolFields[field] == undefined) {
      throw `field: ${field} is not a bool field`;
    }
    this.connection = connection;
    this.field = field;
    this.trackers = trackers;
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
    let iter = await this.connection.subscribe(
      StateSubscriptions.statesBool,
      {
        field: this.field,
        trackerVIDs: this.trackers,
      },
      unwind
    );
    for await (let r of iter) {
      if (r.data) {
        this.onDataReceived(r.data);
      }
    }
  }
  /**
   * Call back receiving data
   * @param {any | [any]} data - Set this callback to receive data.
   */
  onDataReceived(data: any | any[]) {}
}
/**
 * Long states
 */
const LongFields: any = {
  /** ACTIVE_COUNTER */
  ACTIVE_COUNTER: "ACTIVE_COUNTER",
};
/**
 * Long states
 * @date 6/1/2023 - 1:17:12 PM
 *
 * @class StatesReceiverLong
 * @param {Connection} connection - The connection handler
 * @param {string} field - long field @see {@link LongFields}
 * @param {?string[]} [trackers] - tracker vid's
 */
class StatesReceiverLong {
  /**
   * Connection handler
   * @date 6/1/2023 - 1:17:12 PM
   *
   * @type {Connection}
   */
  connection: Connection;
  /**
   * Field this receiver handles
   * @date 6/1/2023 - 1:17:12 PM
   *
   * @type {string}
   */
  field: string;
  /**
   * Tracker filter. If null then all trackers
   * @date 6/1/2023 - 1:17:12 PM
   *
   * @type {?string[]}
   */
  trackers?: string[];
  /**
   * Creates an instance of StatesReceiverLong.
   * @date 6/1/2023 - 1:27:25 PM
   *
   * @constructor
   * @param {Connection} connection - The connection handler
   * @param {string} field - Long field @see {@link LongFields}
   * @param {?string[]} [trackers] - tracker vid's
 */
  constructor(connection: Connection, field: string, trackers?: string[]) {
    if (LongFields[field] == undefined) {
      throw `field: ${field} is not a long field`;
    }
    this.connection = connection;
    this.field = field;
    this.trackers = trackers;
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
    let iter = await this.connection.subscribe(
      StateSubscriptions.statesLong,
      {
        field: this.field,
        trackerVIDs: this.trackers,
      },
      unwind
    );
    for await (let r of iter) {
      if (r.data) {
        this.onDataReceived(r.data);
      }
    }
  }
  /**
   * Call back receiving data
   * @param {any | [any]} data - Set this callback to receive data.
   */
  onDataReceived(data: any | any[]) {}
}
/**
 * Any states
 */
const AnyFields: any = {
  ...DoubleFields,
  ...IntFields,
  ...BoolFields,
  ...LongFields,
};
/**
 * Subscribe to any field. Note that the value returned is always a string
 * @date 6/1/2023 - 1:17:12 PM
 *
 * @class StatesReceiverAny
 * @param {Connection} connection - The connection handler
 * @param {string} field - Any field @see {@link AnyFields}
 * @param {?string[]} [trackers] - tracker vid's
 */
class StatesReceiverAny {
  /**
   * Connection handler
   * @date 6/1/2023 - 1:17:12 PM
   *
   * @type {Connection}
   */
  connection: Connection;
  /**
   * Field this receiver handles
   * @date 6/1/2023 - 1:17:12 PM
   *
   * @type {string}
   */
  field: string;
  /**
   * Tracker filter. If null then all trackers
   * @date 6/1/2023 - 1:17:12 PM
   *
   * @type {?string[]}
   */
  trackers?: string[];
  /**
   * Creates an instance of StatesReceiverAny.
   * @date 6/1/2023 - 1:30:32 PM
   *
   * @constructor
   * @param {Connection} connection - The connection handler
   * @param {string} field - Any field @see {@link AnyFields}
   * @param {?string[]} [trackers] - tracker vid's
   */
  constructor(connection: Connection, field: string, trackers?: string[]) {
    if (AnyFields[field] == undefined) {
      throw `field: ${field} is not a field`;
    }
    this.connection = connection;
    this.field = field;
    this.connection = connection;
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
    let iter = await this.connection.subscribe(
      StateSubscriptions.statesAny,
      {
        field: this.field,
        trackerVIDs: this.trackers,
      },
      unwind
    );
    for await (let r of iter) {
      if (r.data) {
        this.onDataReceived(r.data);
      }
    }
  }
  /**
   * Call back receiving data
   * @param {object | [object]} data - Set this callback to receive data.
   */
  onDataReceived(data: any | any[]) {}
}
export {
  DoubleFields,
  StatesReceiverDouble,
  IntFields,
  StatesReceiverInt,
  BoolFields,
  StatesReceiverBool,
  LongFields,
  StatesReceiverLong,
  AnyFields,
  StatesReceiverAny,
};
