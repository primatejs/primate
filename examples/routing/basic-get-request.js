import html from "@primate/html";

export default router => {
  // accessing /site/login will serve the contents of
  // `components/site-login.html` as HTML
  router.get("/site/login", () => html`<site-login />`);
};
