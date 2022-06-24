const expect = require('chai').expect;
const assert = require('chai').assert;
const axios = require('axios');
require("../index");

const requestPayload = [ 
  {
    "FL_ACCOUNT": "123456",
    "FL_CURRENCY": "SGD",
    "FL_AMOUNT": 10
  }
];

const responsePayload = [
  {
    FIN_ACCOUNT: '123456',
    FIN_CURRENCY: 'SGD',
    FIN_DEBIT: 0,
    FIN_CREDIT: 10
  }
];

const url = 'http://localhost:3001/transform-account';

describe('transform transaction api', () => {

  it('returns status 200', async () => {

    const response = await axios.post(url, requestPayload);
    expect(response?.status).to.equal(200);

  });

  it('returns status is 400', async () => {

    try {
      await axios.post(url, []);
    } catch (error) {
      expect(error?.response?.status).to.equal(400);
    }

  });

  it('returns correct data', async () => {

    const response = await axios.post(url, requestPayload);
    console.log('response', response.data);
    assert(Array.isArray(response.data), true);
    expect(response?.data).have.deep.members(responsePayload);

  });

});
