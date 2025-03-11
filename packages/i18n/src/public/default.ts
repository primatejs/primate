import build from "#hook/build";
import handle from "#hook/handle";
import route from "#hook/route";
import serve from "#hook/serve";
import name from "#name";
import type Dictionary from "@rcompat/record/Dictionary";

export default ({
  // directory for stores
  directory = "locales",
  // default locale
  locale = "en",
} = {}) => {
  const env: {
    active?: boolean;
    locales?: Dictionary,
  } = {};

  return {
    name,
    build: build({ directory, locale }),
    route: route({ locale, env } as any),
    handle: handle({ env }),
    serve: serve({ locale, env }),
  };
};

