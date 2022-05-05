//HELPER FUNCTIONS
const generateRandomString = () => {
  let randomOutput = Math.random().toString(36); //Generates a pseudo-random number and turns it into a string
  return randomOutput.substring(2, 8); //Returns six characters from the middle of the string for increased randomization
};

const checkAbsoluteRoute = (newURL) => {
  if (newURL.substring(0,7) !== "http://" && newURL.substring(0,8) !== "https://") {
    return newURL = "http://" + newURL;
  }
  return newURL;
};

//Checks an email exists and returns ID if possible and false if the email does not exist
const getUserIDByEmail = (email, database) => {
  for (const user in database) {
    if (database[user].email === email) {
      return user;
    }
  }
  return false;
};


const confirmUserLoggedIn = (user, res, templateVars, url) => {
  if (!user) {
    return res.status(400).render('login_needed', templateVars);
  }
  return res.render(url, templateVars);
};


//Sorts through the database (which has shortURL as keys) and returns all the shortURLs associated with the userID passed
const sortLinksByUserID = (userID, database) => {
  let userURLs = {};
  for (const shortURL in database) {
    if (database[shortURL].userID === userID) {
      userURLs[shortURL] = { [shortURL]: database[shortURL].longURL };
    }
  }
  return userURLs;
};

module.exports = {
  generateRandomString,
  checkAbsoluteRoute,
  getUserIDByEmail,
  confirmUserLoggedIn,
  sortLinksByUserID
};