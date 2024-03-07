# Data store

!!!
This page assumes you have read the guide, specifically the section about
[types](/guide/types).
!!!

This module adds transactionalized data persistence to your application as part
of your routes, backed up by different database systems.

In Primate, the term `store` represents tables in classic RDBMS (such as
PostgreSQL) or collections in NoSQL databases (such as MongoDB). Stores are
described by a `schema`. A single row or record in a database is a `document`,
and a single property of such a document is a `field`. The underlying database
system of a given store is referred to as `driver`.

```sh caption=Primate data terminology
`store` # aggregation of similar entities
├─ described by `schema` # entity structure
├─ contains `document` # single entity
│  └─ has `field` # single property
└─ backed up by `driver` # underlying database system
```

## Quick start

### Install

`npm install @primate/store`

### Load

Import and initialize the module in your configuration.

```js caption=primate.config.js
import store from "@primate/store";

export default {
  modules: [
    store(),
  ],
};
```

By default the module uses an [in-memory][in-memory] driver which keeps the
data only as long as the application runs. Alternatively you can use the
[JSON file][json-file] driver which persists onto a file.

```js caption=primate.config.js
import { default as store, json } from "@primate/store";

export default {
  modules: [
    store({
      driver: json({
        filename: "/tmp/db.json",
      }),
    }),
  ],
};
```

### Use

Create the different stores for your application and their fields in the
`stores` directory. A field consists of a name and a type, denoting the
range of values this field may hold. We here define a `User` store representing
a user of our application.

```js caption=stores/User.js
import { primary, string, u8, email, date } from "primate/@types";

export default {
  id: primary,
  name: string,
  age: u8,
  email,
  created: date,
};
```

Adding that store definition to `stores` makes the `User` store available to
every route.

```js caption=routes/user/all.js
export default {
  get(request) {
    const { User } = request.store;
    return User.find();
  },
};
```

Assuming we have data in the `user` store, requesting the route `/user/all`
will return a JSON array of users.

## Defining stores

