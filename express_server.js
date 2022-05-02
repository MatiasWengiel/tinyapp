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

//Checks an email exists and returns ID if possible and false if the email does not exist
const checkIDViaEmail = (newEmail) => {
  for (const user in users) {
    if (users[user].email === newEmail) {
      return user
    }
  }
  return false
}

//DATABASES
const urlDatabase = {
  'b2xVn2': "http://www.lighthouselabs.ca",
  '9sm5xK': 'http://www.google.ca'
};

const users = {
  'sampleUser': {
    id: 'userRandomID',
    email: 'user@example.com',
    password: 'user-defined-password'
  }
}

//GET REQUESTS
app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/urls', (req, res) => {
  const templateVars = {urls: urlDatabase, user: users[req.cookies["user_id"]] };

  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]]  };

  res.render("urls_new", templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL
  const templateVars = {
    shortURL,
    urls: urlDatabase,
    longURL: urlDatabase[shortURL],
    user: users[req.cookies["user_id"]] 
  };
  //Ensures the shortURL exists if typed by user
  templateVars.urls[shortURL] ? res.render('urls_show', templateVars) : res.render('urls_index', templateVars);

});

app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL]
  const templateVars = {
    shortURL,
    longURL,
    urls: urlDatabase,
    user: users[req.cookies["user_id"]] 
  };

  //Ensures the shortURL exists if typed by user
  templateVars.urls[shortURL] ? res.redirect(302, longURL) : res.render('urls_index', templateVars);
});

app.get('/register', (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
    //Next two variables are used for user alert in case of incomplete submission or existing email
    incorrectForm: false,
    existingEmail:false
  };

  res.render('register', templateVars)
})

app.get('/login', (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]] 
  }
  res.render('login', templateVars)
})

//POST REQUESTS
app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect(302, "/urls");
});

app.post('/urls/:shortURL/edit', (req, res) => {
  let newURL = req.body.newURL;

  // Ensures paths to new websites are absolute rather than relative
  if (newURL.substring(0,7) !== "http://" && newURL.substring(0,8) !== "https://") {
    newURL = "http://" + newURL;
  }
  urlDatabase[req.params.shortURL] = newURL;
  res.redirect(302, '/urls');
});

app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  let newURL = req.body.longURL;
  if (newURL.substring(0,7) !== "http://" && newURL.substring(0,8) !== "https://") {
    newURL = "http://" + newURL;
  }
  urlDatabase[shortURL] = newURL;

  res.redirect(302, '/urls');
});

app.post('/register', (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    const templateVars = {
      incorrectForm: true,
      existingEmail: false,
      user: users[req.cookies["user_id"]]
    }
    res.status(400).render('register', templateVars);
  }

  if (checkIDViaEmail(email)) {
    const templateVars = {
      existingEmail: true,
      incorrectForm: false,
      user: users[req.cookies["user_id"]]
    }

    res.status(400).render('register', templateVars)
  }

  users[id] = {
    id,
    email,
    password
  }

  res.cookie('user_id', id);
  res.redirect(302, '/urls');
})

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  //Will have the user_id of an existing email, or false otherwise
  const existingEmail = checkIDViaEmail(email);

  if (existingEmail) {
    if (users[existingEmail].password === password) {
      res.cookie('user_id', existingEmail)
      res.redirect(302, '/urls')
    }
    res.status(403).send('Invalid Password, return to <a href="/login">login page<a>');
  }
  res.status(403).send('Email cannot be found, do you want to <a href="/register">register<a> or return to the <a href="/login"> log in page? <a>')
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect(302, '/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

