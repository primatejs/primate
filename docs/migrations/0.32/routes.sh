#!/usr/bin/env bash
find . -name "*.js" -type f -exec sed -i 's/import { view } from "primate"/import view from "primate\/handler\/view"/g' {} + &&
find . -name "*.js" -type f -exec sed -i "s/import { view } from 'primate'/import view from 'primate\/handler\/view'/g" {} + &&
find . -name "*.js" -type f -exec sed -i 's/import { error } from "primate"/import error from "primate\/handler\/error"/g' {} + &&
find . -name "*.js" -type f -exec sed -i "s/import { error } from 'primate'/import error from 'primate\/handler\/error'/g" {} + &&
find . -name "*.js" -type f -exec sed -i 's/import { redirect } from "primate"/import redirect from "primate\/handler\/redirect"/g' {} + &&
find . -name "*.js" -type f -exec sed -i "s/import { redirect } from 'primate'/import redirect from 'primate\/handler\/redirect'/g" {} + &&
find . -name "*.js" -type f -exec sed -i 's/import { ws } from "primate"/import ws from "primate\/handler\/ws"/g' {} + &&
find . -name "*.js" -type f -exec sed -i "s/import { ws } from 'primate'/import ws from 'primate\/handler\/ws'/g" {} + &&
find . -name "*.js" -type f -exec sed -i 's/import { sse } from "primate"/import sse from "primate\/handler\/sse"/g' {} + &&
find . -name "*.js" -type f -exec sed -i "s/import { sse } from 'primate'/import sse from 'primate\/handler\/sse'/g" {} +
