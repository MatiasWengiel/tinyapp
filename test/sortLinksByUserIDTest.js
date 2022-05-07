const { assert } = require('chai');
const { sortLinksByUserID } = require('../helpers');

const urlDatabase = {
  'b2xVn2': {
    longURL: "http://www.lighthouselabs.ca",
    userID: 'sampleUser'
  },
  '9sm5xK': {
    longURL: 'http://www.google.ca',
    userID: 'sampleUser'
  },
  'testingOne': {
    longURL: 'http://www.nhl.com',
    userID: 'testingUser'
  },
  'testingTwo': {
    longURL: 'http://flex-web.compass.lighthouselabs.ca',
    userID: 'testingUser'
  }
};

const fakeDatabase = "";

describe('sortLinksByUserID', () => {
  it('should return an object with the pattern { shortURL{ shortURL:longURL  } }parameters of the passed userID and no others', () => {
    const userID = 'sampleUser';
    const database = urlDatabase;
    const expectedOutput = {
      b2xVn2: { b2xVn2: 'http://www.lighthouselabs.ca'},
      '9sm5xK': {'9sm5xK': 'http://www.google.ca' }
    };
    assert.deepEqual(sortLinksByUserID(userID, database), expectedOutput);
  });
  it('should return an empty object if passed an inexistent userID', () => {
    const userID = 'fakeUser';
    const database = urlDatabase;
    const expectedOutput = {};
    assert.deepEqual(sortLinksByUserID(userID, database), expectedOutput);
  });
  it('should return an empty object if passed the wrong database', () => {
    const userID = 'sampleUser';
    const database = fakeDatabase;
    const expectedOutput = {};
    assert.deepEqual(sortLinksByUserID(userID, database), expectedOutput);
  });
});