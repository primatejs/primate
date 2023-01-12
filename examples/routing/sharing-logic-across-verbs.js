import {html, redirect} from "primate";

export default router => {
  // reuse _id
  router.alias("edit-user", "/user/edit/([0-9])+");

  // return user instead of request for all verbs with this route
  router.map("edit-user", () => ({name: "Donald"}));

  // show user edit form
  router.get("edit-user", user => html`<user-edit user="${user}" />`);

  // verify form and save, or show errors
  router.post("edit-user", async user => await user.save()
    ? redirect`/users`
    : html`<user-edit user="${user}" />`);
};
