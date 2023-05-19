import Logger from "./Logger.js";

export default Object.fromEntries(Object.entries({
  CannotParseBody({body, contentType}) {
    return {
      message: ["cannot parse body % as %", body, contentType],
      fix: ["use a different content type or fix body"],
      level: Logger.Warn,
    };
  },
  DoubleModule({modules, config}) {
    const double = modules.find((module, i, array) =>
      array.filter((_, j) => i !== j).includes(module));
    return {
      message: ["double module % in %", double, config],
      fix: ["load % only once", double],
      level: Logger.Error,
    };
  },
  DoublePathParameter({path, double}) {
    return {
      message: ["double path parameter % in route %", double, path],
      fix: ["disambiguate path parameters in route names"],
      level: Logger.Error,
    };
  },
  DoubleRoute({double}) {
    return {
      message: ["double route %", double],
      fix: ["disambiguate route % and %", double, `${double}/index`],
      level: Logger.Error,
    };
  },
  EmptyRouteFile({config: {paths}, route}) {
    return {
      message: ["empty route file at %", `${paths.routes}/${route}.js`],
      fix: ["add routes or remove file"],
      level: Logger.Warn,
    };
  },
  EmptyTypeDirectory({root}) {
    return {
      message: ["empty type directory"],
      fix: ["populate % with types or remove it", root],
      level: Logger.Warn,
    };
  },
  ErrorInConfigFile({config, message}) {
    return {
      message: ["error in config %", message],
      fix: ["check errors in config file by running %", `node ${config}`],
      level: Logger.Error,
    };
  },
  InvalidPathParameter({named, path}) {
    return {
      message: ["invalid path parameter % in route %", named, path],
      fix: ["use only latin letters and decimal digits in path parameters"],
      level: Logger.Error,
    };
  },
  InvalidRouteName({path}) {
    return {
      message: ["invalid route name %", path],
      fix: ["do not use dots in route names"],
      level: Logger.Error,
    };
  },
  InvalidType({name}) {
    return {
      message: ["invalid type %", name],
      fix: ["use only functions for the default export of types"],
      level: Logger.Error,
    };
  },
  InvalidTypeName({name}) {
    return {
      message: ["invalid type name %", name],
      fix: ["use only latin letters and decimal digits in types"],
      level: Logger.Error,
    };
  },
  MismatchedPath({path, message}) {
    return {
      message: [`mismatched % path: ${message}`, path],
      fix: ["if unintentional, fix the type or the caller"],
      level: Logger.Info,
    };
  },
  MismatchedType({message}) {
    return {
      message: [`mismatched type: ${message}`],
      fix: ["if unintentional, fix the type or the caller"],
      level: Logger.Info,
    };
  },
  ModuleHasNoHooks({hookless}) {
    const modules = hookless.map(({name}) => name).join(", ");
    return {
      message: ["module % has no hooks", modules],
      fix: ["ensure every module uses at least one hook or deactivate it"],
      level: Logger.Warn,
    };
  },
  ModulesMustHaveNames({n}) {
    return {
      message: ["modules must have names"],
      fix: ["update module at index % and inform maintainer", n],
      level: Logger.Error,
    };
  },
  EmptyConfigFile({config}) {
    return {
      message: ["empty config file at %", config],
      fix: ["add configuration options or remove file"],
      level: Logger.Warn,
    };
  },
  NoFileForPath({pathname, config: {paths}}) {
    return {
      message: ["no file for %", pathname],
      fix: ["if unintentional create a file at %%", paths.static, pathname],
      level: Logger.Info,
    };
  },
  NoHandlerForExtension({name, ending}) {
    return {
      message: ["no handler for % extension", ending],
      fix: ["add handler module for % files or remove %", `.${ending}`, name],
      level: Logger.Error,
    };
  },
  NoRouteToPath({method, pathname, config: {paths}}) {
    const route = `${paths.routes}${pathname === "" ? "index" : pathname}.js`;
    return {
      message: ["no % route to %", method, pathname],
      fix: ["if unintentional create a route at %", route],
      level: Logger.Info,
    };
  },
  ReservedTypeName({name}) {
    return {
      message: ["type name % is reserved", name],
      fix: ["do not use any reserved type names"],
      level: Logger.Error,
    };
  },
}).map(([name, error]) => [name, Logger.throwable(error, name, "primate")]));
