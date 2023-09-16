# primate/frontend

List of errors in the [frontend frameworks module](/modules/frontend).

## Missing Dependencies

Level [`Error`][error] | [`Bailout`][bailout]

A frontend module was loaded in the configuration for which dependencies are
missing.

**Install the dependency according to the instructions in the error message.**

The frontend module only provides wrappers for frontend frameworks. The actual
package needs to be installed by the user. Primate will inform you which
dependency is missing and what command you need to issue to install it.

[bailout]: /guide/logging#bailout
