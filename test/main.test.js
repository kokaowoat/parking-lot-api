const rq = require('../common/helper').httpHelper;

describe('Main unit test for Parking Lot API', () => {
  beforeEach(() => {
  });

  afterEach(() => {
  });

  test('Access root path', async () => {
    try {
      const response = await rq.request({
        method: 'GET',
        uri: 'http://localhost:3000',
      });
      expect(response.statusCode).toEqual(200);
    } catch (e) {
      console.log('error', e);
      throw new Error(e);
    }
  });
});