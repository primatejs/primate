const filter = (key, array) => array?.flatMap(m => m[key] ?? []) ?? [];

export default async (app, server) => {
  app.log.info("running serve hooks", {module: "primate"});
  await [...filter("serve", app.modules), _ => _]
    .reduceRight((acc, handler) => input =>
      handler(input, acc))({...app, server});
};
