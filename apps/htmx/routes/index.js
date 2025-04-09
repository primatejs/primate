import view from "primate/handler/view";

const posts = [{
  id: 1,
  title: "First post",
}];

export default {
  get() {
     return view("post-index.htmx", { posts });
  },
};
