import type SessionData from "#session/Data";
import type Session from "#session/Session";

export default abstract class SessionManager<
  Id extends string = string,
  Data extends SessionData = SessionData
> {
  // init the session manager, potentially loading previously-saved data
  init(): void {
    // noop by default
  };

  abstract get(id: Id): Session<Id, Data>;

  abstract create(id: Id, session: Session<Id, Data>): void;

  abstract delete(id: Id): void;
};
