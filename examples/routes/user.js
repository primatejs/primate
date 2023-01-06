import {html, redirect} from "primate";

export default router => {
  router.alias("_id", "([0-9])+");

  router.map("/user/edit/_id", request => {
    const user = {name: "Donald", email: "donald@was.here"};
    // return original request and user
    return {...request, user};
  });

  router.get("/user/edit/_id", request => {
    // show user edit form
    return html`<user-edit user="${request.user}" />`;
  });

  router.post("/user/edit/_id", async request => {
    const {user, payload} = request;
    // verify form and save / show errors
    // this assumes `user` has a method `save` to verify data
    return await user.save(payload)
      ? redirect`/users`
      : html`<user-edit user="${user}" />`;
  });
};
