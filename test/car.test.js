const rq = require('../common/helper').httpHelper;

describe('Car unit test', () => {
  beforeEach(() => {
  });

  afterEach(() => {
  });

  test('Get all cars', async () => {
    try {
      const response = await rq.request({
        method: 'GET',
        uri: 'http://localhost:3000/api/car',
      });
      expect(response.statusCode).toEqual(200);
    } catch (e) {
      throw new Error(e);
    }
  });

  test('Get cars by car size M', async () => {
    try {
      const response = await rq.request({
        method: 'GET',
        uri: 'http://localhost:3000/api/car/plate-number?carSize=M',
      });
      const data = await JSON.parse(response.body);
      let isTrueSize = true;
      data.map(car => {
        if (car.size !== 'M') {
          isTrueSize = false;
          return;
        }
      });
      expect(isTrueSize).toEqual(true);
    } catch (e) {
      throw new Error(e);
    }
  });
});

