import type SessionData from "#session/Data";
import type Session from "#session/Session";
import type MaybePromise from "pema/MaybePromise";

export default abstract class SessionManager<
  Id extends string = string,
  Data extends SessionData = SessionData
> {
  // init the session manager, potentially loading previously-saved data
  init(): void {
    // noop by default
  };

  abstract get(id: Id): Session<Id, Data>;

  abstract create(session: Session<Id, Data>): void;

  abstract destroy(session: Session<Id, Data>): void;

  abstract commit(): MaybePromise<void>;
};
