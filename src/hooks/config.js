const filter = (key, array) => array?.flatMap(m => m[key] ?? []) ?? [];

export default async app =>
  [...filter("config", app.modules), _ => _].reduceRight((acc, handler) =>
    input => handler(input, acc))(app);
