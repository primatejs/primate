import type SessionData from "#session/Data";
import SessionManager from "#session/Manager";
import Session from "#session/Session";

const generate_id = () => crypto.randomUUID();

type Id = ReturnType<typeof generate_id>;

class InMemorySessionManager<Data extends SessionData>
  extends SessionManager<Id, Data> {
  #sessions = new Map<Id, Session<Id, Data>>();

  get(id: Id) {
    const session = this.#sessions.get(id);

    if (session === undefined) {
      // creates a non-commited session
      return new Session<Id, Data>(this, generate_id());
    }

    return session;
  }

  create(id: Id, session: Session<Id, Data>) {
    this.#sessions.set(id, session);
  }

  delete(id: Id) {
    this.#sessions.delete(id);
  }
}

export default InMemorySessionManager;
