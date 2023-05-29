export default class TransactionManager {
  #started = false;
  #changed = false;
  #read; #write;
  #actions;
  #mutex;
  #unlock;

  constructor({read, write, actions = {}}) {
    this.#read = read;
    this.#write = write;
    this.#actions = actions;
  }

  async schedule(action, change = false) {
    const result = await action(this.#actions);
    if (change && !this.#started) {
      this.#changed = true;
      await this.#write();
    }
    return result;
  }

  async open() {
    await this.#mutex;
    this.#mutex = new Promise(resolve => {
      this.#unlock = () => {
        this.#started = false;
        resolve();
      };
    });
    this.#started = true;
  }

  close() {
    this.#unlock();
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
