import view from "primate/handler/view";

export default {
  get() {
    return view("index.html", { hello: "world"});
  }
}
