'use strict';

const disable = require('../../common/helper').disableHelper;
const rq = require('../../common/helper').httpHelper;

module.exports = function (ParkSlot) {
  disable.disableAllMethods(ParkSlot, ['find']);

  ParkSlot.createParkSlotList = async (carsize, amount, cb) => {
    let createdCarSize = carsize ? carsize.toUpperCase() : null;
    let createdSlot = [];
    if (!createdCarSize || !amount || createdCarSize.replace(/\s/g, '') === '') {
      return;
    }
    for (let i = 0; i < amount; i++) {
      let res = await ParkSlot.create(
        {
          "carSize": createdCarSize
        }
      );
      createdSlot.push(res);
    }
    return createdSlot;
  }

  ParkSlot.remoteMethod('createParkSlotList', {
    http: {
      path: '/slot-list',
      verb: 'post',
    },
    accepts: [
      { arg: 'carsize', type: 'string', 'required': true },
      { arg: 'amount', type: 'number', 'required': true },
    ],
    returns: { arg: 'data', type: 'object', root: true },
  });
};
