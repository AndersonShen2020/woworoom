// DOM
const body = document.querySelector("body.overflow-hidden");
const loading = document.querySelector(".loading");

export function isLoading(state) {
  if (state) {
    body.classList.add("overflow-hidden");
    loading.classList.add("loading");
    loading.classList.remove("d-none");
  } else {
    body.classList.remove("overflow-hidden");
    loading.classList.remove("loading");
    loading.classList.add("d-none");
  }
}
