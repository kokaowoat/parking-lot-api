'use strict';

const disable = require('../../common/helper').disableHelper;
const rq = require('../../common/helper').httpHelper;
const app = require('../server');

module.exports = function (Car) {
  disable.disableAllMethods(Car, ['create', 'find']);

  Car.getPlaterNumberList = async (carSize, cb) => {
    const cars = await Car.find(
      {
        where: { size: carSize ? carSize.toUpperCase() : undefined },
        fields: {
          plateNumber: true,
          size: true
        },
        order: ['size ASC', 'plateNumber ASC'],
      }
    );
    return cars;
  }

  Car.remoteMethod('getPlaterNumberList', {
    http: {
      path: '/plate-number',
      verb: 'get',
    },
    accepts: [
      { arg: 'carSize', type: 'string', 'required': false },
    ],
    returns: { arg: 'data', type: 'object', root: true },
  });

  Car.findOrCreateCar = async (plateNumber, carSize, cb) => {
    try {
      const carRes = await app.models.Car.findOrCreate(
        {
          where: {
            plateNumber: plateNumber
          }
        },
        {
          plateNumber,
          size: carSize.toUpperCase()
        });

      const car = carRes[0];
      if (car) {
        let activityLog = {
          "status": "SUCCESS",
          "type": "FIND_CREATE_CAR",
          "additionalData": JSON.stringify(car),
        }
        app.models.ActivityLog.create(activityLog);
        return car;
      } else {
        return null;
      }
    } catch (error) {
      let activityLog = {
        "status": "FAIL",
        "type": "FIND_CREATE_CAR",
        "additionalData": JSON.stringify({
          plateNumber: plateNumber, 
          carSize: carSize
        }),
      }
      app.models.ActivityLog.create(activityLog);
      throw new Error(error.message);
    }
  }
};
