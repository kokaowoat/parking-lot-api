'use strict';

const disable = require('../../common/helper').disableHelper;
const rq = require('../../common/helper').httpHelper;

module.exports = function(Activitylog) {
  disable.disableAllMethods(Activitylog, ['create', 'find']);

};
