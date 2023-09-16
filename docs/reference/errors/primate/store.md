# primate/store

List of errors in the [data store module](/modules/store).

## Empty Store Directory

Level [`Warn`][warn]

The `stores` directory is empty, a no-op.

**Populate this directory with stores or remove it.**

## Cannot Unpack Value

Level [`Error`][error]

Tried to unpack a database value which did not fit into the specified type.

**Change type for field or correct data in database.**

## Invalid Type

Level [`Error`][error] | [`Bailout`][bailout]

A field has an invalid type. Types must be functions or objects with a `type`
property, itself a function.

**Use a valid type.**

## Missing Dependencies

Level [`Error`][error] | [`Bailout`][bailout]

A store module was loaded in the configuration for which dependencies are
missing.

**Install the dependency according to the instructions in the error message.**

The store module only provides wrappers for data store drivers. The actual
package needs to be installed by the user. Primate will inform you which
dependency is missing and what command you need to issue to install it.

[bailout]: /guide/logging#bailout

## Missing Primary Key

Level [`Error`][error] | [`Bailout`][bailout]

A store is missing a primary key. Most stores need a primary key to distinguish
documents. In other cases an opt-out is available.

**Add a primary key field to store or export `const ambiguous = true;`.**

## Missing Store Directory

Level [`Warn`][warn]

The `stores` directory is missing, the module is not being used.

**Create this directory and populate it with stores or remove the module.**

## No Document Found

Level [`Warn`][warn]

No document found with the primary key, using the store's `get` operation. This
operation either returns an object or throws, leading to a route's execution
halt.

**Check for existence with the store's `exists(id)` operation first.**

## Transaction Rolled Back

Level [`Warn`][warn]

Transaction rolled back due to previous error.

**Address previous errors.*

[error]: /guide/logging#error
[bailout]: /guide/logging#bailout
[warn]: /guide/logging#warn
