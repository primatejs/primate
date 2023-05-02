export default class TransactionManager {
  #started = false;
  #changed = false;
  #read; #write;
  #operations;

  constructor({read, write, operations = {}}) {
    this.#read = read;
    this.#write = write;
    this.#operations = operations;
  }

  async schedule(action, change = false) {
    const result = await action(this.#operations);
    if (change && !this.#started) {
      this.#changed = true;
      await this.#write();
    }
    return result;
  }

  open() {
    this.#started = true;
  }

  close() {
    this.#started = false;
  }

  async read() {
    await this.#read();
  }

  async write() {
    await this.#write();
  }

  get started() {
    return this.#started;
  }

  get unflushed() {
    return this.#changed;
  }

  assert() {
    if (!this.#started) {
      throw new Error("no transaction, use `start` first");
    }
  }

  flush() {
    this.#changed = false;
  }
}
