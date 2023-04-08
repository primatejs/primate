const filter = (key, array) => array?.flatMap(m => m[key] ?? []) ?? [];

export default async env =>
  [...filter("publish", env.modules), _ => _].reduceRight((acc, handler) =>
    input => handler(input, acc))(env);
