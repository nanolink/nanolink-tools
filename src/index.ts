import { Subscriptions, TempSubscriptions } from "./definitions/subscriptions";
import { Mirror } from "./mirror";
import { QueryHandler } from "./queryHandler";
import { SubscriptionHandler } from "./subcriptionHandler";
import { initWs } from "./js/initWs";
import { deferredPromise, DeferredPromise } from "./deferredPromise";


//  Make websocket available for 'SubscriptionClient'
 
initWs();


/**
 * This class handle connections to coreserver and logserver. Is also a factory for mirrors
 * @date 6/1/2023 - 8:53:38 AM
 *
 * @export
 * @class Connection
 */
export class Connection {
  /**
   * Handle core subscriptions
   * @date 6/1/2023 - 8:53:29 AM
   *
   * @type {?SubscriptionHandler}
   */
  subscriptionHandler?: SubscriptionHandler;
  /**
   * Handle log subscriptions
   * @date 6/1/2023 - 8:53:29 AM
   *
   * @type {?SubscriptionHandler}
   */
  logSubscriptionHandler?: SubscriptionHandler;
  /**
   * Handle queries and login process for core and log server
   * @date 6/1/2023 - 8:53:29 AM
   *
   * @type {QueryHandler}
   */
  queryHandler: QueryHandler;
  /**
   * A map of the mirrors that the connection handles
   * @date 6/1/2023 - 8:53:29 AM
   *
   * @type {Map<string, Mirror>}
   */
  mirrors: Map<string, Mirror> = new Map<string, Mirror>();
  /**
   * Is set when the connection handler is closing connection to core server
   * @date 6/1/2023 - 8:53:29 AM
   *
   * @type {boolean}
   */
  isclosing: boolean = false;
  /**
   * Is set when the connection handler is closing connection to log server
   * @date 6/1/2023 - 8:53:29 AM
   *
   * @type {boolean}
   */
  islogclosing: boolean = false;
  /**
   * Set to true, to automatically handle reconnect to log server
   * @date 6/1/2023 - 8:53:29 AM
   *
   * @type {boolean}
   */
  logAutoReconnect: boolean = false;
  /**
   * Set to true, to automatically handle reconnect to log server
   * @date 6/1/2023 - 8:53:29 AM
   *
   * @type {boolean}
   */
  autoReconnect: boolean = false;
  
  /**
   * Return customer information
   * @date 6/1/2023 - 8:53:29 AM
   *
   * @readonly
   * @type {*}
   */
  get customer(): any {
    return this.queryHandler?.customer
  }

  /**
   * Creates an instance of Connection.
   * @date 6/1/2023 - 8:53:29 AM
   *
   * @constructor
   * @param {string} url - Url to the core server
   * @param {string} apiToken - The api token given by nanolink
   */
  constructor(url: string, apiToken: string) {
    this.queryHandler = new QueryHandler(url, apiToken);
  }

