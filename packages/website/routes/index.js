import { view } from "primate";

export default {
  get(request) {
    const props = { app: request.config };
    const options = { placeholders: request.placeholders };

    return view("Homepage.svelte", props, options);
  },
};
