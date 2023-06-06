# Guards

Many web applications have some form of privilege separation, for instance
between guest and authenticated users. In Primate, excluding certain clients
from accessing routes is achieved with guards.

A guard is a function that, like all route functions, receives a `request`
object as its sole parameter. Guards are tasked with deciding whether to let
clients pass through, and they do so by returning exactly `true`. If the guard
returns anything else, including `undefined`, the route function won't execute.

## Defining

Guards are defined in the `guards` directory, unless specified
[elsewise](/guide/configuration/#paths-guards) in the configuration. Guard
filenames are limited to alphanumeric symbols and underscore.

```js caption=guards/loggedIn.js | defining a guard
import {redirect} from "primate";

export default request => {
  const {headers} = request;

  if (headers.get("X-User") === "robin" && headers.get("X-Pass") === "h00d") {
    return true;
  }

  return redirect(`/login?next=${request.url.pathname}`);
};
```

That defines a guard which checks two headers sent along the request, and if
those match the given values, lets the request through. In all other cases, the
guard redirects the client to a login page with the current request pathname
provided in the query string.

!!!
For a request to be let through, the guard must return the value `true`.
Primate will not coerce the return value the route function won't execute unless
exactly `true` is returned. Whatever the guard returns will be used in its
stead.
!!!

There are two ways to use a guard: explicitly calling it in your route
function or specifying it as part of the route path.

## Calling

Defined guards are injected into the `guard` property of the request object. In
order to use a guard, call it within the route function it should protect. For
this matter, assume we have defined a guard that ensures users may only edit
resources they own. This example also assumes we're using the sessions module
to record users who have logged in.

```js caption=guards/me.js | protecting your own resources
import {Response, Status} from "primate";

export default ({session, path}) => {
    if (session.get("userId") === query.get("userId")) {
      return true;
    }

    return new Response("Forbidden", {status: Status.Forbidden});
}
```

```js caption=routes/user/edit/${userId}.js | calling guards
export default {
  get(request) {
    /* call the guard first */
    request.guard.me();

    return "protected";
  }
}
```

Calling the guard this way will execute it with the current request and will
only continue execution if it returns exactly `true`, that is if the `userId`
path parameter is exactly equal to the session's `userId` property.

This method of using guards is particularly useful if you want to call the
guard only on certain HTTP verbs. For the most part, expressing the guard in
your route filename will be simpler and more visible.

## Guards in route filenames

The easiest way to use a guard is to refer to it in the filename of a route.
For example, with our previous `me` guard definition, creating a route file
at `routes/+me/user/edit/{userId}.js` specifies that any request beginning with
`/user/edit/` followed by a path parameter will be first checked against the
`me` guard, regardless of the HTTP verb used.

In a similar fashion, you can group entire route trees under a guard, to place
them all under its protection. For example, if you wanted several routes under
`/admin` to be guarded by a guard named `admin`, you would create them as
`routes/+admin/post/add`, `routes/+admin/post/edit/${postId}` and so forth.

To keep things simple, there are certain rules to how guards can be used in
route filenames.

* Everything between the `+` and the next path separator is part of the guard,
  and there must be exist a guard with this name
* It is possible to use a guard at any path level, but only one guard per path;
`routes/+loggedIn/user/view/${userId}.js` or
`routes/user/+loggedIn/view/${userId}.js` are either permissible and express
the same path, but `routes/+loggedIn/+admin/user.js` isn't. If you need the
admin guard to first check if the user is logged in, integrate it directly into
the  guard
* Routes still need to be unique, so creating the same route with and without a
guard, as in `routes/+me/view` and `routes/view` isn't permissible. Same goes
for having both `routes/+loggedIn/user/view/${userId}.js` and 
`routes/user/+loggedIn/view/${userId}.js`

Those cases are all detected during startup, and Primate will bail out and tell
you the names of the conflicting paths.
