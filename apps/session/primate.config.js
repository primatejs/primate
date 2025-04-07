import html from "@primate/html";
import typescript from "@primate/typescript";

export default {
  modules: [html(), typescript()],
  session: {
    implicit: true,
  },
}
