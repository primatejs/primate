import {bold} from "runtime-compat/colors";
import errors from "./errors.js";

const last = -1;
const ending = -3;

const validGuard = guard => typeof guard === "function";
const valid = (guard, name) => validGuard(guard)
  ? guard
  : errors.InvalidGuard.throw({name});

export default ({
  /* directory for guards */
  directory = "guards",
} = {}) => {
  let enabled = true;
  const env = {
    defaults: {},
  };
  return {
    name: "@primate/guard",
    async load(app) {
      try {
        env.log = app.log;

        const root = app.root.join(directory);
        !await root.exists && errors.MissingGuardDirectory.throw({base: root});

        env.guards =
          await Promise.all((await root.collect(/^.*.js$/u, {
            recursive: false,
          }))
            /* accept only lowercase-first files in guard filename */
            .filter(path => /^[a-z]/u.test(path.name))
            .map(path => [
              `${path}`.replace(`${root}/`, () => "").slice(0, ending),
              path,
            ])
            .map(async ([name, path]) => {
              const exports = await import(path);
              const guard = exports.default;
              valid(guard, name);

              const pathed = name.replaceAll("/", ".");

              env.log.info(`loading ${bold(pathed)}`, {module: "primate/guard"});

              return [pathed, guard];
            })
          );
        Object.keys(env.guards).length === 0
          && errors.EmptyGuardDirectory.throw({root});

        env.log.info("all guards nominal", {module: "primate/guard"});
      } catch (error) {
        enabled = false;
        return env.log.auto(error);
      }
    },
    async route(request, next) {
      if (!enabled) {
        return next(request);
      }

      const guardError = Symbol("guardError");

      const guard = Object.fromEntries(env.guards.map(([name, guard]) => 
        [name, (...args) => {
          const result = guard(request, ...args);
          if (result === true) {
            return;
          }
          const error = new Error();
          error.result = result;
          error.type = guardError;
          throw error;
        }]
      ));
      try {
        return await next({...request, guard});
      } catch(error) {
        if (error.type === guardError) {
          return error.result;
        }
        // rethrow if not guard error
        throw error;
      }
    },
  };
};
