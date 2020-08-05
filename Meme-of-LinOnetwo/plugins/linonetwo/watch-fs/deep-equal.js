module.exports = function deepEqual(x, y) {
  if (x === y) {
    return true;
  } else if (typeof x == 'object' && x != null && typeof y == 'object' && y != null) {
    if (Object.keys(x).length != Object.keys(y).length) return false;

    for (var prop in x) {
      if (!deepEqual(x[prop], y[prop])) return false;
    }

    return true;
  } else return false;
};
