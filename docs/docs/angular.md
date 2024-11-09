# Angular

[Angular](https://angular.dev) is a frontend framework developed by Google.
Components are authored in TypeScript with annotated dependency injection.

## Features

|File Extension|Props|SSR|Hydration|SPA|Layouts|Head|I18N|
|-|-|-|-|-|-|-|-|
|`.component.ts`|✓|✓|✓|✗|✗|✗|✗|

## Install

{% install=@primate/angular %}

## Use

{% tabs %}

```js#primate.config.js
import angular from "@primate/angular";

export default {
  modules: [
    angular(/* AngularOptions */),
  ],
};
```

```js#Route
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

```angular-ts#Component
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

{% /tabs %}

## Options

```ts
interface AngularOptions {
  // The file extension associated with Angular components.
  extension?: string, // default: ".component.ts"
  // Mode of operation
  mode?: "production" | "development",
}
```

## Resources

* [Code]

[Code]: https://github.com/primatejs/primate/tree/master/packages/angular