Unless you [configure this module](#configuration-options) elsewise, all store
definitions are loaded from the `stores` directory. Store files must start with
a capital letter; any other JavaScript files will be ignored. You may
arbitrarily nest store files using directories, creating namespaces:
`stores/Comment.js` and `stores/post/Comment.js` describe different stores.
Directories must start with a lowercase letter and will be otherwise ignored.

```js caption=stores/Comment.js
// this store will be available as `request.store.Comment` in routes
import { primary, string } from "primate/@types";

export default {
  id: primary,
  text: string,
};
```

```js caption=stores/post/Comment.js
// this store will be available as `request.store.post.Comment` in routes
import { primary, string } from "primate/@types";

export default {
  id: primary,
  text: string,
};
```

### Schema

A store's default export is its schema, containing its field names and types.
The objects you use for types will be automatically mapped by the driver into
the appropriate database types.

```js caption=store/User.js
import { id, string, u8, array } from "primate/@types";

export default {
  id,
  name: string.between(0, 20),
  age: u8.range(0, 120),
  hobbies: array.of(string),
};
```

!!!
If you define your database field `user.age` as a string (for example, `text`
in PostgreSQL) and use the above store definition, Primate will attempt to
unpack the value into a JavaScript number that is between 0 and 120. In case it
fails (because you have something like "thirty-two" in this field), it will
throw a
[`CannotUnpackValue`](/reference/errors/primate/store#cannot-unpack-value)
error and roll back the transaction.
!!!

Types are not only used for mapping to database fields, but also for validating
data before saving it. One of the store actions you can use in routes is
`validate`, which allows you to check that a document is valid before
saving it. Normally though, you wouldn't call `validate` directly but have
`insert` or `update` call it for you.

```js caption=routes/create-user.js
import { redirect } from "primate";

export default {
  post(request) {
    // prepare a user, normally this data would come from a form
    const user = {
      name: "Donald",
      age: 32,
      hobbies: ["Fishing"],
    };

    // get the User store
    const { User } = request.store;

    // save if valid
    try {
      const { id } = await User.insert(user);
      return redirect(`/user/${id}`);
    } catch (error) {
      // return validation errors as JSON to the client
      return error.errors;
    }
  }
}
```

!!!
You may have noticed that the document passed validation despite `id` being
unset. This is because unless configured otherwise, stores permit empty field
values. Additionally, `id` is taken to be the primary field, which is
automatically generated on an insert.
!!!

In addition to using type functions, Primate supports using an object with a
`validate` function property for validation.

```js caption=stores/User.js
import { primary, u8, array } from "primate/@types"

const between = ({ length }, min, max) => length >= min && length <= max;

export default {
  id: primary,
  name: {
    validate(value) {
      if (typeof value === "string" && between(value, 2, 20)) {
        return value;
      }
      throw new Error(`${value} must be 2 to 20 characters in length`);
    }
    base: "string",
  },
  age: u8.range(0, 120),
  hobbies: array.of(string),
};
```

When trying to validate the `name` field, Primate will run the `validate`
function to determine if the field has passed validation. In case of failure,
it would stop the execution of the route function with the given error. For
saving this field into the database, it will use the driver's base type
`"string"`.

### Strict

By default, fields aren't required to be non-empty (`undefined` or `null`)
to save a new document into the store. If you wish to strictly enforce all
fields to be non-empty, export `mode = "strict"`.

```js caption=stores/Comment.js
import { primary, string } from "primate/@types";

export const mode = "strict";

export default {
  id: primary,
  text: string,
};
```

You can also globally enforce strictness for all stores by configuring this
module with `mode: "strict"`.

```js caption=primate.config.js
import store from "@primate/store";

export default {
  modules: [
    store({
      mode: "strict",
    }),
  ],
};
```
In that case, you can opt-out on individual store level by exporting
`mode = "loose"`.

```js caption=stores/Comment.js
import { primary, string } from "@primate/types";

export const mode = "loose";

export default {
  id: primary,
  text: string,
};
```

!!!
The store module treats `undefined` and `null` differently on updates. When
updating a document, `undefined` means you want to leave the field's value as
is, while `null` nullifies the field.
!!!

### Name

The filenames you give to store files affect to which underlying store they are
mapped. `stores/Comment.js` will be mapped to `comment`, while
`stores/Post/Comment.js` will be mapped to `post_comment`. You can override
this behavior by exporting a `name`, allowing you to map several store files to
the same database store.

```js caption=stores/Post/Comment.js
import { primary, string } from "@primate/types";

// would use `post_comment` if not overriden
export const name = "comment";

export default {
  id: primary,
  text: string,
};
```

### Driver

Unless specified elsewise, stores use the driver specified when loading the
module (which defaults to the in-memory driver). A store can override this
default by exporting a `driver`.

```js caption=stores/Comment.js
import { primary, string } from "@primate/types";
import { mongodb } from "@primate/store";

export const driver = mongodb();

export default {
  id: primary,
  text: string,
};
```

If you need to share the same alternative driver across several stores, we
recommend initializing it in a separate file (lowercase-first files in the
`stores` directory are ignored by Primate).

```js caption=stores/mongodb.js
import { mongodb } from "@primate/store";

export default mongodb();
```

You can then import and reexport the driver as needed across files.

```js caption=stores/Post.js
import { primary, string } from "@primate/types";

export { default as driver } from "./mongodb.js";

export default {
  id: primary,
  title: string,
  text: string
};
```

```js caption=stores/Comment.js
import { primary, string } from "@primate/types";

export { default as driver } from "./mongodb.js";

export default {
  id: primary,
  text: string,
};
```

### Ambiguous

Many database systems rely on the existence of a primary `id` field for
indexing. This module, too, uses the primary field automatically for a store's
`get` operation. If you create a store without a primary key, Primate will
complain.

```js caption=stores/Comment.js
import { string } from "@primate/types";

export default {
  text: string,
};
```

If you run your app with a store thus configured, Primate will show a
[`MissingPrimaryKey`](/reference/errors/primate/store#missing-primary-key)
warning.

If this ambiguity is intentional, export `ambiguous = true` in your store.

```js caption=stores/Comment.js
import { string } from "@primate/types";

export const ambiguous = true;

export default {
  text: string,
};
```

!!!
As noted, Primate relies on the primary field for the `get` operation. For
stores that export `ambiguous = true`, this action will always throw.
!!!

## Store actions

If the default store actions `get`, `count`, `find`, `exists`, `insert`,
`update`, `save`, `delete` aren't powerful enough for you, you can access the
underlying driver and the store itself to create your own actions. To do so,
export `actions` as an object containing individual, additional actions.

```js caption=store/User.js
import { id, string, u8, array } from "primate/@types";

export const actions = store => {
  return {
    findByHobbies(hobbies) {
      return store.find({ hobbies });
    },
  };
};

export default {
  id,
  name: string.between(0, 20),
  age: u8.range(0, 120),
  hobbies: array.of(string),
};
```

The first argument of the function that `actions` returns, `client`, represents
a client of the underlying driver package itself. For example, if you're using
the SQLite driver, which uses the `better-sqlite3` package, you'd be getting a
client that's been initialized using the following code:

```js
import Database from "better-sqlite3";
const client = new Database(filename);
```

Where `filename` is the filename property you supplied when initializing the
SQLite driver module.

While using the underlying driver directly can be useful in specialized cases,
most of the time you would want to stick to the Primate store action
primitives. The second argument of the `actions` function, `store`, gives you
access to all base actions of the Primate store that you can otherwise use
in your routes, allowing you to create tailored actions.

Thus defined, the `findByHobbies` action will be available at
`request.store.user.findByHobbies`, in all routes.

## Configuration options

### directory

Default `"stores"`

The directory where stores are located. If specified as a relative path, will
be relative to project root.

### driver

Default [`memory`][memory] (volatile in-memory driver)

The database driver used to persist data. This module also exports `json` as a
non-volatile alternative driver which stores its data in a JSON file. Other
supported DMBSs are [MongoDB][mongodb],[PostgreSQL][postgresql], [MySQL][mysql]
and [SQLite][sqlite].

### mode

Default `"loose"`

Whether all store fields must be non-empty before saving. In many cases, you
want some values to be nullable. Setting this to `"strict"` forbids any store
from saving empty values to the database, unless it has overridden that value
by using `export const mode = "strict";`.

In addition, `loose` allows you to save to fields that haven't been explicitly
declared in your store definition. This is particulary useful for NoSQL
databases that do not a rigid schema, where you want to enforce types on some
fields and accept anything in others.

!!!
For SQL databases, we will add the ability in the future to declare a catchall
JSON column that would serve the same purpose.
!!!

## Error list

### Empty Store Directory

Level [`Warn`][warn]

The `stores` directory is empty, module is disabled.

*Populate this directory with stores.*

### Cannot Unpack Value

Level [`Error`][error]

Tried to unpack a database value which did not fit into the specified type.

*Change type for field or correct data in database.*

### Invalid Type

Level [`Error`][error] | [`Bailout`][bailout]

A field has an invalid type. Types must be functions or objects with a `type`
property, itself a function.

*Use a valid type.*

### Missing Dependencies

Level [`Error`][error] | [`Bailout`][bailout]

A store module was loaded in the configuration for which dependencies are
missing.

*Install the dependency according to the instructions in the error message.*

The store module only provides wrappers for data store drivers. The actual
package needs to be installed by the user. Primate will inform you which
dependency is missing and what command you need to issue to install it.

[bailout]: /guide/logging#bailout

### Missing Primary Key

Level [`Error`][error] | [`Bailout`][bailout]

A store is missing a primary key. Most stores need a primary key to distinguish
documents. In other cases an opt-out is available.

*Add a primary key field to store or export `const ambiguous = true;`.*

### Missing Store Directory

Level [`Warn`][warn]

The `stores` directory is missing, module is disabled.

*Create this directory and populate it with stores.*

### No Document Found

Level [`Warn`][warn]

No document found with the primary key, using the store's `get` operation. This
operation either returns an object or throws, leading to a route's execution
halt.

*Check for existence with the store's `exists(id)` operation first.*

### Transaction Rolled Back

Level [`Warn`][warn]

Transaction rolled back due to previous error.

*Address previous errors.*

## Resources

* [Repository][repo]
* [Error list](/reference/errors/primate/store)

[repo]: https://github.com/primatejs/primate/tree/master/packages/store
[memory]: https://github.com/primatejs/primate/blob/master/packages/store/src/drivers/memory.js
[in-memory]: /modules/drivers#in-memory
[json-file]: /modules/drivers#json-file
[MongoDB]: /modules/drivers#mongodb
[PostgreSQL]: /modules/drivers#postgresql
[MySQL]: /modules/drivers#mysql
[SQLite]: /modules/drivers#sqlite
[error]: /guide/logging#error
[bailout]: /guide/logging#bailout
[warn]: /guide/logging#warn
