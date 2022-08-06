import {router, html} from "primate";

router.get("/", () => html`<site-index date="${new Date()}" />`);
