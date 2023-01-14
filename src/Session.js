import Domain from "./domain/Domain.js";

const extract_id = cookie_header => cookie_header
  ?.split(";").filter(text => text.includes("session_id="))[0]?.split("=")[1];

export default class Session extends Domain {
  static fields = {
    "?data": Object,
    created: value => value ?? new Date(),
  };

  static async get(cookie_header) {
    const session = await Session.touch({_id: extract_id(cookie_header)});
    await session.save();
    if (session.new) {
      session.has_cookie = false;
    }
    return session;
  }

  get cookie() {
    return `session_id=${this._id}; Path=/; Secure; HttpOnly`;
  }
}
