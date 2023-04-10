export default (name, props, options) =>
  async (env, headers) => {
    const ending = name.slice(name.lastIndexOf(".") + 1);
    const handler = env.handlers[ending];
    if (handler === undefined) {
      return env.log.error(new Error(`no handler for ${ending} components`));
    }
    return handler(name, props, options)(env, headers);
  };
