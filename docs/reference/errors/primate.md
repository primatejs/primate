# primate

List of errors in the base framework. For an explanation of logging, error
levels and early bailout, see [logging](/advanced/logging).

## Cannot Parse Body

Level: `Warn`

Primate is unable to parse the request body due to the a mismatch between the
used `Content-Type` and the actual body, for example as follows.

```http caption=request with invalid JSON body
POST /user
Content-Type: application/json

~
```

This could be due to the client using the wrong content type or sending, as in
the given example, invalid body with its request. It can also be intentional
due to a client-side manipulation.

**If deemed unintentional, use a different content type or fix the body.**

## Double Module

Level: `Error` (early bailout)

Primate detects two modules using the same name in `primate.config.is`, which
is impermissible. A module's `name` property is its unique identifier.

**Load the module only once.**

## Double Path Parameter

Level: `Error` (early bailout)

Primate detects the use of the same parameter twice in one route, such as
`routes/{userId}/{userId}.js`, which is impermissible. Path parameters are
mapped to `request.query`, and using the same name twice (with or without a
type) creates ambiguity.

**Disambiguate path parameters in route names.**

## Double Route

Level: `Error` (early bailout)

Primate detects the same route used twice, such as `route/user.js` and
`route/user/index.js`, which is impermissible, creating mapping ambiguity.
Routes must be unique, and while you can mix styles in your application (like
`route/user.js` and `route/comment/index.js`), you must not use the same style
for the same route.

**Disambiguate the routes by consolidating them into one file of the path-style
of your choosing.**

## Empty Route File

Level: `Warn`

Primate finds an empty route file, that is a route file without or with an
empty default export.

**Add routes to the file or remove it.**

## Error In Config File

Level: `Error` (bailout)

Primate encounters error when importing `primate.config.js`.

**Check and address errors in the config file by running it directly.**

## Module Has No Hooks

Level: `Warn`

Primate loads a module without hooks, which does nothing.

**If this is a ad-hoc module, add hooks to it to make effective. If a
third-party module, contact the maintainer.**

## Modules Must Have Names

Level: `Error` (bailout)

Primate tries to load a module that has no `name` property, which is
impermissible. If modules have no names, Primate cannot detect if they have
been loaded more than once.

**If this is a ad-hoc module, add a `name` property to it to make it unique. If
a third-party module, contact its maintainer.**

## Empty Config File

Level: `Warn`

Primate loads a `primate.config.js` without or with an empty default export,
which does nothing.

**Add configuration options to the file or remove it.**

## No File For Path

Level: `Info`

Primate finds no file for the given path, for example `/favicon.ico` when the
`static` directory does not contain a `favicon.ico` file. This could be either
due to a missing file or intentional client-side probing. 

**If deemed unintentional, create a file in your static directory.**

## No Handler For Extension

Level: `Error`

Primate finds no appropriate handler for the given extension using the
[`view`](/guide/handling-requests#view) handler.

**Add a handler module for files of the given extension or change this route.**

## No Route To Path

Level: `Info`

Primate cannot map the given path to a route, for example `GET /user.js` when
`route/user.js` does not exist or have a `get` property function. This could be
due to a missing route function or intentional client-side probing. 

**If deemed unintentional, create an appropriate route function.**

## Invalid Path Parameter

Level: `Error` (bailout)

Primate finds invalid characters in a path parameter, which is impermissible.
Path parameters are limited to alphanumeric characters.

**Use only Latin letters and decimal digits in path parameters, that is
lowercase and uppercase A to Z as well as 0 to 9.

## Invalid Route Name

Level: `Error` (bailout)

Primate finds dots in route names, which is impermissible. Dots are typically
used for files, which would create amgibuity between routes and static files.

**Do not use dots in route names.**

## Invalid Type

Level: `Error` (bailout)

Primate finds in valid characters in a type definition, which is impermissible.

**Use only Latin letters and decimal digits in types, that is lowercase and
uppercase A to Z as well as 0 to 9.

