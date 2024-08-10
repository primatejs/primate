import join from "@rcompat/fs/join";

export default (...parts) => join(...parts).text();
