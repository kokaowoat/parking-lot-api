'use strict';

const disable = require('../../common/helper').disableHelper;
const rq = require('../../common/helper').httpHelper;

module.exports = function(Parkslot) {
  disable.disableAllMethods(Parkslot, ['create', 'find']);
};
