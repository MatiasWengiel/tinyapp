const { assert } = require('chai');
const { generateRandomString } = require('../helpers');

describe('generateRandomString', () => {
  it('should return a string', () => {
    const randomString = generateRandomString();
    const expectedOutput = 'string';
    assert.equal(typeof randomString, expectedOutput);
  });
  
  it('should not return any two identical strings out of 1000 generated strings (as a proxy for testing for "randomness", since there are over 58 million possible combinations)', () => {
    const arrayOfRandomStrings = [];
    const hundredRandomStrings = () => {
      let i = 0;
      while (i <= 1000) {
        arrayOfRandomStrings.push(generateRandomString());
        i++;
      }
    };
    //Run to create the array
    hundredRandomStrings();

    const randomChecker = (array) => {
      for (let firstRunThrough = 0; firstRunThrough < array.length; firstRunThrough++) {
        for (let secondRunThrough = firstRunThrough + 1; secondRunThrough < array.length; secondRunThrough++) {
          if (array[firstRunThrough] === array[secondRunThrough]) {
            return false;
          }
        }
      }
      return true;
    };

    assert.equal(randomChecker(arrayOfRandomStrings), true);
  });
});