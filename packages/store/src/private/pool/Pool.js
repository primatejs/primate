import map from "@rcompat/async/map";
import assert from "@rcompat/invariant/assert";
import every from "@rcompat/invariant/every";
import is from "@rcompat/invariant/is";
import errors from "./errors.js";

export default class Pool {
  #size;
  #timeout;
  #waitfor;
  #manager;
  #free = [];
  #used = [];

  constructor({
    // maximal connection size
    size = 4,
    // timeout to acquire a connection, in milliseconds
    timeout = 500,
    // waitfor reacquiring, in milliseconds
    waitfor = 50,
    // connection manager, must implement `new` and `kill`
    manager,
  } = {}) {
    every(size, timeout, waitfor).usize();
    is(manager).defined();
    every(manager.new, manager.kill).function();

    this.#size = size;
    this.#manager = manager;
    this.#timeout = timeout;
    this.#waitfor = waitfor;
  }

  get size() {
    return this.#free.length + this.#used.length;
  }

  get inflatable() {
    return this.#size - this.size > 0;
  }

  #inflate() {
    return this.inflatable ? this.#manager.new() : undefined;
  }

  get reusable() {
    return this.#free.length > 0;
  }

  #reuse() {
    return this.reusable ? this.#free.pop() : this.#inflate();
  }

  async #acquire() {
    const connection = await this.#reuse();

    if (connection !== undefined) {
      this.#used = [...this.#used, connection];
      return connection;
    }

    return undefined;
  }

  #reacquire(timeout) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(this.acquire(timeout - this.#waitfor));
      }, this.#waitfor);
    });
  }

  async acquire(timeout = this.#timeout) {
    assert(timeout >= 0, errors.TIMED_OUT);

    const connection = await this.#acquire();
    return connection === undefined
      ? this.#reacquire(timeout)
      : connection;
  }

  release(connection) {
    const i = this.#used.findIndex(used => used === connection);
    assert(i !== -1, errors.NOT_FOUND);

    this.#free = [...this.#free, this.#used.at(i)];
    this.#used = [...this.#used.slice(0, i), ...this.#used.slice(i + 1)];
  }

  async clear() {
    await map(this.#free, connection => this.#manager.kill(connection));
    this.#free = [];

    await map(this.#used, connection => this.#manager.kill(connection));
    this.#used = [];
  }
}
