import view from "primate/handler/view";
import assert from "@rcompat/invariant/assert";

const posts = [{
  id: 1,
  title: "First post",
}];

const get_post = id => posts.find(post => post.id === +id);

export default {
  get(request) {
    const post = get_post(request.path.id);
    assert(post !== undefined);
    return view("post-view.svelte", { post });
  },
};
