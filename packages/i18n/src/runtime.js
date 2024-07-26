import context from "@primate/i18n/hooks/context";
import handle from "@primate/i18n/hooks/handle";
import serve from "@primate/i18n/hooks/serve";

export default ({
  // default locale
  locale = "en",
} = {}) => {
  const env = {};

  return {
    name: "primate:i18n",
    context: context({ env }),
    handle: handle({ env }),
    serve: serve({ locale, env }),
  };
};

