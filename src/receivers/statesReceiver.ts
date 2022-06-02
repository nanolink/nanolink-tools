import { Connection } from "../index";
import { StateSubscriptions } from "../definitions/stateSubscriptions";
import { SrvRecord } from "dns";

/**
 * Classes to handle states update
 */

/**
 * Double states
 */
const DoubleFields: any = {
  EXTERNAL_VOLTAGE: "EXTERNAL_VOLTAGE",
  TOTAL_ODOMETER: "TOTAL_ODOMETER",
  UPTIME: "UPTIME",
  INTERNAL_VOLTAGE: "INTERNAL_VOLTAGE",
  INITIAL_ODOMETER: "INITIAL_ODOMETER",
  CALCULATED_ODOMETER: "CALCULATED_ODOMETER",
};
class StatesReceiverDouble {
  connection: Connection;
  field: string;
  trackers?: string[];
  /**
   * Constructor
   * @param {Connection} connection - The connection handler
   * @param {string} field - double field (DoubleFields)
   * @param {[string]} trackers tracker vid's
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
   * Run the subscription. Data will be delivered to onDataReceived
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
      }
    }
  }
  /**
   *
   * @param {any | [any]} data - Set this callback to receive data.
   */
  onDataReceived(data: any | any[]) {}
}
/**
 * Int states
 */
const IntFields: any = {
  TEMPERATURE: "TEMPERATURE",
  BATTERY_LEVEL: "BATTERY_LEVEL",
  NANO_LINKS_FOUND: "NANO_LINKS_FOUND",
  ALL_TAGS_FOUND: "ALL_TAGS_FOUND",
};
class StatesReceiverInt {
  connection: Connection;
  field: string;
  trackers?: string[];
  /**
   * Constructor
   * @param {string} field - int field (IntFields)
   * @param {[string]} trackers tracker vid's
   * @param {Connection} connection - The connection handler
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
   * Run the subscription. Data will be delivered to onDataReceived
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
   *
   * @param {any | [any]} data - Set this callback to receive data.
   */
  onDataReceived(data: any | any[]) {}
}
/**
 * Bool states
 */
const BoolFields: any = {
  MOVEMENT: "MOVEMENT",
  IGNITION: "IGNITION",
  GPS_ENABLED: "GPS_ENABLED",
  BLUETOOTH_ENABLED: "BLUETOOTH_ENABLED",
  BLUETOOTH_FAILURE: "BLUETOOTH_FAILURE",
};
class StatesReceiverBool {
  connection: Connection;
  field: string;
  trackers?: string[];
  /**
   * Constructor
   * @param {Connection} connection - The connection handler
   * @param {string} field - bool field (BoolFields)
   * @param {[string]} trackers tracker vid's
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
   * Run the subscription. Data will be delivered to onDataReceived
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
   *
   * @param {any | [any]} data - Set this callback to receive data.
   */
  onDataReceived(data: any | any[]) {}
}
/**
 * Long states
 */
const LongFields: any = {
  ACTIVE_COUNTER: "ACTIVE_COUNTER",
};
class StatesReceiverLong {
  connection: Connection;
  field: string;
  trackers?: string[];
  /**
   * Constructor
   * @param {Connection} connection - The connection handler
   * @param {string} field - bool field (LongFields)
   * @param {[string]} trackers tracker vid's
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
   * Run the subscription. Data will be delivered to onDataReceived
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
   *
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
class StatesReceiverAny {
  connection: Connection;
  field: string;
  trackers?: string[];
  /**
   * Constructor
   * @param {Connection} connection - The connection handler
   * @param {string} field - any field regardless of type (AnyFields)
   * @param {[string]} trackers tracker vid's
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
   * Run the subscription. Data will be delivered to onDataReceived
   * @param {boolean} unwind - If true only single updates are sent to onDateReceived, otherwise it's an array
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
   *
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
