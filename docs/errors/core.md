# Core

## Bad Body

Level [`Error`][error]

Bad body was returned from route. This is usually caused when you forget to
add a return value from your route.

*Return a proper body from route.*

## Bad Default Export

Level [`Error`][error] | [`Bailout`][bailout]

A file has an invalid default export. Some special files like guards, layouts
or error files must expose a function as their default export.

*Use only functions for the default export of the given file.*

## Bad Path

Level [`Error`][error] | [`Bailout`][bailout]

Invalid characters in path. Path filenames (including directory filenames)
are limited to letters, digits, '_', '[',  ']' or '='.

*Use only letters, digits, '_', '[', ']' or '=' in path filenames.*

## Bad Type Export

Level [`Error`][error] | [`Bailout`][bailout]

A type file has an invalid default export.

*Export object with a `base` string and a `validate` function.*

## Bad Type Name

Level [`Error`][error] | [`Bailout`][bailout]

Invalid characters in the filename of a type.

*Use only Latin letters and decimal digits in type filenames, i.e. lowercase
and uppercase A to Z as well as 0 to 9.*

## Double Extension

Level [`Error`][error] | [`Bailout`][bailout]

Two handlers are using the same file extension. File extensions must be
uniquely mappable to a handler. All handlers allow you to use an alternative
file extension.

*Use a different file extension for one of the handlers.*

## Double Module

Level [`Error`][error] | [`Bailout`][bailout]

Two modules are using the same name in `primate.config.is`. A module's `name`
property is its unique identifier and must not be doubled.

*Load the module only once.*

## Double Path Parameter

Level [`Error`][error] | [`Bailout`][bailout]

The same parameter is used twice in one route, as in
`routes/[user_id]/[user_id].js`. Path parameters are mapped to `request.query`
and using the same name twice (with or without a type) creates ambiguity.

*Disambiguate path parameters in route names.*

## Double Route

Level [`Error`][error] | [`Bailout`][bailout]

The same route is used twice, as in `routes/user.js` and
`routes/user/index.js` or `routes/post/[foo].js` and `/routes/post/[bar].js`,
creating mapping ambiguity. Routes must be unique, and while you can mix styles
in your application (like `routes/user.js` and `routes/comment/index.js`), you
must not use the same style for the same route.

*Disambiguate the routes by consolidating them into one file of the path style
of your choosing.*

## Empty Config File

Level [`Warn`][warn]

The configuration file at `primate.config.js` was loaded without or with an
empty default export.

*Add configuration options to the file or remove it.*

## Empty Directory

Level [`Warn`][warn]

One of the default directories is empty.

Primate is an opt-in framework, that is most of its aspects, like *routes* or
*types* are only active when their directories exist. Such an empty directory
could mean you intended to use something but haven't.

*Populate the directory with files or remove it completely.*

## Empty Path Parameter

Level [`Error`][error] | [`Bailout`][bailout]

A nameless path parameter (`[]`) was found. Primate cannot match empty path
parameters.

*Name the path parameter or remove it.*

## Empty Route File

Level [`Warn`][warn]

A route file without routes was found. An empty file may create the false
impression that it handles certain paths.

*Add routes to the file or remove it completely.*

## Error In Config File

Level [`Error`][error] | [`Bailout`][bailout]

JavaScript error encountered when importing `primate.config.js`.

*Check and address errors in the config file by running it directly.*

## Mismatched Body

Level [`Error`][error]

The given content type does not correspond to the actual body contents.

*If unintentional, make sure the request body you're sending from the client
corresponds to the used content type header in your request.*

## Mismatched Path

Level [`Info`][info] | [`Possibly Intentional`][possibly-intentional]

Type mismatch in path parameters, precluding the route from executing.

*If unintentional, fix the type or the caller.*

## Mismatched Type

Level [`Info`][info] | [`Possibly Intentional`][possibly-intentional]

Type mismatch during the execution of a route function, stopping the route.
The mismatch happened in a `body`, `query`, `cookies` or `headers` field.

*If unintentional, fix the type or the caller.*

## Module No Name

Level [`Error`][error] | [`Bailout`][bailout]

Module loaded without a `name` property. Without this property Primate cannot
detect if a module has been loaded more than once.

*If this is a ad-hoc module, add a `name` property to it to make it unique. If
it is a third-party module, contact its maintainer.*

## Modules Array

Level [`Error`][error] | [`Bailout`][bailout]

The `modules` config property must be an array.

*Change the `module` config property to an array or remove it completely.*

## No Handler

Level [`Error`][error]

No appropriate handler was found for the given file extension using the
[`view`](/guide/responses#view) handler.

*Add a handler module for files of the given extension or change this route.*

## No Route To Path

Level [`Info`][info] | [`Possibly Intentional`][possibly-intentional]

Cannot map the given path to a route, as in `GET /user.js` when `route/user.js`
does not exist or have a `get` property function.

*If unintentional, create an appropriate route function.*

## Optional Route

Level [`Error`][error] | [`Bailout`][bailout]

Optional routes must at the end of a filesystem hierarchy.

*Move route to leaf (last) position in filesystem hierarchy.*

## Reserved Type Name

Level [`Error`][error] | [`Bailout`][bailout]

Reserved type name used. Reserved types are: `get`, `raw`.

*Do not use any reserved name in type filenames.*

## Rest Route

Level [`Error`][error] | [`Bailout`][bailout]

Rest routes must at the end of a filesystem hierarchy.

*Move route to leaf (last) position in filesystem hierarchy.*

[error]: /guide/logging#error
[bailout]: /guide/logging#bailout
[warn]: /guide/logging#warn
[info]: /guide/logging#info
[possibly-intentional]: /guide/logging#possibly-intentional

