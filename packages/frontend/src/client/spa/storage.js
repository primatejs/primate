const global = globalThis;

const last = -1;
const scrollTop = () => global.document.scrollingElement.scrollTop;

export default {
  name: "$$primate$$",
  storage: global.sessionStorage,
  get() {
    return JSON.parse(this.storage.getItem(this.name)) ?? [];
  },
  set(item) {
    this.storage.setItem(this.name, JSON.stringify(item));
  },
  // placing a new item into the history
  new(entry) {
    const { stack = [] } = this.get();
    this.set({
      stack: [...stack, entry],
      // pushing a new entry invalidates all old and next items
      old: [],
      next: [],
    });
  },
  // going back in the history
  back() {
    const { stack = [], old = [], next = [] } = this.get();
    const top = stack.at(last);

    this.set({
      // remove top of stack
      stack: stack.slice(0, last),
      // place the current scrolling state in next
      next: [...next, { scrollTop: scrollTop() }],
      // add the top of the stack to old
      old: [...old, top],
    });

    return top;
  },
  // going forward in the history
  forward() {
    const { stack = [], old = [], next = [] } = this.get();

    this.set({
      // add the top of old to stack, with current scrollTop
      stack: [...stack, { ...old.at(last), scrollTop: scrollTop() }],
      // remove top of old
      old: old.slice(0, last),
      // remove top of next
      next: next.slice(0, last),
    });

    return next.at(last);
  },
  peek() {
    return this.get().stack.at(last);
  },
};
