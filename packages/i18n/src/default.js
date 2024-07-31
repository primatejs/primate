import build from "#hook/build";
import context from "#hook/context";
import handle from "#hook/handle";
import serve from "#hook/serve";
import name from "#name";

export default ({
  // directory for stores
  directory = "locales",
  // default locale
  locale = "en",
} = {}) => {
  const env = {};

  return {
    name,
    build: build({ directory, locale }),
    context: context({ env }),
    handle: handle({ env }),
    serve: serve({ locale, env }),
  };
};

