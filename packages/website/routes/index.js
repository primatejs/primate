import { view } from "primate";

export default {
  get(request) {
    return view("Homepage.svelte", { app: request.config });
  },
};
