import {redirect} from "primate";

// routes/site/login.js handles the `/site/login` route
export default {
  get() {
    // strings are served as plain text
    return "Hello, world!";
  },
  // other HTTP verbs are also available
  post() {
    return redirect("/");
  },
};
