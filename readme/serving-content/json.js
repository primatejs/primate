// routes/index.js handles the `/` route
export default {
  get() {
    // Proper JavaScript objects are served as JSON
    return [
      {name: "Donald"},
      {name: "Ryan"},
    ];
  },
};
