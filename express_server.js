//SERVER SETUP AND MIDDLEWARE
const express = require('express');
const app = express();
const PORT = 8080;

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set('view engine', 'ejs');

const cookieParser = require('cookie-parser');
app.use(cookieParser());

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
const getUserByEmail = (newEmail) => {
  for (const user in users) {
    if (users[user].email === newEmail) {
      return user;
    }
  }
  return false;
};

const confirmUserLoggedIn = (user, res, templateVars) => {
  templateVars.incorrectPasswordOrEmail = false
  templateVars.errorLoginNeeded = true
  if (!user) {
   return res.status(400).render('login', templateVars);
  }
}

//Sorts through the database (which has shortURL as keys) and returns all the shortURLs associated with the userID passed
const sortLinksByUser = (userID) => {
  let userURLs = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === userID) {
      
      userURLs[shortURL] = { [shortURL]: urlDatabase[shortURL].longURL };
    }
  }
  return userURLs;
};

//DATABASES
const urlDatabase = {
  'b2xVn2': {
    longURL: "http://www.lighthouselabs.ca",
    userID: 'sampleUser'
  },
  '9sm5xK': {
    longURL: 'http://www.google.ca',
    userID: 'sampleUser'
  }
};

const users = {
  'sampleUser': {
    id: 'sampleUser',
    email: 'a@a',
    password: 'a'
  }
};

//GET REQUESTS
app.get('/', (req, res) => {
  res.redirect(302, '/urls');
});

app.get('/urls', (req, res) => {
  const user = req.cookies["user_id"];
  const urls = sortLinksByUser(user);
  const templateVars = {urls, user: users[req.cookies["user_id"]] };

  confirmUserLoggedIn(user, res, templateVars)

  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const templateVars = {
    user
  };

  confirmUserLoggedIn(user, res, templateVars)

  res.render("urls_new", templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const user = users[req.cookies["user_id"]];
  const templateVars = {
    shortURL,
    user,
    urls: urlDatabase,
    longURL: urlDatabase[shortURL].longURL,
  };

  confirmUserLoggedIn(user, res, templateVars)

  //Ensures the shortURL exists if typed by user and redirects to /urls if not
  templateVars.urls[shortURL] ? res.render('urls_show', templateVars) : res.redirect(302, '/urls');

});

app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  const templateVars = {
    shortURL,
    longURL,
    urls: urlDatabase,
  };

  //Ensures the shortURL exists if typed by user and redirects to /urls if not
  templateVars.urls[shortURL] ? res.redirect(302, longURL) : res.redirect(302, '/urls');
});

app.get('/register', (req, res) => {
  const user = users[req.cookies["user_id"]]
  const templateVars = {
    user,
    //Next two variables are used for user alert in case of incomplete submission or existing email
    incorrectForm: false,
    existingEmail:false
  };

  if (user) {
    res.redirect(302, '/urls')
  }
  res.render('register', templateVars);
  
});

app.get('/login', (req, res) => {
  const user = users[req.cookies["user_id"]];
  const templateVars = {
    user,
    //Parameters below required for error handling (see login POST request)
    incorrectPasswordOrEmail: false,
    errorLoginNeeded: false
  };
  if (user) {
    res.redirect(302, '/urls')
  }
  res.render('login', templateVars);
});

//POST REQUESTS
app.post('/urls/:shortURL/delete', (req, res) => {
  const user = users[req.cookies["user_id"]];
  const shortURL = [req.params.shortURL];
  const templateVars = { user, shortURL}

  confirmUserLoggedIn(user, res, templateVars)

  delete urlDatabase[shortURL];
  res.redirect(302, "/urls");
});

app.post('/urls/:shortURL/edit', (req, res) => {
  const user = users[req.cookies["user_id"]];
  //Ensures paths to new websites are absolute rather than relative
  const newURL = checkAbsoluteRoute(req.body.newURL);
  const shortURL = [req.params.shortURL];

  const templateVars = { user, shortURL}

  confirmUserLoggedIn(user, res, templateVars)

  urlDatabase[shortURL] = {
    longURL: newURL,
    userID: user.id
  };
  res.redirect(302, '/urls');
});

app.post('/urls', (req, res) => {

  const templateVars = {
    user: users[req.cookies["user_id"]],
    incorrectPasswordOrEmail: false,
    errorLoginNeeded: true
  };

  if (templateVars.user) {
    const shortURL = generateRandomString();
    // Ensures paths to new websites are absolute rather than relative
    const newURL = checkAbsoluteRoute(req.body.longURL);

    urlDatabase[shortURL] = {
      longURL: newURL,
      userID: templateVars.user.id
    };
    console.log(urlDatabase[shortURL]);
    res.redirect(302, '/urls');
  }

  res.status(400).render('login', templateVars);
  
  
});

app.post('/register', (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;

  //Checks to ensure the email and password fields are not blank. If they are, returns the register page with an alert banner
  if (!email || !password) {
    const templateVars = {
      incorrectForm: true,
      existingEmail: false,
      user: users[req.cookies["user_id"]]
    };
    res.status(400).render('register', templateVars);
  }

  //Checks to ensure the email does not already exist in the database. If it does, returns the register page with an alert banner
  if (getUserByEmail(email)) {
    const templateVars = {
      existingEmail: true,
      incorrectForm: false,
      user: users[req.cookies["user_id"]]
    };

    res.status(400).render('register', templateVars);
  }
  //If checks pass, creates a new user with a randomly generated ID and the provided email and password, then sets a cookie on the client's browser with the user_id
  users[id] = {
    id,
    email,
    password
  };

  res.cookie('user_id', id);
  res.redirect(302, '/urls');
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  //Will have the user_id of an existing email, or false otherwise
  const existingEmail = getUserByEmail(email);

  if (existingEmail) {
    //Logs in if password correct
    if (users[existingEmail].password === password) {
      res.cookie('user_id', existingEmail);
      res.redirect(302, '/urls');
    }
    //Renders login page with incorrect password or email error if password is incorrect
    const templateVars = {
      user: users[req.cookies["user_id"]],
      incorrectPasswordOrEmail: true,
      errorLoginNeeded: false
    };
    res.status(403).render('login', templateVars);
  }
  //Renders the login page with incorrect password or email error if email does not exist
  const templateVars = {
    user: users[req.cookies["user_id"]],
    incorrectPasswordOrEmail: true,
    errorLoginNeeded: false
  };

  res.status(403).render('login', templateVars);

});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect(302, '/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

