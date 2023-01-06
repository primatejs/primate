import {html} from "primate";

export default router => {
  router.get("/users", () => {
    const users = [
     {name: "Donald", email: "donald@was.here"},
     {name: "Ryan", email: "ryan@was.here"},
    ];
    return html`<user-index users="${users}" />`;
  });
};
