import { unwrap } from "./unwrap.js";

export default request => {
  return {
    ...request,
    session: {
      ...request.session,
      create(data) {
        request.session.create(unwrap(data));
      },
    },
  };
};
