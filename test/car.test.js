const {...helper} = require('./../common/helper');

describe('Example for describe test suit', () => {
  beforeEach(() => {
  });

  afterEach(() => {
  });

  test('access root path', async () => {
    console.log('=== app ===');

    try {
      const response = await helper.httpHelper.request({
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

