'use strict';

const disable = require('../../common/helper').disableHelper;
const rq = require('../../common/helper').httpHelper;
const app = require('../server');

module.exports = function(Ticket) {
  disable.disableAllMethods(Ticket, ['find']);

  Ticket.createTicket = async (plateNumber, cb) => {
    try {
      const ticket = await Ticket.create(
        {
          plateNumber: plateNumber,
          clockIn: (new Date()).toISOString()
        }
      );

      if (ticket) {
        let activityLog = {
          "status": "SUCCESS",
          "type": "CREATE_TICKET",
          "additionalData": JSON.stringify(ticket),
        }
        app.models.ActivityLog.create(activityLog);
        return ticket;
      } else {
        return null;
      }
    } catch (error) {
      console.log('errrrrr', error);
      let activityLog = {
        "status": "FAIL",
        "type": "CREATE_TICKET",
        "additionalData": JSON.stringify({
          plateNumber: plateNumber,
          clockIn: (new Date()).toISOString()
        }),
      }
      app.models.ActivityLog.create(activityLog);
      return cb(error);
    }
  }

  Ticket.getLatestTicket = async(plateNumber) => {
    const lastestTicket = await Ticket.find({
      where: {
        plateNumber: plateNumber,
      },
      order: 'createdAt DESC',
      limit: 1
    });
    return lastestTicket.length > 0 ? lastestTicket[0] : null;
  }
};