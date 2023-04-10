// routes/site/login.js handles the `/site/login` route
export default {
  get(request) {
    // Will serve `["site", "login"]` as JSON
    return request.path;
  },
};
