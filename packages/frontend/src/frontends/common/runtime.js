import handler from "./handler.js";
import normalize from "./normalize.js";

export default ({
  name,
  default_extension,
  imports,
  exports,
}) => {
  const normalized = normalize(name);

  return ({
    extension = default_extension,
    // active SPA browsing
    spa = true,
  } = {}) => {
    return {
      name: `primate:${name}`,
      serve(app, next) {
        app.register(extension, {
          handle: handler({
            app,
            name,
            render: imports.render,
            client: exports.default,
            normalize: normalized,
            spa,
          }),
        });
        return next(app);
      },
    };
  };
};
