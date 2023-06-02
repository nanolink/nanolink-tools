import { SubscriptionHandler } from "./subcriptionHandler";
import { deferredPromise } from "./deferredPromise";
import EventEmitter from "events";

/**
 * Enumeration returned from graphql subscriptions
 * @date 6/1/2023 - 9:35:43 AM
 *
 * @type {{ DELETED: string; UPDATED: string; START: string; DONE: string; VERSION_ERROR: string; }}
 */
const SyncType = {
  DELETED: "DELETED",
  UPDATED: "UPDATED",
  START: "START",
  DONE: "DONE",
  VERSION_ERROR: "VERSION_ERROR",
};

/**
 * This class is used to mirror data from the nanolink system and monitor changes.
 * @date 6/1/2023 - 9:04:21 AM
 *
 * @export
 * @class Mirror
 * @param {string} name - Name of the mirror
 * @param {string} query - The graphQL query to fetch the mirror (Please use the subscriptions defined in definitions )
 * @param {SubscriptionHandler} handler - The subscription handler to use
 */
export class Mirror {
  /**
   * Contains the map of the data returned from graphql subscription, where the key is 'id' on returned data.
   * @date 6/1/2023 - 9:35:43 AM
   *
   * @type {Map<string, any>}
   */
  storage: Map<string, any> = new Map<string, any>();
  /**
   * Reference to subscription handler
   * @date 6/1/2023 - 9:35:43 AM
   *
   * @type {SubscriptionHandler}
   */
  handler: SubscriptionHandler;
  /**
   * Name of the mirror
   * @date 6/1/2023 - 9:35:43 AM
   *
   * @type {string}
   */
  name: string;
  /**
   * The query used to retrieved the mirror
   * @date 6/1/2023 - 9:35:43 AM
   *
   * @type {string}
   */
  query: string;
  /**
   * Max. version of the data returned from the server
   * @date 6/1/2023 - 9:35:43 AM
   *
   * @type {number}
   */
  version: number = -1;
  /**
   * Max. version of the operational data returned from the server. 
   * @date 6/1/2023 - 9:35:43 AM
   *
   * @type {?string}
   */
  opVersion?: string;
  /**
   * Event emitter
   * @date 6/1/2023 - 9:35:43 AM
   *
   * @type {EventEmitter}
   */
  emitter: EventEmitter;
  /**
   * Current subscription async iterator
   * @date 6/1/2023 - 9:35:43 AM
   *
   * @protected
   * @type {*}
   */
  protected currentIterator: any;
  /**
   * Creates an instance of Mirror.
   * @date 6/1/2023 - 9:35:18 AM
   *
   * @constructor
   * @param {string} name - Name of the mirror
   * @param {string} query - The graphQL query to fetch the mirror (Please use the subscriptions defined in definitions )
   * @param {SubscriptionHandler} handler - The subscription handler to use
   */
  constructor(name: string, query: string, handler: SubscriptionHandler) {
    this.name = name;
    this.query = query;
    this.handler = handler;
    this.emitter = new EventEmitter();
    this.opVersion = undefined;
  }

  /**
   * Process a document return from the server
   * @date 6/1/2023 - 9:35:43 AM
   *
   * @private
   * @param {*} record
   */
  private processRecord(record: any) {
    if (record.opVersion && (!this.opVersion || record.opVersion > this.opVersion))
    {
      this.opVersion = record.opVersion;
    }
    if (record.version > this.version) {
      this.version = record.version;
    }
    let orgdoc = this.storage.get(record.id);
    if (record.deleted != undefined && record.deleted) {
      if (orgdoc) {
        this.storage.delete(orgdoc.id);
        this.onDeleted(this, orgdoc);
        this.emitter.emit("deleted", this, orgdoc);
      }
    } else {
      this.storage.set(record.id, record);
      if (orgdoc) {
        this.onUpdated(this, record, orgdoc);
        this.emitter.emit("updated", this, record, orgdoc);
      } else {
        this.onInserted(this, record);
        this.emitter.emit("inserted", this, record);
      }
    }
  }

  /**
   * Starts the subscription to server getting the mirror data
   * @date 6/1/2023 - 9:35:43 AM
   *
   * @returns {Promise<any>}
   */
  loadInternal(): Promise<any> {
    let initPromise = deferredPromise();
    this.handler
      .subscribe(this.query, { version: this.version, opVersion: this.opVersion })
      .then(async (iterator) => {
        this.currentIterator = iterator;
        for await (let msg of iterator) {
          let record = msg[Object.keys(msg)[0]];
          switch (record.type) {
            case SyncType.START:
              break;
            case SyncType.UPDATED:
              if (Array.isArray(record.data)) {
                for (let r of record.data) {
                  this.processRecord(r);
                }
              } else {
                this.processRecord(record.data);
              }
              break;
            case SyncType.VERSION_ERROR: {
              initPromise.reject("VERSIONERROR");
            }
            case SyncType.DELETED: {
              if (record.deleteOpVersion && (!this.opVersion || record.deleteOpVersion > this.opVersion))
              {
                this.opVersion = record.deleteOpVersion;
              }
              if (record.deleteVersion > this.version) {
                this.version = record.deleteVersion;
              }
              let orgdoc = this.storage.get(record.deleteId);
              this.storage.delete(record.deleteId);
              if (orgdoc) {
                this.onDeleted(this, orgdoc);
                this.emitter.emit("deleted", this, orgdoc);
              }
              break;
            }
            case SyncType.DONE:
              initPromise.resolve(this.storage);
              break;
          }
        }
      })
      .catch((e) => initPromise.reject(e));
    return initPromise;
  }
  /**
   * Start the subscription and loads initial data. Handle version error to reinitialize the entire mirror
   * @returns A Map containing the data
   */
  load(): Promise<any> {
    let initPromise = deferredPromise();
    this.loadInternal()
      .then((result) => {
        initPromise.resolve(result);
      })
      .catch((e) => {
        this.version = -1;
        if (e == "VERSIONERROR") {
          this.loadInternal()
            .then((r) => initPromise.resolve(r))
            .catch((e) => initPromise.reject(e));
        }
      });
    return initPromise;
  }
  /**
   * Called when a document has been deleted
   * @param {Mirror} mirror - The mirror
   * @param {any} orgdoc - The document that has been deleted
   */
  onDeleted(mirror: this, orgdoc: any) {}
  /**
   * Called when a document has changed
   * @param {Mirror} mirror - The mirror
   * @param {any} doc -The new document
   * @param {any} orgdoc - The original document
   */
  onUpdated(mirror: this, doc: any, orgdoc: any) {}
  /**
   * Called when document is added
   * @param {Mirror} mirror  - The mirror
   * @param {any} doc - The new document
   */
  onInserted(mirror: this, doc: any) {}
  /**
   * Close the mirror subscription
   * @date 6/1/2023 - 9:35:43 AM
   */
  close() {
    this.currentIterator.return();
  }
}
