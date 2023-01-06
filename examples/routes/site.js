import {html} from "primate";

export default router => {
  router.get("/", () => html`<site-index date="${new Date()}" />`);
};
