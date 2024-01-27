%%% JS, TS, Go, Python, Ruby

```js caption=routes/index.js
import { view } from "primate";

const posts = [{
  id: 1,
  title: "First post",
}];

export default {
  get() {
    return view("Index.jsx", { posts });
  },
};
```

```ts caption=routes/index.ts
import { view, Route } from "primate";

const posts = [{
  id: 1,
  title: "First post",
}];

export default {
  get() {
    return view("Index.jsx", { posts });
  },
} satisfies Route;
```

```go caption=routes/index.go
import "github.com/primatejs/go/primate"

func Get(request Request) any {
  posts := Array{Object{
    "id": 1,
    "title": "First post",
  }};

  return primate.View("Index.jsx", 
    Object{ "posts": posts });
}
```

```py caption=routes/index.python
def get(request):
  posts = [{
   "id": 1,
   "title": "First post",
  }]
  return Primate.view("Index.jsx", 
    { "posts": posts })
```

```rb caption=routes/index.rb
def get(request)
  posts = [{
    id: 0,
    title: "First post",
  }]
  Primate.view("Index.jsx", { posts: posts })
end
```

%%%
