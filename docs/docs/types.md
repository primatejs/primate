# Types

On the web, values are inherently strings. Whether it's a URL's path, query
string parts, or the submitted fields of a form, everything boils down to
strings. When working on the backend with Primate, it is often important to
assert a runtime type concept, including a way to coerce strings into a given
type and validate that coerced values lie within an expected range or satisfy
other conditions.

!!!
Primate types aren't programming types in a real sense. Unlike static types,
they provide a form of runtime safety. You can think of them as coercive value
predicates; a `boolean` runtime type would consider both boolean `true` and
string `"true"` as true, which is what you would expect on the web.
!!!

## Defining

Types are defined in the `types` directory, unless specified
[elsewise](/guide/configuration#location-types) in the configuration. Type
filenames are alphanumeric and lowercase-first. Any files not starting with a
lowercase letter will be ignored.

Type files are described using an object containing a `base` (string) and a
`validate` (function) property.

Here is an example for a `number` type, a type that makes sure a string is
numeric and outputs its as a number.

```js#types/number.js
// `is` asserts invariants, `numeric` returns true if a string is numeric
import is from "@rcompat/invariant/is";
import numeric from "@rcompat/invariant/numeric";

export default {
  base: "f64",
  validate(value) {
    // make sure value is a string, otherwise throw
    is(value).string();

    const n = numeric(value) ? Number(value) : value;
    if (typeof n === "number") {
      return n;
    }
    throw new Error(`\`${value}\` is not a number`);
  },
};
```

If a string can be successfully converted to a number, a `number` type will
returned. Otherwise the `validate` function will throw.

!!!
Unlike the example, there is nothing stopping you from accepting other base
types like `number` or `bigint` as input, but your main input type will usually
be strings.
!!!

!!!
The `base` property is relevant when you use other languages aside from
JavaScript (like Go).
!!!

You can also create more elaborate types, like `uuid`.

```js#types/uuid.js
import is from "@rcompat/invariant/is";

const valid = /^[^\W_]{8}-[^\W_]{4}-[^\W_]{4}-[^\W_]{4}-[^\W_]{12}$/u;

export default {
  base: "string",
  validate(value) {
    // make sure value is a string, otherwise throw
    is(value).string();

    if (valid.test(value)) {
      return value;
    }
    throw new Error(`${value} is not a valid UUID`);
  },
};
```

The `uuid` type makes sure a string is a valid UUID. Here no type conversion is
necessary, as UUIDs are strings.

!!!
The `number` and `uuid` types are so common that they're included in a Primate
module, [`@primate/types`](/modules/types), alongside many other commonly used
types.
!!!

## Using

Primate types can be imported and used anywhere in your application to ensure
certain code invariants are met.

### Path parameters

In Primate's [filesystem-based routes](/guide/routes), path parameters may be
specified with types to ensure the path adheres to a certain format.

```js#routes/user/[user_id=uuid].js
export default {
  /*
    GET /user/b8c5b7b2-4f4c-4939-81d8-d1bdadd888c5
    -> "User ID is b8c5b7b2-4f4c-4939-81d8-d1bdadd888c5"

    GET /user/1
    -> Error
  */
  get(request) {
    const user_id = request.path.get("user_id");
    return `User ID is ${user_id}`;
  }
}
```

In the above example, using the `uuid` type we previously defined in `types`,
we make sure the route function is only executed if the `GET` request is to a
pathname starting with `user/` and followed by a valid UUID.
