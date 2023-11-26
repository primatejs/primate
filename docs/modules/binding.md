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

|Feature           |JS      |GO      |Python  |
|------------------|--------|--------|--------|
|serving strings   |[✓][stj]|[✓][stg]|[✓][stp]|
|serving objects   |[✓][obj]|[✓][obg]|[✓][obp]|
|serving streams   |[✓][srj]|✗       |✗       |
|`redirect` handler|[✓][rhj]|[✓][rhg]|[✓][rhp]|
|`view` handler    |[✓][vhj]|[✓][vhg]|[✓][vhp]|
|`error` handler   |[✓][ehj]|✗       |[✓][ehp]|
|`request.body`    |[✓][rbj]|[✓][rbg]|[✓][rbp]|
|`request.path`    |[✓][rpj]|[✓][rpg]|[✓][rpp]|
|`request.query`   |[✓][rqj]|[✓][rpg]|[✓][rpp]|
|`request.cookies` |[✓][rcj]|[✓][rpg]|[✓][rpp]|
|`request.headers` |[✓][rhj]|[✓][rpg]|[✓][rpp]|
|`request.session` |[✓][rsj]|[✓][rsg]|[✓][rsp]|
|`request.store.*` |[✓][rtj]|✗       |[✓][rtp]|

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

[stp]: /modules/python#plain-text
[obp]: /modules/python#json
[rhp]: /modules/python#redirect
[vhp]: /modules/python#view
[rbp]: /modules/python#body
[rpp]: /modules/python#path-query-cookies-headers
[rsp]: /modules/python#session
[rtp]: /modules/python#store


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