  /**
   * Start connection to log server
   * @date 6/1/2023 - 8:53:29 AM
   *
   * @async
   * @param {?boolean} [autoReconnect]
   * @returns {*}
   */
  async connectLog(autoReconnect?: boolean) {
    if (!this.queryHandler.logServerUrl || !this.queryHandler.token) {
      throw "Needs to login to coreserver before connecting to the logserver";
    }
    if (this.logSubscriptionHandler) {
      throw "Log is already connected";
    }
    this.islogclosing = false;
    this.logAutoReconnect = autoReconnect ?? true;
    await this.loginLog();
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
  /**
   * Login to core server
   * @date 6/1/2023 - 8:53:29 AM
   *
   * @private
   * @param {DeferredPromise<void>} p
   */
  private dologin(p: DeferredPromise<void>): void {
    this.queryHandler
      .login()
      .then(() => {
        p.resolve();
      })
      .catch((error) => {
        if (this.autoReconnect) {
          if (!this.isclosing) {
            setTimeout(() => this.dologin(p), 5000);
          } else {
            p.reject(error);
          }
        }
      });
  }
  /**
   * Login to the core server
   * @date 6/1/2023 - 8:53:29 AM
   *
   * @private
   * @returns {DeferredPromise<void>}
   */
  private login(): DeferredPromise<void> {
    let retVal = deferredPromise<void>();
    this.dologin(retVal);
    return retVal;
  }

  /**
   * Login to the log server
   * @date 6/1/2023 - 8:53:29 AM
   *
   * @private
   * @param {DeferredPromise<void>} p
   */
  private dologinLog(p: DeferredPromise<void>): void {
    this.queryHandler
      .loginLog()
      .then(() => {
        p.resolve();
      })
      .catch((error) => {
        if (this.logAutoReconnect) {
          if (!this.islogclosing) {
            setTimeout(() => this.dologinLog(p), 5000);
          } else {
            p.reject(error);
          }
        }
      });
  }
  /**
   * Login to the log server
   * @date 6/1/2023 - 8:53:29 AM
   *
   * @private
   * @returns {DeferredPromise<void>}
   */
  private loginLog(): DeferredPromise<void> {
    let retVal = deferredPromise<void>();
    this.dologinLog(retVal);
    return retVal;
  }

  /**
   * Create connection to coreserver
   * @date 6/1/2023 - 8:53:29 AM
   *
   * @async
   * @param {?boolean} [autoReconnect] - Set to true to auto reconnect when disconnected
   * @returns {*}
   */
  async connect(autoReconnect?: boolean) {
    if (this.subscriptionHandler) {
      throw "Is already connected";
    }
    this.isclosing = false;
    this.autoReconnect = autoReconnect ?? true;
    await this.login();
    if (!this.queryHandler.token) {
      throw "Failed login to coreserver";
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
    this.onReady(this.customer);
  }
  /**
   * Subscribe to GraphQL subscribtion on coreserver
   * @date 6/1/2023 - 8:53:29 AM
   *
   * @async
   * @param {string} query - The graphql subscription query
   * @param {?*} [variables] - Variables for the subscription query
   * @param {?boolean} [unwind] - If set and a subscription returns a bulk result (array of results) then makes sure then only 1 result is returned
   * @returns {unknown} - Subscription result
   */
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
  /**
   * Subscribe to GraphQL subscribtion on log coreserver
   * @date 6/1/2023 - 8:53:29 AM
   *
   * @async
   * @param {string} query - The graphql subscription query
   * @param {?*} [variables] - Variables for the subscription query
   * @param {?boolean} [unwind] - If set and a subscription returns a bulk result (array of results) then makes sure then only 1 result is returned
   * @returns {unknown} - Subscription result
   */
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
  /**
   * Retrieve an auto updated mirror from the coreserver
   * @date 6/1/2023 - 8:53:29 AM
   *
   * @async
   * @param {string} name - Name of the mirror. Defined in @see {@link Subscriptions} object
   * @returns {Promise<Map<string, any>>} - Return the mirror as a map
   */
  async getMirror(name: string): Promise<Map<string, any>> {
    if (!this.subscriptionHandler) {
      throw "Subscription handler not initialize (connect not called)";
    }
    let mirror = this.mirrors.get(name);
    if (mirror) {
      return Promise.resolve(mirror.storage);
    } else {
      let query = Subscriptions[name];
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
  /**
   * Release a mirror and stop subscriptions
   * @date 6/1/2023 - 8:53:29 AM
   *
   * @param {string} name - Name of the mirror. Defined in the 'Subscriptions' object
   */
  releaseMirror(name: string) {
    let mirror = this.mirrors.get(name);
    if (mirror) {
      this.mirrors.delete(name);
      mirror.close();
    }
  }
  /**
   * Retrieve a temporary mirror defined in @see {@link TempSubscriptions} object
   * @date 6/1/2023 - 8:53:29 AM
   *
   * @param {string} name - Name of the temp. subscription
   * @returns {Promise<Mirror>} - Returns a Mirror object
   */
  getTempMirror(name: string): Promise<Mirror> {
    if (!this.subscriptionHandler) {
      throw "Subscription handler not initialize (connect not called)";
    }
    let query = TempSubscriptions[name];
    if (query) {
      let mirror = new Mirror(name, query, this.subscriptionHandler);
      return mirror.load();
    } else {
      return Promise.reject("Temp. mirror query does not exist");
    }
  }
  /**
   * Close connection to coreserver 
   * @date 6/1/2023 - 8:53:29 AM
   */
  close() {
    this.isclosing = true;
    for (let m of this.mirrors.values()) {
      m.close();
    }
    this.mirrors = new Map<string, Mirror>();
    this.subscriptionHandler = undefined;
  }
  /**
   * Close connection to logserver
   * @date 6/1/2023 - 8:53:29 AM
   */
  closelog() {
    this.islogclosing = true;
    this.logSubscriptionHandler = undefined;
  }

  /**
   * Call in an object making sure that this is correct.
   * @date 6/1/2023 - 8:53:29 AM
   *
   * @param {(...p: any[]) => any} f
   * @returns {(...p: any) => any}
   */
  callbackTo(f: (...p: any[]) => any): (...p: any) => any {
    return (...p: any[]) => f.apply(this, p);
  }
  /**
   * Called by the subscription handler if connection to coreserver is lost
   * @date 6/1/2023 - 8:53:29 AM
   *
   * @private
   */
  private onDisconnectedInternal(): void {
    this.onDisconnected();
    if (!this.isclosing && this.autoReconnect) {
      setTimeout(() => {
        this.subscriptionHandler = undefined;
        this.connect();
      }, 5000);
    }
  }
  /**
   * Set this callback to get informed when connection to coreserver is lost
   * @date 6/1/2023 - 8:53:29 AM
   */
  onDisconnected(): void {}
  /**
   * Set this callback to get informed when connection to coreserver is established
   * @date 6/1/2023 - 8:53:29 AM
   */
  onConnected(): void {}
  /**
   * Called when a mirror ready for use. Can be used to initialize i.e indexes. This callback should be async
   * @date 6/1/2023 - 8:53:29 AM
   *
   * @param {Mirror} mirror - The @see {@link Mirror} object
   * @returns {Promise<any>} - Async promise
   */
  onMirrorCreated(mirror: Mirror): Promise<any> {
    return Promise.resolve();
  }
  /**
   * Called when the coreserver is ready to start subscriptions. Also called when reconnected to coreserver
   * @date 6/1/2023 - 8:53:29 AM
   *
   * @param {*} customer - Customer object containing customerId and companyName
   */
  onReady(customer: any): void {}
  /**
   * Called when the logserver is ready to start subscriptions. Also called when reconnected to logserver
   * @date 6/1/2023 - 8:53:29 AM
   */
  onConnectedLog(): void {}
  /**
   * Called when conneciton to logserver is lost
   * @date 6/1/2023 - 8:53:28 AM
   */
  onDisconnectedInternalLog(): void {
    this.onDisconnectedLog();
    if (!this.islogclosing && this.logAutoReconnect) {
      setTimeout(() => {
        this.logSubscriptionHandler = undefined;
        this.connectLog();
      }, 5000);
    }
  }
  /**
   * Set this callback to get informed when connection to logserver is lost
   * @date 6/1/2023 - 8:53:28 AM
   */
  onDisconnectedLog(): void {}
  /**
   * Set this callback to get informed when connection to logserver is established
   * @date 6/1/2023 - 8:53:28 AM
   */
  onLogReady(): void {}
}
