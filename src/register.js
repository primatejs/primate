const filter = (key, array) => array?.flatMap(m => m[key] ?? []) ?? [];

export default async env => {
  const modules = filter("register", env.modules);
  const registry = (name, handler) => env.register(name, handler);
  const registrations = [...modules, _ => _].reduceRight((acc, handler) =>
    input => handler(input, acc));
  await registrations(registry);
};
