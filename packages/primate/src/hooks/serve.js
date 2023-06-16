import {identity} from "runtime-compat/function";

export default async (app, server) => {
  app.log.info("running serve hooks", {module: "primate"});
  await [...app.modules.serve, identity]
    .reduceRight((next, previous) =>
      input => previous(input, next))({...app, server});
};
