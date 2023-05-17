# Data store

The data store module adds transactionalized data persistance to your
application as part of your routes, backed up by different database systems.

In Primate, the term `store` represents tables in classical RDBMS (such as
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

!!!
It is highly recommended to install and load [`@primate/types`](/modules/types)
alongside this module. This page assumes the Types module has been loaded.
!!!

## Quick start

### Install

`npm i @primate/store`

### Load

Import and initialize the module in your configuration.

```js caption=primate.config.js
import types from "@primate/types";
import store from "@primate/store";

export default {
  modules: [types(), store()],
};
```

By default the module uses an in-memory driver which persists the data only as
long as the application runs. Alternatively you can use the JSON driver which
persists onto a file.

```js caption=primate.config.js | using the JSON driver
import types from "@primate/types";
import {default as store, json} from "@primate/store";

export default {
  modules: [types(), store({driver: json({path: "/tmp/db.json"})})],
};
```

The JSON driver accepts a configuration object with the `path` property to
indicate in which file the data will be managed. This file doesn't have to
exist and will be created for you if it doesn't, but you must have permissions
to write to the path.

### Use

Create the different stores of your application and their fields in the
`stores` directory. A field consists of a name and a type, denoting the
range of values this field may hold. We here define a `User` store representing
a user of our application.

```js caption=stores/User.js
import {id, string, u8, email} from "primate/@types";

export default {
  id,
  name: string,
  age: u8,
  email,
}
```

Adding that store definition to `stores` makes the `User` store available to
every route.

```js caption=routes/user/all.js
export default {
  get(request) {
    const {User} = request.store;
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
`stores/Comment.js` and `stores/Post/Comment.js` describe different stores.
Directories must also start with a capital letter and will be otherwise
ignored.

```js caption=stores/Comment.js
/* this store will be available as `request.store.Comment` in routes */
import {id, string} from "primate/@types";

export default {
  id,
  text: string,
};
```

```js caption=stores/Post/Comment.js
/* this store will be available as `request.store.Post.Comment` in routes */
import {id, string} from "primate/@types";

export default {
  id,
  text: string,
};
```

### Schema

A store's default export is its schema, containing its field names and types.
The objects you use for types will be automatically mapped by the driver into
the appropriate database types.

```js caption=store/User.js
import {id, string, u8, array} from "primate/@types";

export default {
  id,
  name: string.between(0, 20),
  age: u8.range(0, 120),
  hobbies: array.of(string),
};
```

!!!
If you define your database field `user.age` as a string (for example,
`varchar` in PostGreSQL) and use the above store definition, Primate will
attempt to unpack the value into a JavaScript number that is between 0 and 120.
In case it fails (because you have something like "thirty-two" in this field),
Primate will throw a
[`CannotUnpackValue`](/reference/errors/primate/store#cannot-unpack-value)
error and roll back the transaction.
!!!

Types are not only used for mapping to database fields, but also for validating
data before saving it. One of the store actions you can use in routes is
`validate`, which allows you to check that a document is valid before
saving it.

```js caption=routes/create-user.js | POST /create-user
export default {
  post(request) {
    /* prepare a user */
    const user = {
      name: "Donald",
      age: 32,
      hobbies: ["Fishing"],
    };

    /* get the User store */
    const {User} = request.store;

    /* save if valid */
    if (await User.validate(user)) {
      await User.insert(user);
    };
  }
}
```

!!!
You may have noticed that the document passed validation despite `id` being
unset. This is because unless configured otherwise, stores permit empty field
values. Additionally, `id` is taken to be the primary field, which is
automatically generated on an insert. Had we tried to `update`, Primate would
have thrown an error.
!!!

Using type functions is implicit validation. Primate also supports explicit
validation by passing in an object that contains at the least a `validate`
property.

```js
import {id, u8, array} from "primate/@types"

const between = ({length}, min, max) => length >= min && length <= max;

export default {
  id,
  name: {
    validate: value => typeof value === "string" && between(value, 2, 20),
    message: "Must be 2 to 20 characters in length",
    base: "string",
  },
  age: u8.range(0, 120),
  hobbies: array.of(string),
};
```

When trying to validate the `name` field, Primate will run the `validate`
predicate function and use its output to determine if the field has passed
validation. In case of failure, it would show the specified message. For saving
this field into the database, it will use the driver's base type `"string"`.

### Strict

By default, fields aren't required to be non-empty (not `undefined` or `null`)
to save a new document into the document. If you wish to strictly enforce all
fields to be non-empty, export `strict = true`.

```js caption=stores/Comment.js | opting-in into strict validation
import {id, string} from "primate/@types";

export const strict = true;

export default {
  id,
  text: string,
};
```

You can also globally enforce strictness for all stores by configuring this
module with `strict: true`. In that case, you can opt-out on individual store
level by exporting `strict = false`.

```js caption=primate.config.js | enforcing strictness for all stores
import store from "@primate/store";

export default {
  modules: [store({strict: true})],
};
```

```js caption=stores/Comment.js | opting-out of strict validation
import {id, string} from "primate/@types";

export const strict = false;

export default {
  id,
  text: string,
};
```

### Name

The filenames you give to store files affect to which underlying store they are
mapped. `stores/Comment.js` will be mapped to `comment`, while
`stores/Post/Comment.js` will be mapped to `post_comment`. You can override
this behavior by exporting a `name`, allowing you to map several store files to
the same database store.

```js caption=stores/Post/Comment.js | overriding name
import {id, string} from "primate/@types";

/* would use `post_comment` if not overriden */
export const name = "comment";

export default {
  id,
  text: string,
};
```

### Driver

Unless specified elsewise, stores use the driver specified when loading the
module (which defaults to the in-memory driver). A store can override this
default by exporting a `driver`.

```js caption=stores/Comment.js | overriding driver
import {id, string} from "primate/@types";
import mongodb from "@primate/mongodb";

export const driver = mongodb();

export default {
  id,
  text: string,
};
```

If you need to share the same alternative driver across several stores, we
recommend initializing it in a separate file (lowercase-first files in the
`stores` directory are ignored by Primate) and importing the driver as needed.

```js caption=stores/mongodb.js
import mongodb from "@primate/mongodb";

export default mongodb();
```

```js caption=stores/Post.js | sharing overridden driver
import {id, string} from "primate/@types";

export {default as driver} from "./mongodb.js";

export default {
  id,
  title: string,
  text: string
};
```

```js caption=stores/Comment.js | sharing overriden driver
import {id, string} from "primate/@types";

export {default as driver} from "./mongodb.js";

export default {
  id,
  text: string,
};
```

### Primary

By default, Primate assumes every store has a primary field called `id`.
Some drivers such as MongoDB have different conventions on the naming of
primary fields, like `_id`. To reflect that, use the `primary` export to
override the primary field's name for the given store.

```js caption=stores/Comment.js | overriding name of primary field
import {id, string} from "@primate/types";
import mongodb from "@primate/mongodb";

export const driver = mongodb();

export const primary = "_id";

export default {
  [primary]: id,
  text: string,
};
```

You can also globally change the primary field for all stores by configuring
this module with a different value for `primary`. This is useful if you're
using drivers like MongoDB across the board.

```js caption=primate.config.js | changing the primary field for all stores
import store from "@primate/store";
import mongodb from "@primate/mongodb";

export default {
  modules: [store({driver: mongodb(), primary: "_id"})],
};
```

### Ambiguous

Many database systems rely on the existence of a primary field for indexing.
This module, too, uses the primary field automatically for a store's `get`
operation. If you create a store without a primary key, Primate will complain.

```js caption=stores/Comment.js | missing primary key
import {string} from "@primate/types";

export default {
  text: string,
};
```

If you run your Primate app with such a store in your `stores` directory,
Primate will show a
[`MissingPrimaryKey`](/reference/errors/primate/store#missing-primary-key)
warning.

If this ambiguity is intended, export `ambiguous = true` in your store.

```js caption=stores/Comment.js | ambiguous store
import {string} from "@primate/types";

export const ambiguous = true;

export default {
  text: string,
};
```

!!!
As noted, Primate relies on the primary field for the `get` operation. For
stores that export `ambiguous = true`, using this operation will always throw.
!!!


## Store actions

## Fields and predicates

## Configuration options

### directory

Default `"stores"`

The directory where stores are located. If specified as a relative path, will
be relative to project root.

### driver

Default [`memory`][memory] (volatile in-memory driver)

The database driver used to persist data. This module also exports `json` as a
non-volatile alternative driver which stores its data in a JSON file. Other
supported DMBSs are [MongoDB](/modules/mongodb),
[PostgreSQL](/modules/postgresql) and [SQLite](/modules/sqlite).

### primary

Default `"id"`

Name of the primary field in every store. Stores can deviate from this
default by exporting a different value for `primary`. Assuming that all stores
in your application use the JSON store and the default `"id"` for value for the
primary field, and that you want to add a single store using MongoDB with `_id`
used as the primary field, you would use the following.

```js caption=stores/User.js (using different primary field for a store)
import {id, string} from "@primate/types";
import mongodb from "@primate/mongodb";

export const driver = mongodb();

export const primary = "_id";

export default {
   [primary]: id,
   username: string,
};
```

Primary fields have a special meaning in many database systems. They are often
unique and indexed. In Primate specifically, the store `get` operation uses the
primary field.

### strict

Default `false`

Whether all store fields must be non-empty before saving. In many cases, you
want some values to be nullable. Setting this to `true` forbids any store from
saving empty values to the database, unless it has overridden that value by
using `export const strict = false;`.

## Resources

* [Repository](https://github.com/primatejs/primate/tree/master/packages/store)
* [Error list](/reference/errors/primate/store)

[memory]: https://github.com/primatejs/primate/blob/master/packages/store/src/drivers/memory.js
