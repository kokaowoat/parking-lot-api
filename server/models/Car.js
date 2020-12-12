'use strict';

const disable = require('../../common/helper').disableHelper;
const rq = require('../../common/helper').httpHelper;

module.exports = function (Car) {
  disable.disableAllMethods(Car, ['create', 'find']);

  Car.getPlaterNumberList = async (carSize, cb) => {
    const cars = await Car.find(
      {
        where: { size: carSize? carSize.toUpperCase(): undefined },
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
};
