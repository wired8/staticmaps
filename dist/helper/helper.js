"use strict";

Array.prototype.StaticMax = function () {
  return Math.max.apply(null, this);
};
Array.prototype.StaticMin = function () {
  return Math.min.apply(null, this);
};