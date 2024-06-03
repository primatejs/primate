import { manifest } from "rcompat/package";

export default { ...(await manifest(import.meta.filename)).peerDependencies };
