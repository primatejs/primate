# Bindings

The binding module allows you to write backend logic (route files) in other
programming languages than JavaScript. Primate will then compile your 
non-JavaScript routes to WASM, and run them as WebAssembly.

As a general rule, Primate endeavors to offer the same or a simply API in other
programming languages, as concerns the request object that is passed to routes,
and the handlers (`view`, `redirect`) that are available to JavaScript routes.

The `@primate/binding` module currently supports Go.

## Install

`npm install @primate/binding`

The individual programming languages are available as individual exports.

## Support matrix

|Feature           |JS|GO|
|------------------|-----|
|serving strings   |✓ |✓ |
|serving objects   |✓ |✓ |
|serving streams   |✓ |✗ |
|`view` handler    |✓ |✓ |
|`redirect` handler|✓ |✓ |
|`stream` handler  |✓ |✗ |
|`request.body`    |✓ |✓ |
|`request.path`    |✓ |✓ |
|`request.query`   |✓ |✓ |
|`request.cookies` |✓ |✓ |
|`request.headers` |✓ |✓ |
|`request.session` |✓ |✓ |
|`request.store.*` |✓ |✗ |

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
