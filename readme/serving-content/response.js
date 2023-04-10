import {Response} from "runtime-compat/http";

// routes/index.js handles the `/` route
export default {
  get() {
    // Use a Response object for custom response status
    return new Response("created!", {status: 201});
  },
};
