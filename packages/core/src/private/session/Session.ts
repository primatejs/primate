import type SessionData from "#session/Data";
import type SessionManager from "./Manager.js";

export default class Session<
  Id extends string,
  Data extends SessionData
>{
  #manager: SessionManager;
  #id: Id;
  #new: boolean = true;
  #data?: Data;

  constructor(manager: SessionManager, id: Id) {
    this.#id = id;
    this.#manager = manager;
  }

  get new() {
    return this.#new;
  }

  get id() {
    return this.#id;
  }

  get data(): Data | undefined {
    return this.#data;
  }

  set data(data: Data) {
    this.#data = data;
  }

  create(data?: Data) {
    this.#data = data;
    this.#new = false;
    this.#manager.create(this);
  }

  destroy() {
    this.#manager.destroy(this);
    this.#new = true;
  }
}
