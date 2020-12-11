'use strict';

const disable = require('../../common/helper').disableHelper;
const rq = require('../../common/helper').httpHelper;

module.exports = function(Car) {
  disable.disableAllMethods(Car, ['create', 'find']);
};
