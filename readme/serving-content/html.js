import {html} from "primate";

// routes/index.js handles the `/` route
export default {
  get() {
    // To serve HTML, import and use the html handler
    return html("<p>Hello, world!</p>");
  },
};
