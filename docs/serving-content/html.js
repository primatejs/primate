import {html} from "primate";

// routes/index.js handles the `/` route
export default {
  get() {
    // to serve HTML, import and use the html handler
    return html("<p>Hello, world!</p>");
  },
};
