import header from "./client/header.js";

export default _ => {
  return {
    name: "@primate/liveview",
    init(app, next/*0.21 compat, remove >0.21*/ = () => null) {
      /*remove>0.21*/app.liveview = {header};
      return next({...app, liveview: {header}});
    },
    async publish(app, next) {
      await app.import("@primate/liveview");
      app.bootstrap({
        type: "script",
        code: "export {default as liveview} from \"@primate/liveview\";\n",
      });
      return next(app);
    },
  };
};
