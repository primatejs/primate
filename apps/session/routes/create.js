import session from "primate/session";

export default {
  get() {
    session.create({ foo: "bar" });

    return session.data;
  }
}
