# Angular

The modern web developer's platform.

## Support matrix

|[Extension]|[Props]|[SSR]|[Hydration]|[SPA]|[Layouts]|[Head]|[I18N]|
|-|-|-|-|-|-|-|-|
|`.component.ts`|✓|✓|✓|[✗]|[✗]|[✗]|[✗]|


## Install

```sh
npm install @primate/angular
```

## Init

```js caption=primate.config.js
import angular from "@primate/angular";

export default {
  modules: [
    angular(/* configuration */),
  ],
};
```

## Use

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

## Configuration

### extension

Default `".component.ts"`

The file extension associated with Angular components.

### mode

Default `"production"`

Angular's mode of operation. Any value other than `"production"` will set
Angular to development mode.

## Resources

* [Code]

[Code]: https://github.com/primatejs/primate/tree/master/packages/angular
[Extension]: /docs/frontend#extension
[Props]: /docs/frontend#props
[SSR]: /docs/frontend#ssr
[Hydration]: /docs/frontend#hydration
[SPA]: /docs/frontend#spa
[Layouts]: /docs/frontend#layouts
[Head]: /docs/frontend#head
[I18N]: /docs/frontend#i18n
[✗]: https://github.com/primatejs/primate/issues/164
