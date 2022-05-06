//SERVER SETUP AND MIDDLEWARE
const express = require('express');
const app = express();
const PORT = 8080;
app.use(express.static('public'));

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set('view engine', 'ejs');

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

const getVariables = (req) => {
  const userID = req.session.user_id;
  const user = users[userID];
  const urls = sortLinksByUserID(userID, urlDatabase);
  const shortURL = req.params.shortURL;

  return {
    userID,
    user,
    urls,
    shortURL
  };
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

app.use((req, res, next) => {
  getVariables(req);
  next();
});
//GET REQUESTS
app.get('/', (req, res) => {
  res.redirect(302, '/urls');
});

app.get('/urls', (req, res) => {
  const vars = getVariables(req);
  const url = "urls_index";

  confirmUserLoggedIn(vars.user, res, vars, url);
});

app.get("/urls/new", (req, res) => {
  const vars = getVariables(req);
  const url = "urls_new";

  confirmUserLoggedIn(vars.user, res, vars, url);
});

app.get('/urls/:shortURL', (req, res) => {
  const vars = getVariables(req);

  //Checks to see if the shortURL exists in the database
  if (!urlDatabase[vars.shortURL]) {
    return res.redirect(404, '/404_page');
  }
  //longURL can't be obtained with getVariables directly
  vars.longURL = urlDatabase[vars.shortURL].longURL;
  const url =   'urls_show';

  confirmUserLoggedIn(vars.user, res, vars, url);

});

app.get('/u/:shortURL', (req, res) => {
  const vars = getVariables(req);

  //Checks to see if the shortURL exists in the database
  if (!urlDatabase[vars.shortURL]) {
    return res.redirect(404, '/404_page');
  }
  
  const longURL = urlDatabase[vars.shortURL].longURL;
  vars.longURL = longURL;

  //Ensures the shortURL exists if typed by user and redirects to /urls if not
  vars.urls[vars.shortURL] ? res.redirect(302, longURL) : res.redirect(302, '/urls');
});

app.get('/register', (req, res) => {
  const user = users[req.session.user_id];
  const registerVars = {
    user,
    //Next two variables are used for user alert in case of incomplete submission or existing email (see POST request)
    incorrectForm: false,
    existingEmail:false
  };

  if (user) {
    return res.redirect(302, '/urls');
  }
  res.render('register', registerVars);
  
});

app.get('/login', (req, res) => {
  const user = users[req.session.user_id];
  const loginVars = {
    user,
    //Parameters below required for error handling (see login POST request)
    incorrectPasswordOrEmail: false,
    errorLoginNeeded: false
  };
  if (user) {
    return res.redirect(302, '/urls');
  }
  res.render('login', loginVars);

});

app.get('/404_page', (req, res) => {
  const vars = getVariables(req);

  res.render('404_page', vars);
});

//POST REQUESTS
app.post('/urls/:shortURL/delete', (req, res) => {
  const vars = getVariables(req);

  //Checks to see if the shortURL exists in the database
  if (!urlDatabase[vars.shortURL]) {
    return res.redirect(404, '/404_page');
  }

  // Ensures only users with the right permissions can delete urls
  if (vars.user) {
    for (const eachShortURL in vars.urls) {
      if (eachShortURL === vars.shortURL) {
        delete urlDatabase[vars.shortURL];
      }
    }
  } else { //No page rendered since this POST request can only be reached through website (which will require login) or curl command/web trawler that cannot render pages
    return res.status(400).send('<h1>You do not have permission to delete that URL</h1>');
  }

  res.redirect(302, "/urls");
});

app.post('/urls/:shortURL/edit', (req, res) => {
  const vars = getVariables(req);
  const newURL = checkAbsoluteRoute(req.body.longURL);

  //Checks to see if the shortURL exists in the database
  if (!urlDatabase[vars.shortURL]) {
    return res.redirect(404, '/404_page');
  }
  
  // Ensures only users with the right permissions can edit urls
    
  if (vars.user) {
    for (const eachShortURL in vars.urls) {
      if (eachShortURL === vars.shortURL) {
        urlDatabase[vars.shortURL] = {
          longURL: newURL,
          userID: vars.user.id
        };
      }
    }
  } else { //No page rendered since this POST request can only be reached through website (which will require login) or curl command/web trawler that cannot render pages
    return res.status(400).send('<h1>You do not have permission to delete that URL</h1>');
  }

  res.redirect(302, '/urls');
});

app.post('/urls', (req, res) => {
  const vars = getVariables(req);

  if (vars.user) {

    const shortURL = generateRandomString();
    // Ensures paths to new websites are absolute rather than relative
    const newURL = checkAbsoluteRoute(req.body.longURL);

    urlDatabase[shortURL] = {
      longURL: newURL,
      userID: vars.user.id
    };
    return res.redirect(302, '/urls');
  }

  //No page rendered since this POST request can only be reached through website (which will require login) or curl command/web trawler that cannot render pages
  return res.status(400).send("<h1>You must be logged in to create new URLs.</h1>");
  
  
});

app.post('/register', (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  //Checks to ensure the email and password fields are not blank. If they are, returns the register page with an alert banner
  if (!email || !password) {
    const registerVars = {
      incorrectForm: true,
      existingEmail: false,
      user: users[req.session.user_id]
    };
    res.status(400).render('register', registerVars);
  }

  //Checks to ensure the email does not already exist in the database. If it does, returns the register page with an alert banner
  if (getUserIDByEmail(email, users)) {
    const registerVars = {
      existingEmail: true,
      incorrectForm: false,
      user: users[req.session.user_id]
    };

    res.status(400).render('register', registerVars);
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
    const loginVars = {
      user: users[req.session.user_id],
      incorrectPasswordOrEmail: true,
      errorLoginNeeded: false
    };
    return res.status(403).render('login', loginVars);
  }
  //Renders the login page with incorrect password or email error if email does not exist
  const loginVars = {
    user: users[req.session.user_id],
    incorrectPasswordOrEmail: true,
    errorLoginNeeded: false
  };

  res.status(403).render('login', loginVars);

});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect(302, '/login');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

