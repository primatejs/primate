%%% JS, TS, Go, Python, Ruby

```js#routes/index.js
import view from "primate/handler/view";

const posts = [{
  id: 1,
  title: "First post",
}];

export default {
  get() {
    return view("PostIndex.jsx", { posts });
  },
};
```

```ts#routes/index.ts
import type { Route } from "primate";
import view from "primate/handler/view";

const posts = [{
  id: 1,
  title: "First post",
}];

export default {
  get() {
    return view("PostIndex.jsx", { posts });
  },
} satisfies Route;
```

```go#routes/index.go
import "github.com/primatejs/go/primate"

func Get(request Request) any {
  posts := Array{Object{
    "id": 1,
    "title": "First post",
  }};

  return primate.View("PostIndex.jsx", Object{ "posts": posts });
}
```

```py#routes/index.py
def get(request):
  posts = [{
   "id": 1,
   "title": "First post",
  }]

  return Primate.view("PostIndex.jsx", { "posts": posts })
```

```rb#routes/index.rb
def get(request)
  posts = [{
    id: 1,
    title: "First post",
  }]

  Primate.view("PostIndex.jsx", { posts: posts })
end
```

%%%
