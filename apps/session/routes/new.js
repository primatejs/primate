import session from "primate/session";

export default {
  get() {
    if (session.new) {
      return "no session";
    }
    return "session";
  }
}
