import type SessionData from "#session/Data";
import local_storage from "./storage.js";

const session = () => local_storage.getStore();

export default {
  get new(): boolean {
    return session().new;
  },
  get id(): string {
    return session().id;
  },
  get data(): SessionData {
    return session().data;
  },
  create(data?: SessionData): void {
    return session().create(data);
  },
  delete(): void {
    return session().delete();
  }
};
