import { manifest } from "rcompat/package";

export default async () =>
  ({ ...(await manifest(import.meta.filename)).peerDependencies });
