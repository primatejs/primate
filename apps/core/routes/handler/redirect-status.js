import redirect from "primate/handler/redirect";
import Status from "primate/http/Status";

export default {
  get() {
    return redirect("/redirected", Status.MOVED_PERMANENTLY);
  }
}
