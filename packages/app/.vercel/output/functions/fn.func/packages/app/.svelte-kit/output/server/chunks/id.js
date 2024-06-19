import { n as nanoid } from "./index7.js";
function generateId() {
  return nanoid(10);
}
function generateIds(args) {
  return args.reduce((acc, curr) => {
    acc[curr] = generateId();
    return acc;
  }, {});
}
export {
  generateId as a,
  generateIds as g
};
