import { h as getAllStalls } from "../../../chunks/products.service.js";
async function load() {
  return {
    stalls: await getAllStalls()
  };
}
export {
  load
};
