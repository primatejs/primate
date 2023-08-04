# Data store drivers

The store module comes with different driver wrappers, with a variety ranging
between in-memory, volatile storage to cloud-based storage with SurrealDB.

Regardless of what driver you decide to use, the store actions are all the
same. The `@primate/store` module will map these store actions to underlying
driver calls and the runtime types used in your stores to the best approximated
field type used by the driver.

## In-memory

The in-memory store driver is the default driver, used by `store` unless you
specify an alternate one using the `driver` property.

```js caption=primate.config.js
import store from "@primate/store";

export default {
  modules: [
     // if `driver` isn't specified, use the in-memory driver
     store(),
  ],
};
```

This driver requires no DBMS to be installed and is by its nature volatile --
its contents only exist in memory during the lifetime of the app run. It's a 
good fit if you want to quickly prototype your data stores, but you will most 
likely want to switch to persistent storage later on.

## JSON file

The JSON file driver stores all data in JSON file on the filesystem. It accepts
a configuration object with the `filename` property to indicate in which file
the data will be managed. This file doesn't have to exist and will be created
for you if it doesn't, but you must have permissions to write to it.

```js caption=primate.config.js
import {default as store, json} from "@primate/store";

export default {
  modules: [
     store({
       // use the JSON file driver, store at the data /tmp/data.json
       driver: json({
         filename: "/tmp/data.json",
       )},
    }),
  ],
};
```

## SQLite

The SQLite driver uses the `better-sqlite3` package for its underlying driver
calls. Install this package with `npm install better-sqlite3` before you
proceed to use this driver.

Similarly to the JSON file driver, the SQLite driver uses the `filename`
property to indicate which file to manage the data in. If unset, it will
default to `":memory:"`, using SQLite in-memory, volatile database.

```js caption=primate.config.js
import {default as store, sqlite} from "@primate/store";

export default {
  modules: [
     store({
       // use the SQLite driver, store at the data /tmp/data.db
       driver: sqlite({
         filename: "/tmp/data.db",
       )},
    }),
  ],
};
```

## MongoDB

!!!
This driver does not yet support automatic transaction rollback.
!!!

The MongoDB driver uses the `mongodb` package for its underlying driver.
Install this package with `npm install mongodb` before you proceed to use this
driver. In addition, it requires running MongoDB server, either locally or
remotely. Visit the MongoDB website or consult your operating system's manuals
on how to install and run a server.

This driver uses the `host` (default `"localhost"`), `port` (default `27017`)
and `db` configuration properties.

```js caption=primate.config.js
import {default as store, mongodb} from "@primate/store";

export default {
  modules: [
     store({
       // use the MongoDB server at localhost:27017 and the "app" database
       driver: mongodb({
         // if "localhost", can be omitted
         host: "localhost",
         // if 27017, can be omitted
         port: 27017,
         db: "app",
       )},
    }),
  ],
};
```

## PostgreSQL

!!!
This driver does not yet support automatic transaction rollback.
!!!

The PostgreSQL driver uses the `postgres` package for its underlying driver.
Install this package with `npm install postgres` before you proceed to use this
driver. In addition, it requires running a PostgreSQL server, either locally or
remotely. Visit the PostgreSQL website or consult your operating system's
manuals on how to install and run a server.

This driver uses the `host` (default `"localhost"`), `port` (default `5432`)
`db`, `user`, and `pass` configuration properties.

```js caption=primate.config.js
import {default as store, postgresql} from "@primate/store";

export default {
  modules: [
     store({
       // use the PostgreSQL server at localhost:5432 and the "app" database
       driver: mongodb({
         // if "localhost", can be omitted
         host: "localhost",
         // if 5432, can be omitted
         port: 5432,
         db: "app",
         user: "username",
         pass: "password",
       )},
    }),
  ],
};
```

## SurrealDB

!!!
This driver does not yet support automatic transaction rollback.
!!!

The SurrealDB driver uses the `surrealdb.js` package for its underlying driver.
Install this package with `npm install surrealdb.js` before you proceed to use 
this driver. In addition, it requires running a SurrealDB server, either locally
or remotely. Visit the SurrealDB website or consult your operating system's
manuals on how to install and run a server.

This driver uses the `host` (default `"http://localhost"`), `port` (default
`8000`), `path`  (default: "`rpc`"), `ns` (default: `"default"`), `db`
`user`, and `pass` configuration properties.

```js caption=primate.config.js
import {default as store, surrealdb} from "@primate/store";

export default {
  modules: [
     store({
       // use the SurrealDB server at http://localhost:8000/rpc, the "default"
       // namespace and the "app" database
       driver: mongodb({
         // if "http://localhost", can be omitted
         host: "http://localhost",
         // if 8000, can be omitted
         port: 800,
         // if "rpc", can be omitted
         path: "rpc",
         // if "default", can be omitted,
         ns: "default",
         db: "app",
         user: "username",
         pass: "password",
       )},
    }),
  ],
};
```
