'use strict';

const disable = require('../../common/helper').disableHelper;
const rq = require('../../common/helper').httpHelper;
const app = require('../server');

module.exports = function(ParkSlot) {
  disable.disableAllMethods(ParkSlot);

  ParkSlot.createParkSlotList = async (carsize, amount, cb) => {
    try {
      const createdCarSize = carsize ? carsize.toUpperCase() : null;
      const createdSlot = [];
      if (!createdCarSize || !amount || createdCarSize.replace(/\s/g, '') === '') {
        const activityLog = {
          'status': 'FAIL',
          'type': 'CREATE_PARK_SLOT',
          'additionalData': JSON.stringify({
            carsize,
            amount,
          }),
        };
        app.models.ActivityLog.create(activityLog);
        throw new Error('Invalid parameter');
        // return;
      }
      for (let i = 0; i < amount; i++) {
        const slotData = await ParkSlot.create(
          {
            'carSize': createdCarSize,
          });
        if (slotData) {
          const activityLog = {
            'status': 'SUCCESS',
            'type': 'CREATE_PARK_SLOT',
            'additionalData': JSON.stringify(slotData),
          };
          app.models.ActivityLog.create(activityLog);
          createdSlot.push(slotData);
        }
      }
      return cb(null, {statusCode: 200, statusMessage: 'SUCCESS', data: createdSlot});
      // return { statusCode: 200, statusMessage: 'SUCCESS', data: createdSlot };
    } catch (error) {
      const activityLog = {
        'status': 'FAIL',
        'type': 'CREATE_PARK_SLOT',
        'additionalData': JSON.stringify({
          carsize,
          amount,
          error,
        }),
      };
      app.models.ActivityLog.create(activityLog);
      throw new Error(error.message);
    }
  };

  ParkSlot.remoteMethod('createParkSlotList', {
    http: {
      path: '/slot-list',
      verb: 'post',
    },
    accepts: [
      {arg: 'carsize', type: 'string', 'required': true},
      {arg: 'amount', type: 'number', 'required': true},
    ],
    returns: {arg: 'data', type: 'object', root: true},
  });

  ParkSlot.park = async (carSize, plateNumber, cb) => {
    try {
      // Find/Create Car
      const car = await app.models.Car.findOrCreateCar(plateNumber, carSize.toUpperCase());
      if (!car) {
        return 'Cannot find or create car';
      }
      if (car.size !== carSize.toUpperCase()) {
        return `Car size are not match (database: ${car.size} | input parameter: ${carSize.toUpperCase()})`;
      }

      // Check is car exist in park slot
      const isCarExistPark = await ParkSlot.isCarExistInSlot(plateNumber);
      if (isCarExistPark) {
        return `Car (plate number: ${plateNumber}) has already existed in park slot`;
      }

      // Get Park Slot from nearest by car_size
      const freeSlot = await ParkSlot.findNearestSlot(car.size);
      if (!freeSlot) {
        return 'Cannot find empty slot or slots are full';
      }

      // Update Park Slot
      const park = await freeSlot.updateAttributes(
        {
          id: freeSlot.id,
          isPark: true,
          plateNumber: car.plateNumber,
          updatedAt: (new Date()).toISOString(),
        }
      );
      if (!park) {
        return 'Cannot park the car';
      }

      // Create Ticket
      const ticket = await app.models.Ticket.createTicket(car.plateNumber);
      if (!ticket) {
        return 'Cannot create ticket';
      }

      // Activity Log
      const parkResponse = {
        ticketId: ticket.id,
        slotId: park.id,
        plateNumber: ticket.plateNumber,
        clockIn: ticket.clockIn,
        carSize: car.size,
        slotNumber: park.number,
      };
      const activityLog = {
        'status': 'SUCCESS',
        'type': 'PARK_CAR',
        'additionalData': JSON.stringify({
          ...parkResponse,
        }),
      };
      app.models.ActivityLog.create(activityLog);
      return cb(null, parkResponse);
    } catch (error) {
      const activityLog = {
        'status': 'FAIL',
        'type': 'PARK_CAR',
        'additionalData': JSON.stringify({
          carSize,
          plateNumber,
          error,
        }),
      };
      app.models.ActivityLog.create(activityLog);
      throw new Error(error.message);
    }
  };

  ParkSlot.remoteMethod('park', {
    http: {
      path: '/park',
      verb: 'post',
    },
    accepts: [
      {arg: 'carSize', type: 'string', 'required': true},
      {arg: 'plateNumber', type: 'string', 'required': true},
    ],
    returns: {arg: 'data', type: 'object', root: true},
  });

  ParkSlot.leave = async (plateNumber, cb) => {
    try {
      // Get ticket by plateNumber orderby latest
      const ticket = await app.models.Ticket.getLatestTicket(plateNumber);
      if (!ticket) {
        return 'Cannot find ticket';
      }

      // Update ticket
      const updateTicket = await app.models.Ticket.updateLeave(ticket);
      if (!updateTicket) {
        return 'Cannot update ticket';
      }

      // Update Park Slot
      const parkedSlot = await ParkSlot.findParkedSlotByPlateNumber(plateNumber);
      if (!parkedSlot) {
        return `Cannot find parked slot by plate number: ${plateNumber}`;
      }

      const leaveSlot = await parkedSlot.updateAttributes(
        {
          id: parkedSlot.id,
          isPark: false,
          plateNumber: null,
          updatedAt: (new Date()).toISOString(),
        }
      );
      if (!leaveSlot) {
        return 'Cannot leave park slot';
      }

      // Activity log
      const leaveResponse = {
        ticketId: ticket.id,
        slotId: parkedSlot.id,
        plateNumber: ticket.plateNumber,
        clockIn: ticket.clockIn,
        clockOut: ticket.clockOut,
        carSize: parkedSlot.carSize,
        slotNumber: parkedSlot.number,
      };
      const activityLog = {
        'status': 'SUCCESS',
        'type': 'LEAVE_CAR',
        'additionalData': JSON.stringify({
          ...leaveResponse,
        }),
      };
      app.models.ActivityLog.create(activityLog);
      return cb(null, leaveResponse);
    } catch (error) {
      const activityLog = {
        'status': 'FAIL',
        'type': 'LEAVE_CAR',
        'additionalData': JSON.stringify({
          plateNumber,
          error,
        }),
      };
      app.models.ActivityLog.create(activityLog);
      throw new Error(error.message);
    }
  };

  ParkSlot.remoteMethod('leave', {
    http: {
      path: '/leave',
      verb: 'post',
    },
    accepts: [
      {arg: 'plateNumber', type: 'string', 'required': true},
    ],
    returns: {arg: 'data', type: 'object', root: true},
  });

  ParkSlot.findNearestSlot = async (carSize, cb) => {
    const avaliableParkSlot = await ParkSlot.find({
      where: {
        carSize: carSize,
        isPark: false,
        isAvailable: true,
      },
      order: 'number ASC',
      limit: 1,
    });
    return avaliableParkSlot.length > 0 ? avaliableParkSlot[0] : null;
  };

  ParkSlot.remoteMethod('findNearestSlot', {
    http: {
      path: '/nearest-park-slot',
      verb: 'get',
    },
    accepts: [
      {arg: 'carSize', type: 'string', 'required': true},
    ],
    returns: {arg: 'data', type: 'object', root: true},
  });

  ParkSlot.findParkedSlotByPlateNumber = async (plateNumber) => {
    // TODO check must be only 1 slot
    const parkedSlot = await ParkSlot.find({
      where: {
        plateNumber: plateNumber,
      },
    });
    return parkedSlot.length > 0 ? parkedSlot[0] : null;
  };

  ParkSlot.getStatus = async (carSize) => {
    const parkSlot = await ParkSlot.find(
      {
        where: {carSize: carSize ? carSize.toUpperCase() : undefined},
        fields: {
          number: true,
          carSize: true,
          isPark: true,
          isAvailable: true,
        },
        order: ['carSize ASC', 'number ASC'],
      }
    );

    return parkSlot;
  };

  ParkSlot.remoteMethod('getStatus', {
    http: {
      path: '/status',
      verb: 'get',
    },
    accepts: [
      {arg: 'carSize', type: 'string', 'required': false},
    ],
    returns: {arg: 'data', type: 'object', root: true},
  });

  ParkSlot.isCarExistInSlot = async (plateNumber, cb) => {
    const car = await ParkSlot.find({
      where: {plateNumber: plateNumber},
    });
    if (car && car.length > 0) {
      return true;
    }
    return false;
  };
};
