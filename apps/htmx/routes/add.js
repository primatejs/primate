export default {
  post({ body }) {
    return `<h2>Adding a post with:</h2>
      <div><strong>Title</strong> ${body.title}</div>
      <div><strong>Text</strong> ${body.text}</div>`;
  },
};
