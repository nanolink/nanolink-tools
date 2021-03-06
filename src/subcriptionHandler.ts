import { SubscriptionClient } from "graphql-subscriptions-client";
import { deferedPromise, DeferedPromise } from "./deferredPromise";
import EventEmitter from "events";

class SubscriptionHandler {
  url: string;
  client: SubscriptionClient | null;
  refcount: number;
  authToken: string;
  timeout: any;
  emitter: EventEmitter;

  constructor(url: string, authToken: string) {
    this.url = url;
    this.authToken = authToken;
    this.client = null;
    this.refcount = 0;
    this.emitter = new EventEmitter();
  }

  private async createClient(): Promise<SubscriptionClient> {
    let retVal = deferedPromise<SubscriptionClient>();
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

  async subscribe(query: string, variables?: any) {
    let client = await this.createClient();
    let deferred: DeferedPromise<any> | null;
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
    return {
      [Symbol.asyncIterator]() {
        return this;
      },
      async next() {
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
              deferred = deferedPromise();
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
      async return() {
        done = true;
        subscription?.unsubscribe();
        deferred?.resolve(true);
        if (!clientReleased) {
          clientReleased = true;
          self.releaseClient();
        }
        return { done: true, value: null };
      },
    };
  }

  unwrap(iterator: any, map: (p: any) => any) {
    return {
      [Symbol.asyncIterator]() {
        return this;
      },
      async next() {
        let r = await iterator.next();
        if (r.done) {
          return { done: true };
        } else {
          return { value: map(r.value) };
        }
      },
      return() {
        return iterator.return();
      },
    };
  }

  wrapBulk(iterator: any, map: (p: any) => any) {
    return {
      buffer: Array<any>(),
      done: false,
      [Symbol.asyncIterator]() {
        return this;
      },
      async next() {
        if (this.done) {
          return { done: true };
        }
        if (this.buffer.length) {
          return { value: this.buffer.shift() };
        } else {
          let r = await iterator.next();
          if (r.done) {
            this.done = true;
            return { done: true };
          } else {
            let mapped = map(r.value);
            if (mapped.data) {
              for (let v of mapped.data) {
                this.buffer.push({ type: "UPDATED", data: v });
              }
            } else {
              return { value: mapped };
            }
            if (this.buffer.length) {
              return {
                value: this.buffer.shift(),
              };
            } else {
              this.done = true;
              return { done: true };
            }
          }
        }
      },
      async return() {
        return iterator.return();
      },
    };
  }

  private onConnectedInternal() {
    this.onConnected();
    this.emitter.emit("connected");
  }
  onConnected() {
    console.log(`Connected to ${this.url}`);
  }
  private onDisconnectedInternal() {
    this.onDisconnected();
    this.emitter.emit("disconnected");
  }
  onDisconnected() {
    console.log(`Disconnected from ${this.url}`);
  }
  private onClientReleasedInternal(arg0: this) {
    this.onClientReleased(arg0);
    this.emitter.emit("clientreleased", arg0);
  }
  onClientReleased(arg0: this) {}
}

export { SubscriptionHandler };
