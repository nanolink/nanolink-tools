/**
 * Interface for a deferred promise
 * @date 6/1/2023 - 1:12:28 PM
 *
 * @export
 * @interface DeferredPromise
 * @template T
 * @extends {Promise<T>}
 */
export interface DeferredPromise<T> extends Promise<T> {
  /**
   * Description placeholder
   * @date 6/1/2023 - 1:12:28 PM
   *
   * @type {(value: T | PromiseLike<T>) => void}
   */
  resolve: (value: T | PromiseLike<T>) => void;
  /**
   * Description placeholder
   * @date 6/1/2023 - 1:12:28 PM
   *
   * @type {(reason: any) => void}
   */
  reject: (reason: any) => void;
}

/**
 * Constructor for deferred promise. Makes it posible to resolve a promise at later point
 * @date 6/1/2023 - 1:12:28 PM
 *
 * @export
 * @template T
 * @returns {DeferredPromise<T>}
 */
export function deferredPromise<T>(): DeferredPromise<T> {
  var resolve: (value: T | PromiseLike<T>) => void;
  var reject: (reason: any) => void;
  var p: DeferredPromise<T>;
  resolve = (value: T | PromiseLike<T>) => {};
  reject = (reason: any) => {};
  p = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  }) as DeferredPromise<T>;
  p.resolve = resolve;
  p.reject = reject;
  return p;
}
