import { SubscriptionHandler } from "./subcriptionHandler";
import { deferedPromise } from "./deferredPromise";

const SyncType = {
  DELETED: "DELETED",
  UPDATED: "UPDATED",
  START: "START",
  DONE: "DONE",
  VERSION_ERROR: "VERSION_ERROR",
};

/**
 * This class is used to mirror data from the nanolink system and monitor changes.
 */
export class Mirror {
  storage: Map<string, any> = new Map<string, any>();
  handler: SubscriptionHandler;
  name: string;
  query: string;
  version: number = -1;
  protected currentIterator: any;
  /**
   *
   * @param {string} name     Name of the mirror
   * @param {string} query    The graphQL query to fetch the mirror (Please use the subscriptions defined in definitions )
   * @param {SubscriptionHandler} handler The subscription handler to use
   */
  constructor(name: string, query: string, handler: SubscriptionHandler) {
    this.name = name;
    this.query = query;
    this.handler = handler;
  }

  private processRecord(record: any) {
    if (record.version > this.version) {
      this.version = record.version;
    }
    let orgdoc = this.storage.get(record.id);
    if (record.deleted != undefined && record.deleted) {
      if (orgdoc) {
        this.storage.delete(orgdoc.id);
        this.onDeleted(this, orgdoc);
      }
    } else {
      this.storage.set(record.id, record);
      if (orgdoc) {
        this.onUpdated(this, record, orgdoc);
      } else {
        this.onInserted(this, record);
      }
    }
  }

  loadInternal(): Promise<any> {
    let initPromise = deferedPromise();
    this.handler
      .subscribe(this.query, { version: this.version })
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
              if (record.deleteVersion > this.version) {
                this.version = record.deleteVersion;
              }
              let orgdoc = this.storage.get(record.deleteId);
              this.storage.delete(record.deleteId);
              if (orgdoc) {
                this.onDeleted(this, orgdoc);
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
   * Start the subscription and loads initial data
   * @returns A Map containing the data
   */
  load(): Promise<any> {
    let initPromise = deferedPromise();
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
  close() {
    this.currentIterator.return();
  }
}
