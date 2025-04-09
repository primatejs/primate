# Angular

This handler module supports SSR and hydration and serves Angular components
with the `.component.ts` extension.

## Install

`npm install @primate/angular`

## Configure

Import and initialize the module in your configuration.

```js caption=primate.config.js
import angular from "@primate/angular";

export default {
  modules: [
    angular(),
  ],
};
```

## Use

Create an Angular component in `components`.

```angular-ts caption=components/post-index.component.ts
import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "post-index",
  imports: [ CommonModule ],
  template: `
    <h1>All posts</h1>
    <div *ngFor="let post of posts">
      <h2>
        <a href="/post/view/{{post.id}}">
          {{post.title}}
        </a>
      </h2>
    </div>
  `,
  standalone: true,
})
export default class PostIndex {
  @Input() posts = [];
}
```

Serve it from a route.

```js caption=routes/angular.js
import view from "primate/handler/view";

const posts = [{
  id: 1,
  title: "First post",
}];

export default {
  get() {
    return view("post-index.component.ts", { posts });
  },
};
```

The rendered component will be accessible at http://localhost:6161/angular.

## Configuration options

### extension

Default `".component.ts"`

The file extension associated with Angular components.

### mode

Default `"production"`

Angular's mode of operation. Any value other than `"production"` will set
Angular to development mode.

## Resources

* [Repository][repo]

[repo]: https://github.com/primate-run/primate/tree/master/packages/angular
