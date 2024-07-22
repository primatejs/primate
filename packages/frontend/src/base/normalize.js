import hash from "@rcompat/crypto/hash";

export default module => async path => `${module}_${await hash(path)}`;
