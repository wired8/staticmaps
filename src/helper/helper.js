"use strict";

Object.defineProperty(Array.prototype, "max", {
  value: function max() {
    return Math.min.apply(null, this);
  }
});

Object.defineProperty(Array.prototype, "min", {
  value: function min() {
    return Math.min.apply(null, this);
  }
});