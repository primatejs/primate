# Project structure

While Primate can run without any project structure at all, here is a typical
setup you would use.

```sh
.
├─ static/
│   ├─ index.html
│   └─ [static resources]
├─ primate.config.js
├─ package.json
├─ routes/
│   └─ [filesystem-based routes]
└─ components/
    └─ [view components]
```

## static

This directory contains static resources such as JavaScript, CSS, font files or
anything else you would want Primate to serve statically.

Every file in this directory is mapped to the root path, `/`. For example, if
you have a `style.css`, it will be served at the path `/style.css`.

This directory can also contain an `index.html` file if you wish to override
[the default one][default-index].

Static resources take precedence over [routes][routing]. You can configure 
Primate to serve static resources from a different path by setting the
`http.static.root` property in your configuration to something else.

## primate.config.js

Your project configuration file. If it doesn't exist, Primate will use
its [default configuration][default-config]. If it exists, Primate will merge
your custom configuration with the defaults, using properties you set to
override defaults. Refer to the [configuration](/guide/configuration) section
for in-depth review of all options.

## package.json

While it is not strictly required to have a package.json file in your project,
it is useful for pinning the version of Primate and of additional modules you
use.

To pin the current version of Primate for your project, run `npm i primate`. A
package.json file will be created for you if it doesn't exist.

## routes

This directory contains all your [app routes][routing] hierarchically. If you
were creating a blog, this is how a typical layout could look like.

```sh file=routes (web app)
.
├─ index.js # view homepage -> /
└─ post/
    ├─ add.js # add post -> /post/add
    └─ {postId}/
        ├─ comment/
        │   └─ add.js # add comment on post -> /post/1/comment/add
        ├─ comments.js # show comments on posts -> /post/1/comments
        ├─ delete.js # delete post -> /post/1/delete
        └─ edit.js # edit post -> /post/1/edit
```

Here we chose our paths to represent CRUD actions. This is appropriate for a
web app that uses the same route for showing and submitting a form. However, if
you were developing an API, you might opt for using a wider variety of HTTP
verbs. In that case, your layout might look a little different.

```sh file=routes (API)
.
├─ post/
│   ├─ {postId}/
│   │   └─ comment.js # get post comments -> /post/1/comment
│   │   └─ {commentId}.js # get, update, delete comment -> post/1/comment/2
│   └─ {postId}.js # get, update, delete post -> post/1
└─ post.js # add post -> /post
```

Whether you use `post.js` or `post/index.js` to represent the route
`/post` is your choice, both are equally valid. Primate will warn you if you
try to use both.

## components

This directory contains a collection of view components for your app. These can
be any type of file supported by Primate's [content handlers][handlers]. In our
initial example, we placed an HTML page in this directory which we then served
with the `view` handler.

If your app is an API or doesn't have any views, you don't need to create this
directory.

Primate's official modules includes support for various frontend framework
handlers such as React, Vue, Svelte or HTMX.

[routing]: /guide/routing
[handlers]: /guide/handlers
[default-config]:
https://github.com/primatejs/primate/blob/master/packages/primate/src/defaults/primate.config.js
[default-index]:
https://github.com/primatejs/primate/blob/master/packages/primate/src/defaults/index.html
