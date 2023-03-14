import {default as htmx, partial} from "@primate/htmx";

export default router => {
  // the HTML tagged template handler loads a component from the `components`
  // directory and serves it as HTML, passing any given data as attributes
  router.get("/users", () => {
    const users = [
      {name: "Donald", email: "donald@the.duck"},
      {name: "Joe", email: "joe@was.absent"},
    ];
    return htmx`<user-index users="${users}" />`;
  });

  // this is the same as above, with support for partial rendering (without
  // index.html)
  router.get("/other-users", () => {
    const users = [
      {name: "Other Donald", email: "donald@the.goose"},
      {name: "Other Joe", email: "joe@was.around"},
    ];
    return partial`<user-index users="${users}" />`;
  });
};
