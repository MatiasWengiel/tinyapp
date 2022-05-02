const express = require('express');
const app = express();
const PORT = 8080;

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set('view engine', 'ejs');

const cookieParser = require('cookie-parser');
app.use(cookieParser());

const generateRandomString = () => {
  let randomOutput = Math.random().toString(36); //Generates a pseudo-random number and turns it into a string
  return randomOutput.substring(2, 8); //Returns six characters from the middle of the string for increased randomization
};

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

app.post('/register', (req, res) => {
  const id = generateRandomString()
  users[id] = {
    id,
    email: req.body.email,
    password: req.body.password
  }

  console.log(users)
  res.cookie('username', id);
  res.redirect(302, '/urls');
})

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/urls', (req, res) => {
  const templateVars = {urls: urlDatabase, username: req.cookies["username"] };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { username: req.cookies['username'] };
  res.render("urls_new", templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL
  const templateVars = {
    shortURL,
    urls: urlDatabase,
    longURL: urlDatabase[shortURL],
    username: req.cookies["username"]
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
    username: req.cookies["username"]
  };

  //Ensures the shortURL exists if typed by user
  templateVars.urls[shortURL] ? res.redirect(302, longURL) : res.render('urls_index', templateVars);
});

app.get('/register', (req, res) => {
  const templateVars = {
    username: req.cookies["username"]
  };

  res.render('register', templateVars)
})

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

app.post('/login', (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect(302, '/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect(302, '/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

