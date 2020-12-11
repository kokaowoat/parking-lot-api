'use strict';

const disable = require('../../common/helper').disableHelper;
const rq = require('../../common/helper').httpHelper;
const app = require('../server');

module.exports = function (ParkSlot) {
  disable.disableAllMethods(ParkSlot, ['create', 'find']);

  ParkSlot.createParkSlotList = async (carsize, amount, cb) => {
    let createdCarSize = carsize ? carsize.toUpperCase() : null;
    let createdSlot = [];
    if (!createdCarSize || !amount || createdCarSize.replace(/\s/g, '') === '') {
      let activityLog = {
        "status": "FAIL",
        "type": "CREATE_PARK_SLOT",
        "additionalData": JSON.stringify({
          carsize,
          amount
        }),
      }
      app.models.ActivityLog.create(activityLog);
      return;
    }
    for (let i = 0; i < amount; i++) {
      let res = await ParkSlot.create(
        {
          "id": "6701d660-1a6d-4b43-a6a4-5750efcfeddf",
          "carSize": createdCarSize
        }
      );
      if (res) {
        let activityLog = {
          "status": "SUCCESS",
          "type": "CREATE_PARK_SLOT",
          "additionalData": JSON.stringify(res),
        }
        app.models.ActivityLog.create(activityLog);
        createdSlot.push(res);
      } else {
        let activityLog = {
          "status": "FAIL",
          "type": "CREATE_PARK_SLOT",
          "additionalData": JSON.stringify({
            carsize,
            amount
          }),
        }
        app.models.ActivityLog.create(activityLog);
      }
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
