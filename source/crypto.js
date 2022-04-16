import {createHash, randomBytes} from "crypto";

export const algorithm = "sha256";

export const hash = (payload, digest = "base64") =>
  createHash(algorithm).update(payload, "utf8").digest(digest);

export const random = length => randomBytes(length);
