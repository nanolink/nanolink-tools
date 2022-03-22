import { Subscriptions, TempSubscriptions } from "./definitions/subscriptions";
import { Mirror } from "./mirror";
import { QueryHandler } from "./queryHandler";
import { SubscriptionHandler } from "./subcriptionHandler";
import { initWs } from "./js/initWs";

/**
 * Make websocket available for 'SubscriptionClient'
 */
initWs();
/**
 * This class handle connections to coreserver and is a factory for mirrors
 */
export class Connection {
  subscriptionHandler?: SubscriptionHandler;
  logSubscriptionHandler?: SubscriptionHandler;
  queryHandler: QueryHandler;
  mirrors: Map<string, Mirror> = new Map<string, Mirror>();
  isclosing: boolean = false;

  constructor(url: string, apiToken: string) {
    this.queryHandler = new QueryHandler(url, apiToken);
  }

  async connectLog() {
    if (!this.queryHandler.logServerUrl || !this.queryHandler.token) {
      throw "Needs to login to coreserver before connecting to the logserver";
    }
    this.logSubscriptionHandler = new SubscriptionHandler(
      `${this.queryHandler.logServerUrl
        .replace(/^http/, "ws")
        .replace(/^https/, "wss")}/api/log/ws`,
      this.queryHandler.token
    );
    this.logSubscriptionHandler.onDisconnected = this.callbackTo(
      this.onDisconnectedInternalLog
    );
    this.logSubscriptionHandler.onConnected = this.onConnectedLog;
    this.onLogReady();
  }
  async connect() {
    this.isclosing = false;
    await this.queryHandler.login();
    if (!this.queryHandler.token) {
      throw "Needs to login to coreserver before connecting to the logserver";
    }
    this.subscriptionHandler = new SubscriptionHandler(
      `${this.queryHandler.url
        .replace(/^http/, "ws")
        .replace(/^https/, "wss")}/ws`,
      this.queryHandler.token
    );
    this.subscriptionHandler.onDisconnected = this.callbackTo(
      this.onDisconnectedInternal
    );
    this.subscriptionHandler.onConnected = this.onConnected;
    this.onReady();
  }
  async subscribe(query: string, variables?: any, unwind?: boolean) {
    if (!this.subscriptionHandler) {
      throw "Subscription handler not initialize (connect not called)";
    }
    let iter = await this.subscriptionHandler.subscribe(query, variables);
    if (unwind) {
      return this.subscriptionHandler.wrapBulk(
        iter,
        (n) => n[Object.keys(n)[0]]
      );
    } else {
      return this.subscriptionHandler.unwrap(iter, (n) => n[Object.keys(n)[0]]);
    }
  }
  async subscribelog(query: string, variables?: any, unwind?: boolean) {
    if (!this.logSubscriptionHandler) {
      throw "Log subscription handler not initialize (connectLog not called)";
    }
    let iter = await this.logSubscriptionHandler.subscribe(query, variables);
    if (unwind) {
      return this.logSubscriptionHandler.wrapBulk(
        iter,
        (n) => n[Object.keys(n)[0]]
      );
    } else {
      return this.logSubscriptionHandler.unwrap(
        iter,
        (n) => n[Object.keys(n)[0]]
      );
    }
  }
  async getMirror(name: string): Promise<Map<string, any>> {
    if (!this.subscriptionHandler) {
      throw "Subscription handler not initialize (connect not called)";
    }
    let mirror = this.mirrors.get(name);
    if (mirror) {
      return Promise.resolve(mirror.storage);
    } else {
      let query = Subscriptions.get(name);
      if (query) {
        let newMirror = new Mirror(name, query, this.subscriptionHandler);
        this.mirrors.set(name, newMirror);
        await this.onMirrorCreated(newMirror);
        return newMirror.load();
      } else {
        throw "Mirror query does not exist";
      }
    }
  }
  releaseMirror(name: string) {
    let mirror = this.mirrors.get(name);
    if (mirror) {
      this.mirrors.delete(name);
      mirror.close();
    }
  }
  getTempMirror(name: string): Promise<Mirror> {
    if (!this.subscriptionHandler) {
      throw "Subscription handler not initialize (connect not called)";
    }
    let query = TempSubscriptions.get(name);
    if (query) {
      let mirror = new Mirror(name, query, this.subscriptionHandler);
      return mirror.load();
    } else {
      return Promise.reject("Temp. mirror query does not exist");
    }
  }
  close() {
    this.isclosing = false;
    for (let m of this.mirrors.values()) {
      m.close();
    }
    this.mirrors = new Map<string, Mirror>();
  }

  callbackTo(f: (...p: any[]) => any): (...p: any) => any {
    return (...p: any[]) => f.apply(this, p);
  }
  private onDisconnectedInternal(): void {
    this.onDisconnected();
    if (this.isclosing) {
      setTimeout(() => this.connect(), 5000);
    }
  }
  onDisconnected(): void {}
  onConnected(): void {}
  onMirrorCreated(mirror: Mirror): Promise<any> {
    return Promise.resolve();
  }
  onReady(): void {}
  onConnectedLog(): void {}
  onDisconnectedInternalLog(): void {
    this.onDisconnectedLog();
    setTimeout(() => this.connectLog(), 5000);
  }
  onDisconnectedLog(): void {}
  onLogReady(): void {}
}
