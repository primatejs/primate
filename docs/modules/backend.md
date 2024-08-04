# Backends

Primate supports writing backend logic (route files) in other programming
languages than JavaScript. Non-JavaScript/TypeScript routes will be compiled to
Wasm and run as WebAssembly.

As a general rule, Primate endeavors to offer the same or a similar API in
other programming languages as concerns the request object that is passed to 
the route and the available handlers (`view`, `redirect`).

## Supported backends

* [Go](/modules/go)
* [Python](/modules/python)
* [Ruby](/modules/ruby)
* [TypeScript](/modules/typescript)

## Support matrix

|Feature           |JS, TS  |GO      |Python  |Ruby    |
|------------------|--------|--------|--------|--------|
|serving strings   |[✓][stj]|[✓][stg]|[✓][stp]|[✓][str]|
|serving objects   |[✓][obj]|[✓][obg]|[✓][obp]|[✓][obr]|
|serving streams   |[✓][srj]|✗       |✗       |✗       |
|`redirect` handler|[✓][rhj]|[✓][rhg]|[✓][rhp]|[✓][rhr]|
|`view` handler    |[✓][vhj]|[✓][vhg]|[✓][vhp]|[✓][vhr]|
|`error` handler   |[✓][ehj]|✗       |[✓][ehp]|[✓][ehr]|
|`request.body`    |[✓][rbj]|[✓][rbg]|[✓][rbp]|[✓][rbr]|
|`request.path`    |[✓][rpj]|[✓][rpg]|[✓][rpp]|[✓][rpr]|
|`request.query`   |[✓][rqj]|[✓][rpg]|[✓][rpp]|[✓][rpr]|
|`request.cookies` |[✓][rcj]|[✓][rpg]|[✓][rpp]|[✓][rpr]|
|`request.headers` |[✓][rhj]|[✓][rpg]|[✓][rpp]|[✓][rpr]|
|`request.session` |[✓][rsj]|[✓][rsg]|[✓][rsp]|[✓][rsr]|
|`request.store.*` |[✓][rtj]|✗       |[✓][rtp]|✗       |

[stj]: /guide/responses#plain-text
[obj]: /guide/responses#json
[srj]: /guide/responses#stream
[rhj]: /guide/responses#redirect
[vhj]: /guide/responses#view
[ehj]: /guide/responses#error
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
[ehp]: /modules/python#error
[vhp]: /modules/python#view
[rbp]: /modules/python#body
[rpp]: /modules/python#path-query-cookies-headers
[rsp]: /modules/python#session
[rtp]: /modules/python#store

[str]: /modules/ruby#plain-text
[obr]: /modules/ruby#json
[rhr]: /modules/ruby#redirect
[ehr]: /modules/ruby#error
[vhr]: /modules/ruby#view
[rbr]: /modules/ruby#body
[rpr]: /modules/ruby#path-query-cookies-headers
[rsr]: /modules/ruby#session

### Type conversions

Whenever you define and use [runtime types], the request object will be
augmented with dispatchers to coerce the input string into a given type. In the
following is a table with the supported base types and what types they are
converted to in every supported language.

|Type   |JS     |GO     |Ruby   |
|-------|-------|-------|-------|
|boolean|boolean|bool   |       |
|i8     |number |int8   |Integer|
|i16    |number |int16  |Integer|
|i32    |number |int32  |Integer|
|i64    |bigint |int64  |Integer|
|f32    |number |float32|Float  |
|f64    |number |float64|Float  |
|u8     |number |uint8  |Integer|
|u16    |number |uint16 |Integer|
|u32    |number |uint32 |Integer|
|u64    |bigint |uint64 |Integer|
|string |string |string |String |

[runtime types]: /guide/types
