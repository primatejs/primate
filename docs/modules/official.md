# Official modules

!!!
This section is about official Primate modules that you can use. If you're
interested in how to write a module yourself, refer to
[Extending Primate](/guide/extending-primate).
!!!

Primate's official modules are supported and maintained by the Primate team and
published under the `@primate` namespace on NPM. They address common use cases
and include handlers for popular frontend frameworks, transactionalized data
stores for various database systems, user sessions and bundling.

Like Primate itself, the official modules are licensed under the MIT license.

## Handlers

Handler modules extend Primate's component support to popular frontend
frameworks such as Svelte, React, Solid, Vue or HTMX. They register new file
types that allow you to write components for these frameworks and use them with
the `view` handler.

## Stores
 
Primate's store modules add a dimension of data persistance to your app. They
enhance the `request` object that is passed to your route functions with
transactions, allowing you to commit and rollback data changes automatically.

## Others

Modules that do not fall in the first two categories, including an esbuild
bundler as well as a session module.
