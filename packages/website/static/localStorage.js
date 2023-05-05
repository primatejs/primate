import {writable} from "svelte/store";

const item = "colorScheme";

const preference = () =>
  window.matchMedia("(prefers-color-scheme:dark)").matches ? "dark" : "light";

const colorscheme = writable(localStorage.getItem(item) || preference());

colorscheme.subscribe(value => {
  localStorage.setItem(item, value);
  if (value === "dark") {
    document.body.classList.add("dark");
  } else {
    document.body.classList.remove("dark");
  }
});

export default colorscheme;
