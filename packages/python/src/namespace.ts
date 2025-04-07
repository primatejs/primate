import borrow from "#borrow";
import error from "primate/handler/error";
import redirect from "primate/handler/redirect";
import view from "primate/handler/view";
import session from "primate/session";
import type { PyProxy } from "pyodide/ffi";

type View = typeof view;
type ViewParams = Parameters<View>;
type RedirectParams = Parameters<typeof redirect>;
type ErrorParams = Parameters<typeof error>;
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
    delete() {
      return session.delete();
    }
  },
  view(name: ViewParams[0], props?: PyProxy, options?: PyProxy): ViewReturn {
    return view(name, borrow(props), borrow(options));
  },
  redirect(location: RedirectParams[0], status: RedirectParams[1]) {
    return redirect(location, status);
  },
  error(body: ErrorParams[0], options: ErrorParams[1]) {
    return error(body, options);
  }
};
