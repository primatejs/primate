import {router, html, redirect} from "primate";

router.alias("_id", "([0-9])+");

router.map("/user/edit/_id", request => {
  const user = {name: "Donald"};
  // return original request and user
  return {...request, user};
});

router.get("/user/edit/_id", request => {
  // show user edit form
  return html`<user-edit user="${request.user}" />`;
});

router.post("/user/edit/_id", async request => {
  const {user} = request;
  // verify form and save / show errors
  return await user.save()
    ? redirect`/users`
    : html`<user-edit user="${user}" />`;
});
