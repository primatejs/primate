import { unwrap, to_object } from "./unwrap.js";

export default request => {
  return {
    ...request,
    session: {
      ...request.session,
      create(data) {
        request.session.create(to_object(unwrap(data)));
      },
    },
  };
};
