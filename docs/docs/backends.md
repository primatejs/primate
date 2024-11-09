# Backends

!!!
If you don't plan on using Primate with any other backend aside from
JavaScript, you can skip this section and go over to
[routes](/docs/routes).
!!!

Primate supports writing backend logic (route files) in other programming
languages than JavaScript. Non-JavaScript/TypeScript routes will be compiled to
Wasm and run as WebAssembly.

Here is an example of a backend `GET` function that shows the time of the day,
in different backends.

{% tabs %}

```js#JavaScript
export default {
  get() {
    return "Donald";
  },
};
```

```ts#TypeScript
import type { Route } from "primate";

export default {
  get() {
    return "Donald";
  },
} satisfies Route;
```

```go#Go
func Get(request Request) any {
  return "Donald";
}
```

```py#Python
def get(request):
    return "Donald"
```

```rb#Ruby
def get(request)
  "Donald"
end
```

{% /tabs %}
As a general rule, Primate endeavors to offer the same or a similar API in
other programming languages as concerns the request object that is passed to 
the route and the available handlers (`view`, `redirect`).

Which features are supported differs between backends. In some cases, the
feature has not been implemented yet for the backend. In others, there might
be technical limitations preventing us from supporting the features. Refer to
the individual documentation pages to see what each backend supports.

!!!
Backend files are compiled and run individually. It is therefore possible to
combine several backends in one application. As long as they don't map to the
same route.
!!!

## Features

### File extension

The file extension associated with the backend, when authoring route files in
`routes`.

### Streaming

Whether the backend supports streaming data from route functions.

### Stores

Whether it's possible to write stores using the backend.

### Sessions

Whether the backend supports `request.session`

## Support matrix

|Backend|File extension|Streaming|Stores|Sessions|
|-|-|-|-|-|
|JavaScript  |`.js`|✓|✓|✓|✓|
|[TypeScript]|`.ts`|✓|✓|✓|✓|
|[Go]        |`.go`|✓|✗|✗|✓|
|[Python]    |`.py`|✓|✗|✓|✓|
|[Ruby]      |`.rb`|✓|✗|✓|✓|

[TypeScript]: /docs/backend/typescript
[Go]: /docs/backend/go
[Python]: /docs/backend/python
[Ruby]: /docs/backend/ruby
