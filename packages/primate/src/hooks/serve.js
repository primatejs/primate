import {cascade} from "runtime-compat/async";

export default async (app, server) => {
  app.log.info("running serve hooks", {module: "primate"});
  await cascade(app.modules.serve)({...app, server});
};
