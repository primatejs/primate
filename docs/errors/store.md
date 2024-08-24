# Store

## Empty Store Directory

Level [`Warn`][warn]

The `stores` directory is empty, module is disabled.

*Populate this directory with stores.*

## Invalid Document

Level [`Warn`][warn]

Document validation failed.

*If necessary, fix errors.*

## Invalid Type

Level [`Error`][error] | [`Bailout`][bailout]

A field has an invalid type. Types must be functions or objects with a `type`
property, itself a function.

*Use a valid type.*

## Invalid Value

Level [`Error`][error]

Tried to unpack a database value which did not fit into the specified type.

*Change type for field or correct data in database.*

### No Document

Level [`Warn`][warn]

No document found with the given primary key using the store's `get` operation. This
operation either returns an object or throws, leading to a route's execution
halt.

*Check for existence with the store's `exists(id)` operation first.*

## No Driver

Level [`Error`][error]

Could not find given driver.

*Install driver by issuing the given command.*

## No Primary Key

Level [`Error`][error] | [`Bailout`][bailout]

A store is missing a primary key. Most stores need a primary key to distinguish
records. In other cases an opt-out is available.

*Add a primary key field to store or export `const ambiguous = true;`.*
### No Store Directory

Level [`Warn`][warn]

The `stores` directory is missing, module is disabled.

*Create this directory and populate it with stores.*

## Transaction Rollback

Level [`Warn`][warn]

Transaction rolled back due to previous error.

*Address previous errors.*

[error]: /guide/logging#error
[bailout]: /guide/logging#bailout
[warn]: /guide/logging#warn
