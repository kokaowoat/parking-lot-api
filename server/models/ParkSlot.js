'use strict';

const disable = require('../../common/helper').disableHelper;
const rq = require('../../common/helper').httpHelper;
const app = require('../server');

module.exports = function (ParkSlot) {
  disable.disableAllMethods(ParkSlot, ['find']);

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

  ParkSlot.park = async (carsize, plateNumber, cb) => {
    try {
      // Create / Find Car
      const carRes = await app.models.Car.findOrCreate(
        {
          where: {
            plateNumber: plateNumber
          }
        },
        {
          plateNumber,
          size: carsize
        });
      // TODO check if error
      const car = carRes[0];

      // Create Ticket
      // TODO check if error
      const ticket = await app.models.Ticket.create(
        {
          plateNumber: car.plateNumber,
          clockIn: (new Date()).toISOString()
        }
      );
      console.log('ticketRes>>', ticket);
      // Get Park Slot from nearest by car_size
      const freeSlot = await ParkSlot.findNearestSlot(car.size);
      console.log('avaliableParkSlot>>>', freeSlot);

      // Update Park Slot
      const park = await freeSlot.updateAttributes(
        {
          id: freeSlot.id,
          isPark: true,
          plateNumber: car.plateNumber,
          updatedAt: (new Date()).toISOString()
        }
      );
      console.log('park>>>', park);
      const parkResponse = {
        ticketId: ticket.id,
        slotId: park.id,
        plateNumber: ticket.plateNumber,
        clockIn: ticket.clockIn,        
        carSize: car.size,
        slotNumber: park.number
      }
      let activityLog = {
        "status": "SUCCESS",
        "type": "PARK_CAR",
        "additionalData": JSON.stringify({
          ...parkResponse
        }),
      }
      app.models.ActivityLog.create(activityLog);
      return cb(null, parkResponse);
    } catch (error) {
      let activityLog = {
        "status": "FAIL",
        "type": "PARK_CAR",
        "additionalData": JSON.stringify({
          carsize,
          plateNumber,
          error
        }),
      }
      app.models.ActivityLog.create(activityLog);
      return cb({ message: error.message });
    }
  }

  ParkSlot.remoteMethod('park', {
    http: {
      path: '/park',
      verb: 'post',
    },
    accepts: [
      { arg: 'carsize', type: 'string', 'required': true },
      { arg: 'plateNumber', type: 'string', 'required': true },
    ],
    returns: { arg: 'data', type: 'object', root: true },
  });

  ParkSlot.findNearestSlot = async (carSize) => {
    const avaliableParkSlot = await ParkSlot.find({
      where: {
        carSize: carSize,
        isPark: false,
        isAvailable: true
      },
      order: 'number ASC',
      limit: 1
    });
    return avaliableParkSlot.length > 0 ? avaliableParkSlot[0] : null;
  }

  ParkSlot.remoteMethod('findNearestSlot', {
    http: {
      path: '/nearest-park-slot',
      verb: 'get',
    },
    accepts: [
      { arg: 'carSize', type: 'string', 'required': true },
    ],
    returns: { arg: 'data', type: 'object', root: true },
  });

  ParkSlot.findParkedSlotByPlateNumber = async (plateNumber) => {
    // TODO check must be only 1 slot
    const parkedSlot = await ParkSlot.find({
      where: {
        plateNumber: plateNumber
      }
    });
    return parkedSlot.length > 0 ? parkedSlot[0] : null;
  }  
};
