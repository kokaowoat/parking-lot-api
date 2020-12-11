'use strict';

const disable = require('../../common/helper').disableHelper;
const rq = require('../../common/helper').httpHelper;

module.exports = function(Ticket) {
  disable.disableAllMethods(Ticket, ['create', 'find']);
};