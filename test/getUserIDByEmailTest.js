const { assert } = require('chai');

const { getUserIDByEmail } = require('../helpers');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserIDByEmail', () => {
  it('should return a user with valid email', () => {
    const user = getUserIDByEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    assert.equal(user, expectedUserID);
  });
  it('should return false when passed an email that is not in the database', () => {
    const user = getUserIDByEmail("not@exists.com", testUsers);
    const expectedUserID = false;
    assert.equal(user, expectedUserID);
  })
  it('should return false when passed an existing email but an incorrect database', () => {
    const fakeDatabase = {}
    const user = getUserIDByEmail("user@example.com", fakeDatabase);
    const expectedUserID = false;
    assert.equal(user, expectedUserID);
  })
});