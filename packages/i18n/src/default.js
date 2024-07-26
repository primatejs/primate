import build from "@primate/i18n/hooks/build";
import context from "@primate/i18n/hooks/context";
import handle from "@primate/i18n/hooks/handle";
import serve from "@primate/i18n/hooks/serve";

export default ({
  // directory for stores
  directory = "locales",
  // default locale
  locale = "en",
} = {}) => {
  const env = {};

  return {
    name: "primate:i18n",
    build: build({ directory, locale }),
    context: context({ env }),
    handle: handle({ env }),
    serve: serve({ locale, env }),
  };
};

