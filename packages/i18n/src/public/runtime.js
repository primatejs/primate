import context from "#hook/context";
import handle from "#hook/handle";
import serve from "#hook/serve";
import name from "#name";

export default ({
  // default locale
  locale = "en",
} = {}) => {
  const env = {};

  return {
    name,
    context: context({ env }),
    handle: handle({ env }),
    serve: serve({ locale, env }),
  };
};

