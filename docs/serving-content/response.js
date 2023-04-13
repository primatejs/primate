import {Response} from "runtime-compat/http";

// routes/index.js handles the `/` route
export default {
  get() {
    // use a Response object for custom response status
    return new Response("created!", {status: 201});
  },
};
