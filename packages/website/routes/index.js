import { view } from "primate";

export default {
  get(request) {
    return view("priss/Homepage.svelte", { app: request.config });
  },
};
