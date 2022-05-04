//SERVER SETUP AND MIDDLEWARE
const express = require('express');
const app = express();
const PORT = 8080;

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set('view engine', 'ejs');

// const cookieParser = require('cookie-parser');
// app.use(cookieParser());
const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['th1sismysecretkeythatyouwillnevergue$s']
}));
const bcrypt = require('bcryptjs');

//HELPER FUNCTIONS
const {
  generateRandomString,
  checkAbsoluteRoute,
  getUserIDByEmail,
  confirmUserLoggedIn,
  sortLinksByUserID
} = require('./helpers');


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
  const userID = req.session.user_id;
  const urls = sortLinksByUserID(userID, urlDatabase);
  const user = users[userID];
  const templateVars = { urls, user };
  const url = "urls_index";

  confirmUserLoggedIn(user, res, templateVars, url);



});

app.get("/urls/new", (req, res) => {
  const user = users[req.session.user_id];
  const templateVars = {
    user
  };

  const url = "urls_new";
  confirmUserLoggedIn(user, res, templateVars, url);



});

app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const user = users[req.session.user_id];
  const templateVars = {
    shortURL,
    user,
    urls: urlDatabase,
    longURL: urlDatabase[shortURL].longURL,
  };

  //Ensures the shortURL exists if typed by user and redirects to /urls if not
  const url =   templateVars.urls[shortURL] ? res.render('urls_show', templateVars) : res.redirect(302, '/urls');

  confirmUserLoggedIn(user, res, templateVars, url);

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
  const user = users[req.session.user_id];
  const templateVars = {
    user,
    //Next two variables are used for user alert in case of incomplete submission or existing email
    incorrectForm: false,
    existingEmail:false
  };

  if (user) {
    return res.redirect(302, '/urls');
  }
  res.render('register', templateVars);
  
});

app.get('/login', (req, res) => {
  const user = users[req.session.user_id];
  const templateVars = {
    user,
    //Parameters below required for error handling (see login POST request)
    incorrectPasswordOrEmail: false,
    errorLoginNeeded: false
  };
  if (user) {
    return res.redirect(302, '/urls');
  }
  res.render('login', templateVars);
});

//POST REQUESTS
app.post('/urls/:shortURL/delete', (req, res) => {
  const user = users[req.session.user_id];
  const shortURL = req.params.shortURL;
  const templateVars = { user, shortURL};

  const userLinks = sortLinksByUserID(req.session.user_id, urlDatabase);

  //Do not redirect from confirmUserLoggedIn
  const url = null;
  confirmUserLoggedIn(user, res, templateVars, url);

  // Ensures only users with the right permissions can delete urls
  if (user) {
    for (const eachShortURL in userLinks) {
      if (eachShortURL === shortURL) {
        delete urlDatabase[shortURL];
      }
    }
  } else {
    return res.status(400).send('<h1>You do not have permission to delete that URL</h1>');
  }


  res.redirect(302, "/urls");
});

app.post('/urls/:shortURL/edit', (req, res) => {
  const user = users[req.session.user_id];
  //Ensures paths to new websites are absolute rather than relative
  const newURL = checkAbsoluteRoute(req.body.newURL);
  const shortURL = req.params.shortURL;

  //const templateVars = { user, shortURL};

  // Ensures only users with the right permissions can edit urls
  const userLinks = sortLinksByUserID(req.session.user_id, urlDatabase);
    
  if (user) {
    for (const eachShortURL in userLinks) {
      if (eachShortURL === shortURL) {
        urlDatabase[shortURL] = {
          longURL: newURL,
          userID: user.id
        };
      }
    }
  } else {
    return res.status(400).send('<h1>You do not have permission to delete that URL</h1>');
  }

  res.redirect(302, '/urls');
});

app.post('/urls', (req, res) => {
  const user = users[req.session.user_id];
  //const templateVars = { user };

  if (user) {
    const shortURL = generateRandomString();
    // Ensures paths to new websites are absolute rather than relative
    const newURL = checkAbsoluteRoute(req.body.longURL);

    urlDatabase[shortURL] = {
      longURL: newURL,
      userID: req.session.user_id
    };
    return res.redirect(302, '/urls');
  }

  return res.status(400).send("<h1>You must be logged in to create new URLs.</h1>");
  
  
});

app.post('/register', (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  //Checks to ensure the email and password fields are not blank. If they are, returns the register page with an alert banner
  if (!email || !password) {
    const templateVars = {
      incorrectForm: true,
      existingEmail: false,
      user: users[req.session.user_id]
    };
    res.status(400).render('register', templateVars);
  }

  //Checks to ensure the email does not already exist in the database. If it does, returns the register page with an alert banner
  if (getUserIDByEmail(email, users)) {
    const templateVars = {
      existingEmail: true,
      incorrectForm: false,
      user: users[req.session.user_id]
    };

    res.status(400).render('register', templateVars);
  }
  //If checks pass, creates a new user with a randomly generated ID and the provided email and password, then sets a cookie on the client's browser with the user_id
  users[id] = {
    id,
    email,
    hashedPassword
  };

  req.session.user_id = id;
  res.redirect(302, '/urls');
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  //Will have the user_id of an existing email, or false otherwise
  const existingEmail = getUserIDByEmail(email, users);

  if (existingEmail) {
    //Logs in if password correct
    if (bcrypt.compareSync(password, users[existingEmail].hashedPassword)) {
      req.session.user_id = existingEmail;
      return res.redirect(302, '/urls');
    }
    //Renders login page with incorrect password or email error if password is incorrect
    const templateVars = {
      user: users[req.session.user_id],
      incorrectPasswordOrEmail: true,
      errorLoginNeeded: false
    };
    return res.status(403).render('login', templateVars);
  }
  //Renders the login page with incorrect password or email error if email does not exist
  const templateVars = {
    user: users[req.session.user_id],
    incorrectPasswordOrEmail: true,
    errorLoginNeeded: false
  };

  res.status(403).render('login', templateVars);

});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect(302, '/login');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

