const { assert } = require('chai');

const { checkAbsoluteRoute } = require('../helpers');

describe('checkAbsoluteRoute', () => {
  it('should return the same URL if the user inputs it using an absolute route', () => {
    const url = 'http://www.google.ca';
    const expectedURL = 'http://www.google.ca';
    assert.equal(checkAbsoluteRoute(url), expectedURL);
  });
  it('should return the an absolute rote to the  URL if the user inputs it using a relative route', () => {
    const url = 'www.google.ca';
    const expectedURL = 'http://www.google.ca';
    assert.equal(checkAbsoluteRoute(url), expectedURL);
  });
  it('should return the absolute route to the URL if the user inputs a relative url that starts with http', () => {
    const url = 'httptricks.com';
    const expectedURL = 'http://httptricks.com';
    assert.equal(checkAbsoluteRoute(url), expectedURL);
  });
});