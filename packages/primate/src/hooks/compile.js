const filter = (key, array) => array?.flatMap(m => m[key] ?? []) ?? [];

export default async app => {
  app.log.info("running compile hooks");
  await [...filter("compile", app.modules), _ => _]
    .reduceRight((acc, handler) => input => handler(input, acc))(app);
};
