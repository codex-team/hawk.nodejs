module.exports = function hello() {
  throw new Error(Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 15));
}
