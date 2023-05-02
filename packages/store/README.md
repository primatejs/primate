# Primate Data Domains

Domains add a layer of persistance to Primate. They are backed by data stores 
with the default being a transient in-memory store. Additional stores exist for
filesystem (flat), JSON, and MongoDb.

## Fields

A record in the domain's store is described using the static `fields` property.

```js
import {Domain} from "primate";

// A basic domain that contains two string properies
export default class User extends Domain {
  static fields = {
    // a user's name must be a string
    name: String,
    // a user's age must be a number
    age: Number,
  };
}


```

### Short notation

Field types may be any constructible JavaScript object, including other
domains. When using other domains as types, data integrity (on saving) is
ensured.

```js
import {Domain} from "primate";
import House from "./House.js";

export default class User extends Domain {
  static fields = {
    // a user's name must be a string
    name: String,
    // a user's age must be a number
    age: Number,
    // a user's house must have the foreign id of a house record
    house_id: House,
  };
}

```

### Predicates

Field types may also be specified as an array, to specify additional predicates
aside from the type.

```js
import {Domain} from "primate";
import House from "./House.js";

export default class User extends Domain {
  static fields = {
    // a user's name must be a string and unique across the user collection
    name: [String, "unique"],
    // a user's age must be a positive integer
    age: [Number, "integer", "positive"],
    // a user's house must have the foreign id of a house record and no two
    // users may have the same house
    house_id: [House, "unique"],
  };
}

```

## Stores

Stores interface data. Primate comes with volatile in-memory store used as a
default. Other stores can be imported as modules.

All stores are loaded from `stores`.

## License

MIT
