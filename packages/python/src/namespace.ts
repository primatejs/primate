import borrow from "#borrow";
import type ResponseFunction from "@primate/core/ResponseFunction";
import error from "primate/handler/error";
import redirect from "primate/handler/redirect";
import view from "primate/handler/view";
import session from "primate/session";
import type { PyProxy } from "pyodide/ffi";

type View = typeof view;
type ViewParams = Parameters<View>;
type RedirectParams = Parameters<typeof redirect>;
type ViewReturn = ReturnType<View>;

export default {
  session: {
    get new() {
      return session.new;
    },
    get id() {
      return session.id;
    },
    get data(): typeof session.data {
      return session.data;
    },
    create(data: PyProxy) {
      return session.create(borrow(data));
    },
    destroy() {
      return session.destroy();
    }
  },
  view(name: ViewParams[0], props?: PyProxy, options?: PyProxy): ViewReturn {
    return view(name, borrow(props), borrow(options));
  },
  redirect(location: RedirectParams[0], status: RedirectParams[1]): ResponseFunction {
    return redirect(location, status);
  },
  error(options: PyProxy): ResponseFunction {
    return error(borrow(options));
  }
};
