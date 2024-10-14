# Guards

Many web applications have some form of privilege separation, for instance
between guest and authenticated users. In Primate, excluding certain clients
from accessing routes is achieved with guards.

A guard is a function that, like all route functions, accepts a `request`
object as its sole parameter. Guards are tasked with deciding whether to let
clients pass through, and they do so by returning exactly `true`. If the guard
returns anything else, including `undefined`, the route function won't execute.

## Defining

Guards are defined hierarchically alongside routes in the `routes` directory.
To define a guard, create a `+guard.js` file inside `routes`.

```js caption=routes/+guard.js
import redirect from "primate/handler/redirect";

export default request => {
  const { headers } = request;

  // only let in logged in users
  if (headers.get("X-User") === "robin" && headers.get("X-Pass") === "h00d") {
    return true;
  }

  // make an exception for the /login pathname
  if (request.url.pathname === "/login") {
    return true;
  }

  // redirect to login page
  return redirect(`/login?next=${request.url.pathname}`);
};
```

This defines a guard which checks two headers sent along the request, and if
those match the given values, lets the request through. Alternatively, if the
client is trying to access the `/login` pathname, it is also let through. In
all other cases, the guard redirects the client to a login page with the current
pathname provided in the query string.

!!!
For a request to be let through, the guard must return exactly `true`. Primate
will **not** coerce the return value and the route function won't execute
unless exactly `true` is returned. Whatever the guard returns will be used in
its stead.
!!!

Guards thus defined are called automatically on any route in their directory
level and below. Furthermore, guards cascade and it is possible to define
guards in every directory inside `routes` such that several of them may guard
the same route.

## Cascading guards

Consider this route layout inside `routes`.

```sh
.
│  +guard.js
│  login.js
│  logout.js
├─ admin/
│  └─ +guard.js
│  └─ index.js
└─ post/
   └─ index.js
   └─ add.js
```

We here defined two guards. One on the uppermost level, which applies to all
routes, and another inside the `admin` directory, which only applies to
`admin/index.js`. For every route not inside `admin`, the uppermost guard will
execute every time there's a route match. For the `admin/index.js` route, the
uppermost guard will first execute, and if it has let through the client, the
inner guard at `admin/+guard.js` will then be the final adjudicator of whether
to let in the client.
