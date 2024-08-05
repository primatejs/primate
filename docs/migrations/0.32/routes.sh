#!/usr/bin/env bash
find . -type f -exec sed -i 's/import view from "primate/handler/view"/import view from "primate\/handler\/view"/g' {} + &&
find . -type f -exec sed -i "s/import view from 'primate/handler/view'/import view from 'primate\/handler\/view'/g" {} + &&
find . -type f -exec sed -i 's/import error from "primate/handler/error"/import error from "primate\/handler\/error"/g' {} + &&
find . -type f -exec sed -i "s/import error from 'primate/handler/error'/import error from 'primate\/handler\/error'/g" {} + &&
find . -type f -exec sed -i 's/import redirect from "primate/handler/redirect "/import redirect from "primate\/handler\/redirect "/g' {} + &&
find . -type f -exec sed -i "s/import redirect from 'primate/handler/redirect'/import redirect from 'primate\/handler\/redirect'/g" {} + &&
find . -type f -exec sed -i 's/import ws from "primate/handler/ws"/import ws from "primate\/handler\/ws"/g' {} + &&
find . -type f -exec sed -i "s/import ws from 'primate/handler/ws'/import ws from 'primate\/handler\/ws'/g" {} + &&
find . -type f -exec sed -i 's/import sse from "primate/handler/sse"/import sse from "primate\/handler\/sse"/g' {} + &&
find . -type f -exec sed -i "s/import sse from 'primate/handler/sse'/import sse from 'primate\/handler\/sse'/g" {} +
