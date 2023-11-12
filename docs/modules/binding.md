# Bindings

The binding module allows you to write backend logic (route files) in other
programming languages than JavaScript. Primate will then compile your 
non-JavaScript routes to WASM, and run them as WebAssembly.

As a general rule, Primate endeavors to offer the same or a similar API in other
programming languages as concerns the request object that is passed to and
the handlers (`view`, `redirect`) that are available to JavaScript routes.

The `@primate/binding` module currently supports Go.

## Install

`npm install @primate/binding`

The individual programming languages are available as individual exports.

## Support matrix

|Feature           |JS      |GO      |
|------------------|--------|--------|
|serving strings   |[✓][stj]|[✓][stg]|
|serving objects   |[✓][obj]|[✓][obg]|
|serving streams   |[✓][srj]|✗       |
|`redirect` handler|[✓][rhj]|[✓][rhg]|
|`view` handler    |[✓][vhj]|[✓][vhg]|
|`request.body`    |[✓][rbj]|[✓][rbg]|
|`request.path`    |[✓][rpj]|[✓][rpg]|
|`request.query`   |[✓][rqj]|[✓][rpg]|
|`request.cookies` |[✓][rcj]|[✓][rpg]|
|`request.headers` |[✓][rhj]|[✓][rpg]|
|`request.session` |[✓][rsj]|[✓][rsg]|
|`request.store.*` |[✓][rtj]|✗       |

[stj]: /guide/responses#plain-text
[obj]: /guide/responses#json
[srj]: /guide/responses#stream
[rhj]: /guide/responses#redirect
[vhj]: /guide/responses#view
[rbj]: /guide/routes#body
[rpj]: /guide/routes#path
[rqj]: /guide/routes#query
[rcj]: /guide/routes#cookies
[rhj]: /guide/routes#headers
[rsj]: /modules/session/use
[rtj]: /modules/store

[stg]: /modules/go#plain-text
[obg]: /modules/go#json
[rhg]: /modules/go#redirect
[vhg]: /modules/go#view
[rbg]: /modules/go#body
[rpg]: /modules/go#path-query-cookies-headers
[rsg]: /modules/go#session

### Type conversions

Whenever you define and use [runtime types], the request object will be
augmented with dispatchers to coerce the input string into a given type. In the
following is a table with the supported base types and what types they are
converted to in every supported language.

|Type   |JS     |GO     |
|-------|-------|-------|
|boolean|boolean|bool   |
|i8     |number |int8   |
|i16    |number |int16  |
|i32    |number |int32  |
|i64    |bigint |int64  |
|f32    |number |float32|
|f64    |number |float64|
|u8     |number |uint8  |
|u16    |number |uint16 |
|u32    |number |uint32 |
|u64    |bigint |uint64 |
|string |string |string |

[runtime types]: /guide/types
