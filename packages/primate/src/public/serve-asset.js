import { OK } from "@rcompat/http/status";
import { resolve } from "@rcompat/http/mime";

export default asset => new Response(asset.stream(), {
  status: OK,
  headers: {
    "Content-Type": resolve(asset.name),
  },
});
