# Types

On the web, values are inherently strings. Whether it's a URL's path, its
query string parameters, or the submitted fields of a form, everything boils
down to strings. When working on the backend with Primate, it is often imporant
to establish and assert a type concept, including a way to coerce strings into
a given type and validate that the coerced value lies within an expected range
or satisfies certain conditions.

!!!
Primate types aren't programming types in the true sense. They're much better
-- while they all translate to one of JavaScript's underlying types, they can
be thought of as value predicates with additional functionality; they are also
sometimes called `type validators` throughout this document.
!!!

## Defining

Types are defined in the `types` directory, unless specified
[elsewise](/guide/configuration#paths-types) in the configuration. Type
filenames are alphanumeric and lowercase-first -- any files not starting with a 
lowercase letter will be ignored by Primate.

Type files must export a function as their default export, and Primate will
refuse to start if it detects a type that's not a function.

Here is an example for a `number` type, a type that makes sure a string is
convertible to a number.

```js caption=types/number.js
import {is} from "runtime-compat/dyndef";

const numeric = n => !Number.isNaN(Number.parseFloat(n)) && Number.isFinite(n);

export default value => {
  is(value).string();
  try {
    return numeric(value) && Number(value);
  } catch() {
    throw new Error(`${value} is not a number`);
  }
}
```

If a string can be successfully converted to a number, a `number` type will
returned. Otherwise the type function will throw.

!!!
There is nothing stopping you from accepting other base types like `number` or
`bigint` as input, but your main input type will usually be strings.
!!!

You can also create more elaborate types, like `uuid`.

```js caption=types/uuid.js
import {is} from "runtime-compat/dyndef";
import crypto from "runtime-compat/crypto";

const valid = /^[^\W_]{8}-[^\W_]{4}-[^\W_]{4}-[^\W_]{4}-[^\W_]{12}$/u;

export default value => {
  is(value).string();
  if (valid(value)) {
    return value;
  }
  throw new Error(`${value} is not a valid UUID`);
};
```

The `uuid` type makes sure a string is a valid UUID.

!!!
The `number` and `uuid` types are so common that they're included in a Primate
module, [`@primate/types`](/modules/types), alongside many other commonly used
types.
!!!

## Using

Primate types can be imported and used anywhere in your application to ensure
certain code invariants are met. In addition, many of Primate's built-in
functionalities integrate seamlessly with the types you define.

### Path parameters

In Primate's [filesystem-based routing](/guide/routing), path parameters may be
additionally specified with types to ensure the path adheres to a certain
format.

```js caption=user/{userId:uuid}.js | typed path
export default {
  /*
    GET /user/b8c5b7b2-4f4c-4939-81d8-d1bdadd888c5
    -> "User ID is b8c5b7b2-4f4c-4939-81d8-d1bdadd888c5"

    GET /user/1
    -> Error
  */
  get(request) {
    const {userId} = request.path.get();
    return `User ID is ${userId}`;
  }
}
```

In the above example, using the `uuid` type we previously defined in `types`,
we make sure the route function is only executed if the `GET` request is to a
pathname starting with `user/` and followed by a valid UUID.

Parameters named in the same way as types will be automatically typed. Assume
that we created the following `userId` type that makes sure a database user
exists with the given type.

```js caption=types/userId.js
const users = [
  {
    name: "Donald",
  },
];

export default id => {
  const user = users[id];
  if (user) {
    return user;
  }
  throw new Error(`${id} is not a valid user ID`);
}
```

With that definition, using `{userId}` in any route will autotype it to the
`userId` type.

```js caption=user/{userId}.js | autotyped path
export default {
  get(request) {
    /*
      GET /user/0
      -> `{name: "Donald"}`

      GET /user/1
      -> Error
    */
    const id = request.path.get("userId");
    return `User ID is ${id}`;
  }
}
```

Here, we avoided typing out the route as `user/{userId:userId}.js` and relied
on Primate to match the type to the parameter name. In this case, `GET /user/1`
cannot be matched to a route, as `1` is not an ID of a user in our dataset.

!!!
If you do not wish Primate to automatically type your path parameters, set
`types.explicit` to `true` in your configuration.
!!!

### Request query

Likewise, the request's query string parts, which we previously accessed using
`request.query.get()`, may be typed to ensure adherence to a given format. This
can be achieved manually by importing the type function.

```js caption=user.js | typed query (manually)
import userId from "../types/userId.js";

export default {
  /*
    GET /user?userId=0
    -> `{name: "Donald"}`

    GET /user?userId=1
    -> Error
  */
  get(request) {
    const id = userId(request.query.get("userId"));
    return `User ID is ${id}`;
  }
}
```

This is generally OK, but as routes may arbitrarily nested, it can make
importing from relative paths hard. For that, Primate enhances the `query`
object with functions for dispatching a property's value to the type validator.

```js caption=user.js | typed query (using dispatchers)
export default {
  /*
    GET /user?userId=0
    -> `{name: "Donald"}`

    GET /user?userId=1
    -> Error
  */
  get(request) {
    const id = request.query.userId("userId");
    return `User ID is ${id}`;
  }
}
```

In this case, Primate adds defined types as dispatcher functions of the
`request.query` object, in addition to the `get()` function which allows direct
access to the query string parts. As there is no user in our dataset ID `1`, if
a client tries to access `GET /user?userId=1`, the route will throw and it will
be redirected to an error page.

!!!
As `get` is already defined on `request.query`, it is considered a reserved
keyword -- Primate will refuse to start if you try to define a type with this
name.
!!!

### Headers and cookies

In identical fashion to the request query, you can make sure certain headers or
cookies follow a given format, by retrieving them using the appropriate type
function.

```js caption=user.js | typed headers
export default {
  /*
    GET /user
    X-User-Id: 0
    -> `{name: "Donald"}`

    GET /user
    X-User-Id: 1
    -> Error
  */
  get(request) {
    const userId = request.headers.userId("X-User-Id");
    return `User ID is ${userId}`;
  }
}
```

```js caption=user.js | typed cookies
export default {
  /*
    GET /user
    Cookie: userId=0
    -> `{name: "Donald"}`

    GET /user
    Cookie: userId=1
    -> Error
  */
  get(request) {
    const userId = request.cookies.userId("userId");
    return `User ID is ${userId}`;
  }
}
```

## Related modules

Primate's ecosystem extends the concept of types by providing many defaults
and integrating with database types.

### Types

Most of the time you won't need to define your own types unless you have very
specific use cases. Primate's [Types module](/modules/types) comes with a
handful of common types such as `string`, `number`, `uuid`, `isodate`,
containing over 20 different types. By importing and loading this module, its
types will be injected and available wherever types are used.

### Store

The Primate [Store module](/modules/store), used for data persistance, also
integrates with Primate's type concept and extends upon it. It is highly
recommended to use it in conjuction with the Types module.
