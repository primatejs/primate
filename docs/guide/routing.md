# Routing

Primate uses filesystem-based routes. Route files are JavaScript files in the
`routes` directory that correspond to their routes. For example, the file
at `routes/user/profile.js` is used to handle a client accessing
`/user/profile`. The path may include parameters in braces, which are
mapped to `request.path`, and which may have types.

To illustrate this, consider that inside `routes`

* `index.js` is mapped to the root route (`/`)
* `user.js` is mapped to `/user`
* `user/{userId}.js` is mapped to a
[route with parameters](#parameters), for example `/user/1` (but also
`/user/donald`)
* `user/{userId:uuid}.js` is mapped to a
[route with typed parameters](#typed-parameters) route where `userId` is of the
type `uuid`, for example `/user/f6a3fac2-7c1d-432d-9e1c-68d0db925adc` (but not
`/user/1`)

## HTTP verbs

Every route file exports an object containing one or many HTTP verb functions.
Primate supports the CRUD verbs (`POST`, `GET`, `PUT`, `DELETE`) as well
additional verbs (`CONNECT`, `OPTIONS`, `TRACE`, `PATCH`).

```js filename=routes/user/profile.js
export default {
  get() {
    return "this is a GET request";
  },
  put() {
    return "this is a PUT request";
  },
};
```

In this example, accessing the path `/user/profile` using any of the specified
verbs will return a plain-text response as specified.

## The request object

All verb functions accept a single parameter representing request data. This
aggregate object allows easy access to the request `body`, any `path`
parameters defined with braces, the analyzed `query` string, `cookies` as well
as other `headers` and a reference to the `original` WHATWG Request object. The
aggregate nature of this object allows you to pull in what you need using
object destructuring.

### body

The request's body, if relevant. For requests that have no body (such
as GET requests), it defaults to `null`.

```js file=routes/your-name.js
export default() {
  post(request) {
    const {body} = request;

    return `Hello, ${body}`;
  },
}
```

If a client sends a `text/plain` POST request to `/your-name` with "Donald" as
body, this route will respond with 200 saying `Hello, Donald`.

Primate will try to decode the body according to the `Content-Type` header
used in the request.

* `application/x-www-form-urlencoded`, which is primarily used in HTML forms,
decodes the form fields into object properties
* `application/json` will decode the given JSON string using `JSON.parse`

```js file=routes/your-full-name.js
export default() {
  post(request) {
    const {body} = request;

    if (body?.name === undefined) {
      return "You haven't specified your name";
    }

    return `Hello, ${body.name}`;
  }
}
```

In this example, if a client sends a request to `/your-full-name` with an HTTP
form (`application/x-www-form-urlencoded`) or JSON data (`application/json`) as
body that contains a field `name` in it, Primate will respond by saying Hello
and the provided name.

### path

The request's path, an object containing named parameters.

```js file=routes/users/{user}.js
import {error} from "primate";

const users = ["Donald", "Ryan"];

export default() {
  post(request) {
    const {path} = request;

    if (users.includes(path.user)) {
      return `Hello, ${path.user}`;
    }

    return error("Unknown user");
  }
}
```

If a user requests POST `/users/Donald` or `/users/Ryan`, Primate will respond
with `200`, saying Hello. It will otherwise reply with `404` saying Unknown
user.

We will later handle [routes with parameters](#parameters) in depth.

### query

The request's query string, broken down into its constituent parts.

```js file=routes/users.js
import {error} from "primate";

const users = ["Donald", "Ryan"];

export default() {
  post(request) {
    const {query} = request;

    if (users.includes(query.user)) {
      return `Hello, ${query.user}`;
    }

    return error("Unknown user");
  }
}
```

If a user requests POST `/users?user=Donald` or `/users?user=Ryan`, Primate
will respond with `200`, otherwise with `404`.

### cookies

The request's `Cookie` header, broken down into individual cookies as a
key-value object.

```js file=routes/current-user.js
import {error} from "primate";

const users = ["Donald", "Ryan"];

export default() {
  post(request) {
    const {cookies} = request;

    if (users.includes(cookies.user)) {
      return `Hello, ${cookies.user}`;
    }

    return error("Unknown user");
  }
}
```

If a user requests POST `/current-user` with the `Cookie` header set to
`user=Donald` or `user=Ryan`, Primate will respond with `200`, otherwise with
`404`.

### headers

The request's headers, compacted into a a key-value object.

```js file=routes/current-x-user.js
import {error} from "primate";

const users = ["Donald", "Ryan"];

export default() {
  post(request) {
    const {headers} = request;

    if (users.includes(headers["X-User"])) {
      return `Hello, ${header["X-User"]}`;
    }

    return error("Unknown user");
  }
}
```

If a user requests POST `/current-x-user` with a `X-User` header set to
`Donald` or `Ryan`, Primate will respond with `200`, otherwise with `404`.

### original

The `original` property of the request object provides access to the original
WHATWG Request object, for low-level request data access.

## Parameters

Route paths may contain parameters in braces, which indicate they will be
mapped to `request.path`. Path parameter names are case sensitive, and a
request may contain any number of them, though it must not contain the same
parameter in the same case twice. They must be non-empty, that is matched by
at least one character.

By default, parameters will match anything in the path except `/`, though they
are not greedy. A path like `/users/{userId}a.js` is unambiguous: it will match
any path that starts with `/users/` followed by anything that is not `/` or
`a`, provided that it ends with `a`. The last `a` can therefore not be part of
the match.

Such a path will thus be matched by all the following requests.

* `/users/1a`
* `/users/aa`
* `/users/ba?key=value`

The same path won't be matched by any of the following requests.

* `/user/1a` (does not begin with `/users`)
* `/users/a` (must match at least one character)
* `/users/aA` (paths are case-sensitive, path does not end with `a`)
* `/users//a` (does not match `/`)
* `/users/?a` (`?` denotes end of path)

## Typed parameters

Parameters can be also typed, in which case their value can be restricted.
Types need to be defined in the `types` directory as predicate functions
(returning `true` or `false`) before they can be used. The name of the file
corresponds to the type name.

```js file=types/uuid.js
const UUID = /^[a-zA-Z\d]{8}-[a-zA-Z\d]{4}-[a-zA-Z\d]{4}-[a-zA-Z\d]{12}$/u;

export default parameter => UUID.test(parameter);
```

With the definition in place, to type a parameter, place a colon between its
name and type. The route file `/users/{userId:uuid}.js` will only accept routes
for which the `userId` parameter satifies the predicate specified in
`types/uuid.js`.

Like parameters themselves, types are case sensitive. `types/uuid.js`,
`types/UUID.js` and `types/Uuid.js` would all describe different types.

!!!
A type predicate function must return exactly `true` to pass the check. Primate
will not coerce the return value, treating any return value which is not `true`
as false.
!!!

Types allow for early validation before a route function is being executed.
For example, we could create a type called `userId` which makes sure a given
parameter `userId` belongs to an actual user in the database.

```js file=types/userId.js
import {UserStore} from "./database.js";

export default async id => (await UserStore.count({id})) > 0;
```

Accordingly, a parameter `me` could check if a user is permitted to edit his
own page.

Types can be used implicitly. If Primate comes across a parameter which is
identically named like a type, it will treat this parameter as if it were typed
accordingly. That is, if you have defined a type predicate `userId` (in
`types/userId.js`), you don't need to explicit write `{userId:userId}` in every
route that uses `userId` as a parameter. `{userId}` will implicitly use the
parameter of the same name.
