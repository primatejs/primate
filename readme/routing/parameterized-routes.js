// routes/user/{userId}.js handles all routes of the sort `/user/{userId}`
// where {userId} can be anything
export default {
  get(request) {
    return `user id: ${request.named.userId}`;
  },
};
