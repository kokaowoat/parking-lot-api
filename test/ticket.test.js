const rq = require('../common/helper').httpHelper;

describe('Ticket unit test', () => {
  beforeEach(() => {
  });

  afterEach(() => {
  });

  test('Get all tickets', async () => {
    try {
      const response = await rq.request({
        method: 'GET',
        uri: 'http://localhost:3000/api/ticket',
      });
      expect(response.statusCode).toEqual(200);
    } catch (e) {
      console.log('error', e);
      throw new Error(e);
    }
  });
});