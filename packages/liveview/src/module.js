import header from "./client/header.js";

export default _ => {
  return {
    name: "@primate/liveview",
    init(app) {
      app.liveview = {header};
    },
    async publish(app, next) {
      await app.import("@primate/liveview");
      return next(app);
    },
  };
};
