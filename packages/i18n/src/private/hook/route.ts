import type Manager from "#Manager";
import name from "#name";
import type { RequestHook } from "@primate/core/hook";
import type RequestFacade from "@primate/core/RequestFacade";

export default (manager: Manager): RequestHook => (request: RequestFacade, next) => {
  if (!manager.active) {
    return next(request);
  }

  const server_locales = Object.keys(manager.locales);
  const client_locales = request.headers.get("accept-language")
    ?.split(";")[0]?.split(",") ?? [];

  const locale = request.cookies[name]
    ?? client_locales.find(c_locale => server_locales.includes(c_locale))
    ?? manager.locale;

  return next({ ...request, context: {
    i18n: { locale, locales: manager.locales } }
  });
};
