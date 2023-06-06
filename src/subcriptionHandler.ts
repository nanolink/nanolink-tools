import { SubscriptionClient } from "graphql-subscriptions-client";
import { deferredPromise, DeferredPromise } from "./deferredPromise";
import EventEmitter from "events";

/**
 * Description placeholder
 * @date 6/1/2023 - 12:04:38 PM
 *
 * @class SubscriptionHandler
 * @param {string} url
 * @param {string} authToken
 */
class SubscriptionHandler {
  /**
   * Description placeholder
   * @date 6/1/2023 - 12:04:38 PM
   *
   * @type {string}
   */
  url: string;
  /**
   * Description placeholder
   * @date 6/1/2023 - 12:04:38 PM
   *
   * @type {(SubscriptionClient | null)}
   */
  client: SubscriptionClient | null;
  /**
   * Description placeholder
   * @date 6/1/2023 - 12:04:38 PM
   *
   * @type {number}
   */
  refcount: number;
  /**
   * Description placeholder
   * @date 6/1/2023 - 12:04:38 PM
   *
   * @type {string}
   */
  authToken: string;
  /**
   * Description placeholder
   * @date 6/1/2023 - 12:04:38 PM
   *
   * @type {*}
   */
  timeout: any;
  /**
   * Description placeholder
   * @date 6/1/2023 - 12:04:38 PM
   *
   * @type {EventEmitter}
   */
  emitter: EventEmitter;

  /**
   * Creates an instance of SubscriptionHandler.
   * @date 6/1/2023 - 12:04:38 PM
   *
   * @constructor
   * @param {string} url
   * @param {string} authToken
   */
  constructor(url: string, authToken: string) {
    this.url = url;
    this.authToken = authToken;
    this.client = null;
    this.refcount = 0;
    this.emitter = new EventEmitter();
  }

  /**
   * Description placeholder
   * @date 6/1/2023 - 12:04:38 PM
   *
   * @private
   * @async
   * @returns {Promise<SubscriptionClient>}
   */
  private async createClient(): Promise<SubscriptionClient> {
    let retVal = deferredPromise<SubscriptionClient>();
    if (this.client) {
      if (this.timeout) {
        clearInterval(this.timeout);
        this.timeout = null;
      }
      this.refcount = this.refcount + 1;
      return this.client;
    }
    let client = new SubscriptionClient(this.url, {
      lazy: false,
      reconnect: false,
      minTimeout: 15000,
      connectionParams: { authToken: this.authToken },
      connectionCallback: (error) => {
        if (error) {
          retVal.reject(error);
        } else {
          retVal.resolve(client);
        }
      },
    });
    client.on(
      "disconnected",
      () => {
        retVal.reject(`Connection timout to: ${this.url}`);
        this.onDisconnectedInternal();
      },
      this
    );
    this.refcount = 1;
    this.client = client;
    this.onConnectedInternal();
    return retVal;
  }
  /**
   * Description placeholder
   * @date 6/1/2023 - 12:04:38 PM
   *
   * @private
   */
  private releaseClient() {
    let conn = this.client;
    this.refcount = this.refcount - 1;
    if (this.refcount == 0) {
      this.timeout = setTimeout(() => {
        this.timeout = null;
        this.client = null;
        conn?.close();
        this.onClientReleasedInternal(this);
      }, 10000);
    }
  }

  /**
   * Subscribe to GraphQL subscription
   * @date 6/1/2023 - 11:33:46 AM
   *
   * @async
   * @param {string} query - GraphQL query string
   * @param {?*} [variables] - Variable for the query (If any)
   * @returns {Promise<AsyncIterableIterator<any>>}
   */
  async subscribe(query: string, variables?: any): Promise<AsyncIterableIterator<any>> {
    let client = await this.createClient();
    let deferred: DeferredPromise<any> | null;
    var pending: Array<any> = [];
    var throwMe: string;
    let done = false;
    let complete = false;
    let self = this;
    let clientReleased = false;

    const subscription = client
      .request({ query: query, variables: variables })
      .subscribe({
        next: (data: any) => {
          pending.push(data);
          if (deferred != null) {
            let d = deferred;
            deferred = null;
            d.resolve(true);
          }
        },
        error: (err: string) => {
          throwMe = err;
          deferred?.reject(err);
        },
        complete: () => {
          complete = true;
          deferred?.resolve(true);
        },
      });
    const retVal: AsyncIterableIterator<any> = {
      [Symbol.asyncIterator](): AsyncIterableIterator<any> {
        return this;
      },
      async next(): Promise<IteratorResult<any>> {
        while (!done) {
          if (pending.length > 0) {
            let e = pending.shift();
            if (e.errors) {
              throw e.errors[0].message;
            } else {
              return { value: e.data, done: false };
            }
          } else {
            if (!complete) {
              deferred = deferredPromise();
              await deferred;
            } else {
              done = true;
            }
          }
        }
        if (!clientReleased) {
          clientReleased = true;
          self.releaseClient();
        }
        return { done: true, value: null };
      },
      async return(): Promise<IteratorResult<any>> {
        done = true;
        subscription?.unsubscribe();
        deferred?.resolve(true);
        if (!clientReleased) {
          clientReleased = true;
          self.releaseClient();
        }
        return { done: true, value: null };
      }
    };
    return retVal;
  }

