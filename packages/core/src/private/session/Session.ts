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

  // read the data of an existing session
  get data(): Data | undefined {
    return this.#data;
  }

  // set data to a session
  set data(data: Data) {
    this.#data = data;
  }

  // commit session
  create(data?: Data) {
    this.#data = data;
    this.#new = false;
    this.#manager.create(this.#id, this);
  }

  // delete an existing session
  delete() {
    this.#manager.delete(this.#id);
    this.#new = true;
  }
}
