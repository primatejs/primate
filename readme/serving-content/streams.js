import {File} from "runtime-compat/filesystem";

// routes/index.js handles the `/` route
export default {
  get() {
    // ReadableStream or Blob objects are streamed to the client
    return new File("users.json");
  },
};
