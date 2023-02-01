import html from "@primate/html";

export default router => {
  router.get("/", () => html`<site-index date="${new Date()}" />`);
};
