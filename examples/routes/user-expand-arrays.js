import {router, html} from "primate";

router.get("/users", () => {
  const users = [
   {name: "Donald", email: "donald@was.here"},
   {name: "Ryan", email: "ryan@was.here"},
  ];
  return html`<user-index users="${users}" />`;
});
