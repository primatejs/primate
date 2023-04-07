const filter = (key, array) => array?.flatMap(m => m[key] ?? []) ?? [];

export default async env => {
  const modules = filter("compile", env.modules);
  const handlers = [...modules, _ => _].reduceRight((acc, handler) =>
    input => handler(input, acc));
  await handlers(env);
};
