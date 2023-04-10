import {redirect} from "primate";

// routes/source.js handles the `/source` route
export default {
  get() {
    return redirect("/target");
  },
};
