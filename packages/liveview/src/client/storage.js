const global = globalThis;

export default {
  name: "$$liveview$$",
  storage: global.localStorage,
  get() {
    return JSON.parse(this.storage.getItem(this.name)) ?? [];
  },
  set(item) {
    this.storage.setItem(this.name, JSON.stringify(item));
  },
  // placing a new item into the history
  new(entry) {
    const {stack = []} = this.get();
    this.set({
      stack: [...stack, entry],
      // pushing a new entry invalidates all old and next items
      old: [],
      next: [],
    })
  },
  // going back in the history
  back() {
    const {scrollTop} = global.document.scrollingElement;
    const {stack = [], old = [], next = []} = this.get();
    const top = stack.at(-1);
    
    this.set({
      // remove top of stack
      stack: stack.slice(0, -1),
      // place the current scrolling state in next
      next: [...next, {scrollTop}],
      // add the top of the stack to old
      old: [...old, top],
    })

    return top;
  },
  // going forward in the history
  forward() {
    const {scrollTop} = global.document.scrollingElement;
    const {stack = [], old = [], next = []} = this.get();

    this.set({
      // add the top of old to stack, with current scrollTop
      stack: [...stack, {...old.at(-1), scrollTop}],
      // remove top of old
      old: old.slice(0, -1),
      // remove top of next
      next: next.slice(0, -1),
    });

    return next.at(-1);
  },
  peek() {
    return this.get().stack.at(-1);
  }
};
