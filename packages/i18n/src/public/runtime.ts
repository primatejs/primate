import route from "#hook/route";
import handle from "#hook/handle";
import serve from "#hook/serve";
import name from "#name";
import type Dictionary from "@rcompat/record/Dictionary";

export default ({
  // default locale
  locale = "en",
} = {}) => {
  const env: {
    active?: boolean;
    locales?: Dictionary,
  } = {};

  return {
    name,
    route: route({ locale, env } as any),
    handle: handle({ env }),
    serve: serve({ locale, env }),
  };
};

