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
          clockIn: (new Date()).toISOString(),
        }
      );

      if (ticket) {
        const activityLog = {
          'status': 'SUCCESS',
          'type': 'CREATE_TICKET',
          'additionalData': JSON.stringify(ticket),
        };
        app.models.ActivityLog.create(activityLog);
        return ticket;
      } else {
        return null;
      }
    } catch (error) {
      const activityLog = {
        'status': 'FAIL',
        'type': 'CREATE_TICKET',
        'additionalData': JSON.stringify({
          plateNumber: plateNumber,
          clockIn: (new Date()).toISOString(),
          error,
        }),
      };
      app.models.ActivityLog.create(activityLog);
      throw new Error(error.message);
    }
  };

  Ticket.updateLeave = async (ticket, cb) => {
    try {
      const updateTicket = await ticket.updateAttributes(
        {
          id: ticket.id,
          clockOut: (new Date()).toISOString(),
          updatedAt: (new Date()).toISOString(),
        }
      );
      const activityLog = {
        'status': 'SUCCESS',
        'type': 'UPDATE_LEAVE_TICKET',
        'additionalData': JSON.stringify(updateTicket),
      };
      app.models.ActivityLog.create(activityLog);
      return updateTicket;
    } catch (error) {
      const activityLog = {
        'status': 'FAIL',
        'type': 'UPDATE_LEAVE_TICKET',
        'additionalData': JSON.stringify({
          ticket,
          error,
        }),
      };
      app.models.ActivityLog.create(activityLog);
      throw new Error(error.message);
    }
  };

  Ticket.getLatestTicket = async (plateNumber) => {
    const lastestTicket = await Ticket.find({
      where: {
        plateNumber: plateNumber,
      },
      order: 'createdAt DESC',
      limit: 1,
    });
    return lastestTicket.length > 0 ? lastestTicket[0] : null;
  };
};
