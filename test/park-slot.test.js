const rq = require('../common/helper').httpHelper;

describe('Park slot unit test', () => {
  beforeEach(() => {
  });

  afterEach(() => {
  });

  test('Get all park slot status', async () => {
    try {
      const response = await rq.request({
        method: 'GET',
        uri: 'http://localhost:3000/api/park-slot/status',
      });
      expect(response.statusCode).toEqual(200);
    } catch (e) {
      console.log('error', e);
      throw new Error(e);
    }
  });

  test('Get all park slot status by car size M', async () => {
    try {
      const response = await rq.request({
        method: 'GET',
        uri: 'http://localhost:3000/api/park-slot/status?carSize=M',
      });
      const data = await JSON.parse(response.body);
      let isTrueSize = true;
      data.map(parkSlot => {
        if (parkSlot.carSize !== 'M') {
          isTrueSize = false;
          return;
        }
      });
      expect(isTrueSize).toEqual(true);
    } catch (e) {
      console.log('error', e);
      throw new Error(e);
    }
  });

  test('Get nearest park slot by car size M', async () => {
    try {
      const response = await rq.request({
        method: 'GET',
        uri: 'http://localhost:3000/api/park-slot/nearest-park-slot?carSize=M',
      });
      const data = await JSON.parse(response.body);
      let isValidSlot = true;
      if (data.carSize !== 'M' || data.isPark !== false || data.isAvailable !== true) {
        isValidSlot = false;
        return;
      }
      expect(isValidSlot).toEqual(true);
    } catch (e) {
      throw new Error(e);
    }
  });
});