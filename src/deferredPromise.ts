export interface DeferedPromise<T> extends Promise<T> {
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason: any) => void;
}

export function deferedPromise<T>(): DeferedPromise<T> {
  var resolve: (value: T | PromiseLike<T>) => void;
  var reject: (reason: any) => void;
  var p: DeferedPromise<T>;
  resolve = (value: T | PromiseLike<T>) => {};
  reject = (reason: any) => {};
  p = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  }) as DeferedPromise<T>;
  p.resolve = resolve;
  p.reject = reject;
  return p;
}
