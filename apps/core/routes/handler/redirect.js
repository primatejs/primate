import redirect from "primate/handler/redirect";

export default {
  get() {
    return redirect("/redirected");
  }
}
