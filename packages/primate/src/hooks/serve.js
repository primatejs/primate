import { cascade } from "rcompat/async";

export default async (app, server) => {
  app.log.info("running serve hooks", { module: "primate" });
  await (await cascade(app.modules.serve))({ ...app, server });
};
