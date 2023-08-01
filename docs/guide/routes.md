# Routes

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
* `user/{userId=uuid}.js` is mapped to a
[route with typed parameters][types] route where `userId` is of the type `uuid`,
for example `/user/f6a3fac2-7c1d-432d-9e1c-68d0db925adc` (but not `/user/1`)

## HTTP verbs

Every route file exports an object containing one or many HTTP verb functions.

```js caption=routes/user/profile.js
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

Route verb functions accept a single parameter representing request data. This
aggregate object allows easy access to the request `body`, any `path`
parameters defined with braces, the `query` string split into parts, `cookies`
as well as other `headers` and a reference to the `original` WHATWG Request 
object. The aggregate nature of this object allows you to pull in what you need
using object destructuring.

### body

The request body. For requests that have no body (such as GET requests) it
defaults to `null`.

```js caption=routes/your-name.js
export default {
  post(request) {
    const body = request.body.get();

    return `Hello, ${body}`;
  },
}
```

If a client sends a POST request to `/your-name` with `text/plain` "Donald" as
body, this route will respond with 200 saying `Hello, Donald`.

Primate will attempt to decode the body according to the `Content-Type` header
used in the request.

* `application/x-www-form-urlencoded`, which is primarily used in HTML forms,
decodes the form fields into object properties
* `application/json` will decode the given JSON string using `JSON.parse`

```js caption=routes/your-full-name.js
export default {
  post(request) {
    const {name} = request.body.get();

    if (name === undefined) {
      return "You haven't specified your name";
    }

    return `Hello, ${name}`;
  }
}
```

In this example, if a client sends a request to `/your-full-name` with a
URL-encoded form (`application/x-www-form-urlencoded`) or JSON data
(`application/json`) with a field `name` in its body, Primate will respond by
saying Hello and the provided name.

!!!
The `get` function on `request.body` can be used in two ways. If called without
parameters, it will return the underlying object, which we can then destructure
into its properties as in the example. It's also possible to call it with the
name of a property to retrieve it directly.

```js
const name = request.body.get("name");
```

This applies not only to `body` but to all of the following request sections.
!!!

### path

The request's path, an object containing named parameters.

```js caption=routes/users/{user}.js
import {error} from "primate";

const users = ["Donald", "Ryan"];

export default {
  post(request) {
    const {user} = request.path.get();

    if (users.includes(user)) {
      return `Hello, ${user}`;
    }

    return error("Unknown user");
  },
};
```

If a user requests POST `/users/Donald` or `/users/Ryan`, Primate will respond
with `200`, saying Hello. It will otherwise reply with `404` saying Unknown
user.

We will later handle [routes with parameters](#parameters) in depth.

### query

The request's query string, broken down into its constituent parts.

```js caption=routes/users.js
import {error} from "primate";

const users = ["Donald", "Ryan"];

export default {
  post(request) {
    const {user} = request.query.get();

    if (users.includes(user)) {
      return `Hello, ${user}`;
    }

    return error("Unknown user");
  },
};
```

If a user requests POST `/users?user=Donald` or `/users?user=Ryan`, Primate
will respond with `200`, otherwise with `404`.

### cookies

The request's `Cookie` header, broken down into individual cookies.

```js caption=routes/current-user.js
import {error} from "primate";

const users = ["Donald", "Ryan"];

export default {
  post(request) {
    const {user} = request.cookies.get();

    if (users.includes(user)) {
      return `Hello, ${user}`;
    }

    return error("Unknown user");
  },
};
```

If a user requests POST `/current-user` with the `Cookie` header set to
`user=Donald` or `user=Ryan`, Primate will respond with `200`, otherwise with
`404`.

### headers

The request's individual headers.

```js caption=routes/current-x-user.js
import {error} from "primate";

const users = ["Donald", "Ryan"];

export default {
  post(request) {
    const user = request.headers.get("X-User");

    if (users.includes(user)) {
      return `Hello, ${user}`;
    }

    return error("Unknown user");
  },
};
```

If a user requests POST `/current-x-user` with a `X-User` header set to
`Donald` or `Ryan`, Primate will respond with `200`, otherwise with `404`.

### original

The `original` property of the request object provides access to the original
WHATWG Request object.

## Parameters

Route paths may contain parameters in braces, which indicate they will be
mapped to `request.path`. Path parameter names are case sensitive, and a
request may contain any number of them, though it must not contain the same
parameter in the same case twice. They must be non-empty, that is matched by
at least one character.

By default, parameters will match anything in the path except `/`, though they
are not greedy. A path like `/users/{userId}a.js` is unambiguous: it will match
any path that starts with `/users/` followed by anything that is not `/`,
provided that it ends with `a`. The last `a` can therefore not be part of
the match.

Such a path will thus be matched by all the following requests.

* `/users/1a`
* `/users/aa`
* `/users/ba?key=value`
* `/users//a` (repeated `/` are only processed ones)

The same path won't be matched by any of the following requests.

* `/user/1a` (does not begin with `/users`)
* `/users/a` (must match at least one character)
* `/users/aA` (paths are case-sensitive, path does not end with `a`)
* `/users/?a` (`?` denotes end of path)

Parameters can be also typed, in which case their value can be restricted.
The types section elaborates on the use of [types in path parameters][types].


[types]: /guide/types#path-parameters
