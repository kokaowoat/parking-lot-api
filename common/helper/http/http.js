'use strict';

/**
 * More documentation
 * https://github.com/request/request-promise
 */
const rp = require('request-promise');

module.exports = {
  request: async (options) => {
    try {
      return await rp(
        Object.assign(
          {
            resolveWithFullResponse: true,
          },
          options,
        ),
      );
    } catch (e) {
      return e;
    }
  },
};
