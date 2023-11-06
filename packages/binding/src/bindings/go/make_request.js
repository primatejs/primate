import { from, stringify } from "rcompat/object";

const make_search_params = url => stringify(from(url.searchParams.entries()));

export default request => {
  return {
    url: request.url,
    search_params: make_search_params(request.url),
  };
};
