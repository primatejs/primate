import Status from "@rcompat/http/Status";
import { resolve } from "@rcompat/http/mime";
import type { FileRef } from "@rcompat/fs/file";

export default (asset: FileRef): Response => new Response(asset.stream(), {
  status: Status.OK,
  headers: {
    "Content-Type": resolve(asset.name),
  },
});
