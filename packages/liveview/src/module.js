import header from "./client/header.js";

export default _ => {
  return {
    name: "primate:liveview",
    init(app, next) {
      return next({...app, liveview: {header}});
    },
    async publish(app, next) {
      await app.import("@primate/liveview");
      app.export({
        type: "script",
        code: "export {default as liveview} from \"@primate/liveview\";\n",
      });
      return next(app);
    },
  };
};
