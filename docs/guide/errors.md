# Errors

It sometimes makes sense to show different error pages in different parts of
your application. Error routes allow you to create custom error pages for a 
route or a set of routes.


## Defining

Error routes are defined hierarchically alongside routes in the `routes`
directory. To define an error route, create a `+error.js` file inside `routes`.

Similarly to the special guard and layout files, the error route gets a 
`request` parameter and can respond with a proper handler. Here is an example 
with an error route file rendering a Svelte component (`@primate/frontend` must
be installed and loaded in the project).
 
```js caption=routes/+error.js
import { view } from "primate";

export default request => view("ErrorPage.svelte");
```

Like guards and layouts, error files are recursively applied. For every route,
the **nearest** error file to it will apply. It will first look in its own 
directory, and then start climbing up the filesystem hierarchy, falling back to
any `+error.js` file it finds along the way. Unlike guards and layouts, the
moment an `+error.js` file is found, it will be used to handle the response.

The root error file located at `routes/+error.js`, if it exists, has a special
meaning. It applies normally for every route for which no other error file
can be found, but it also applies in cases where no route could be matched. It
thus serves as a classic `404 Not Found` error route.

All error routes use the error page in `pages/error.html`. This file, like
`app.html`, can have placeholders for embedding head scripts and the body. In
case it does not exist, Primate will fall back to its default `error.html`.

```html caption=pages/error.html
<!doctype html>
<html>
  <head>
    <title>Error page</title>
    <meta charset="utf-8" />
    %head%
  </head>
  <body>
    <h1>Error page</h1>
    <p>
      %body%
    </p>
  </body>
</html>
```

Like normal routes, error routes can use a different error page if desired, by
passing a `page` property to the third handler parameter. The page itself must
be located under `pages`.

```js caption=routes/+error.js
import { view } from "primate";

export default request => view("ErrorPage.svelte", {}, {
  page: "other-error.html",
});
```

!!!
Error routes currently do **not** use layout files that would otherwise be
applicable to them in the filesystem hierarchy. This behavior may change in
the future.
!!!
