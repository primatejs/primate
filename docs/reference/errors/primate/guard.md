# primate/guard

List of errors in the [guard module](/modules/guard).

## Empty Guard Directory

Level [`Warn`][warn]

The `guards` directory is empty, a no-op.

**Populate this directory with guards or remove it.**

## Invalid Guard

Invalid guard file found, as in a guard that does not export a default function.

**Make sure all guards export a default function.**

Level [`Error`][error] | [`Bailout`][bailout]

## Missing Guard Directory

Level [`Warn`][warn]

The `guards` directory is missing, the module is not being used.

**Create this directory and populate it with guards or remove the module.**

[error]: /guide/logging#error
[bailout]: /guide/logging#bailout
[warn]: /guide/logging#warn
