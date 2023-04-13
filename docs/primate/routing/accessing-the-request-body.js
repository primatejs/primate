// routes/site/login.js handles the `/site/login` route
export default {
  get(request) {
    return `username submitted: ${request.body.username}`;
  },
};