  /**
   * Used to unwrap the inside of the document returned from the query
   * @date 6/1/2023 - 11:34:44 AM
   *
   * @param {*} iterator
   * @param {(p: any) => any} map
   * @returns {AsyncIterableIterator<any>}
   */
  unwrap(iterator: AsyncIterator<any>, map: (p: any) => any): AsyncIterableIterator<any> {
    return {
      [Symbol.asyncIterator]() {
        return this;
      },
      async next() {
        let r = await iterator.next();
        if (r.done) {
          return { value: null, done: true };
        } else {
          return { value: map(r.value), done: false };
        }
      },
      return() {
        if (iterator.return)
        {
          return iterator.return();
        }
        return Promise.resolve({ value: null, done: true});
      },
    };
  }

  /**
   * Used to unwind a bulk array returned from a subscription
   * @date 6/1/2023 - 12:03:00 PM
   *
   * @param {AsyncIterator<any>} iterator - The iterator to uwrap
   * @param {(p: any) => any} map -> Map function to unwrap the inside document
   * @returns {AsyncIterableIterator<any>}
   */
  wrapBulk(iterator: AsyncIterator<any>, map: (p: any) => any): AsyncIterableIterator<any> {
    let retVal = {
      buffer: Array<any>(),
      done: false,
      [Symbol.asyncIterator]() {
        return this;
      },
      async next() {
        if (this.done) {
          return { value: null, done: true };
        }
        if (this.buffer.length) {
          return { value: this.buffer.shift(), done: false };
        } else {
          let r = await iterator.next();
          if (r.done) {
            this.done = true;
            return { value: null, done: true };
          } else {
            let mapped = map(r.value);
            if (mapped.data) {
              for (let v of mapped.data) {
                this.buffer.push({ type: "UPDATED", data: v });
              }
            } else {
              return { value: mapped, done: false };
            }
            if (this.buffer.length) {
              return {
                value: this.buffer.shift(),
              };
            } else {
              this.done = true;
              return { value: null, done: true };
            }
          }
        }
      },
      return() {
        if (iterator.return)
        {
          return iterator.return();
        }
        return Promise.resolve({value: null, done: true});
      },
    };
    return retVal as AsyncIterableIterator<any>;
  }

  /**
   * Called when connected to the server
   * @date 6/1/2023 - 12:04:38 PM
   *
   * @private
   */
  private onConnectedInternal() {
    this.onConnected();
    this.emitter.emit("connected");
  }
  /**
   * Called when connected to the server
   * @date 6/1/2023 - 12:04:38 PM
   */
  onConnected() {
    console.log(`Connected to ${this.url}`);
  }
  /**
   * Called when disconnected from the server
   * @date 6/1/2023 - 12:04:38 PM
   *
   * @private
   */
  private onDisconnectedInternal() {
    this.onDisconnected();
    this.emitter.emit("disconnected");
  }
  /**
   * Called when disconnected from the server
   * @date 6/1/2023 - 12:04:38 PM
   */
  onDisconnected() {
    console.log(`Disconnected from ${this.url}`);
  }
  /**
   * Called when the internal subscriptionClient is released and closed
   * @date 6/1/2023 - 12:04:38 PM
   *
   * @private
   * @param {this} arg0
   */
  private onClientReleasedInternal(arg0: this) {
    this.onClientReleased(arg0);
    this.emitter.emit("clientreleased", arg0);
  }
  /**
   * Called when the internal subscriptionClient is released and closed
   * @date 6/1/2023 - 12:04:38 PM
   *
   * @param {this} arg0
   */
  onClientReleased(arg0: this) {}
}

export { SubscriptionHandler };
