'use strict';

const disable = require('../../common/helper').disableHelper;
const rq = require('../../common/helper').httpHelper;
const app = require('../server');

module.exports = function (ParkSlot) {
  disable.disableAllMethods(ParkSlot, ['create', 'find']);

  ParkSlot.createParkSlotList = async (carsize, amount, cb) => {
    try {
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
        return cb();
        // return;
      }
      for (let i = 0; i < amount; i++) {
        let slotData = await ParkSlot.create(
          {
            "carSize": createdCarSize
          });
        if (slotData) {
          let activityLog = {
            "status": "SUCCESS",
            "type": "CREATE_PARK_SLOT",
            "additionalData": JSON.stringify(slotData),
          }
          app.models.ActivityLog.create(activityLog);
          createdSlot.push(slotData);
        }
      }
      return cb(null, { statusCode: 200, statusMessage: 'SUCCESS', data: createdSlot });
      // return { statusCode: 200, statusMessage: 'SUCCESS', data: createdSlot };

    } catch (error) {
      let activityLog = {
        "status": "FAIL",
        "type": "CREATE_PARK_SLOT",
        "additionalData": JSON.stringify({
          carsize,
          amount,
          error
        }),
      }
      app.models.ActivityLog.create(activityLog);
      return cb({ message: error.message });
      // return { statusCode: 500, message: error.message };
    }
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
