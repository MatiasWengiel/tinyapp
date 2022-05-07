# tinyApp - URL Shortener
## Made by Matias Wengiel for the Lighthouse Labs Web Developer Program
<br>

# Description:

tinyApp is a full-stack url shortener (similar to existing services like [Bitly](https://bitly.com) or [TinyURL](https://tinyurl.com)). It was developed using node.js, Express, EJS and Bootstrap. 

# Table of contents
- [Description](#description)
- [Features](#features)
- [Installation](#installation)
- [Screenshots](#screenshots)

# Features:

- Ability to create unlimited shortened URLs
- Ability to view, edit and delete the long URL associated with each short URL
- Secure user login and encrypted cookies using bcryptjs and cookie-session modules

# Installation: 

This web app requires node.js. Other dependencies (see list below) can be obtained via command line interface using:

``` user$ npm install (dependency)```

Dependencies:
- bcryptjs
- body-parser
- cookie-session
- ejs
- express
- method-override
- Unit testing was written using mocha and chai, also available through NPM. These are not required for running the app, but are recommended for further development.

# Screenshots

Login Page:
![Log in page](https://github.com/MatiasWengiel/tinyapp/blob/master/docs/loginPage.png)

Individual "home" page showing URLs and options
![urls page](https://github.com/MatiasWengiel/tinyapp/blob/master/docs/urlsPage.png)

Users can edit the URL linked to each short (and randomly generated) url:
![edit url page](https://github.com/MatiasWengiel/tinyapp/blob/master/docs/editURL.png)

You best be careful, if you try to access a page without the right permissions you may run into the ferocious page protector!
![login needed page](https://github.com/MatiasWengiel/tinyapp/blob/master/docs/loginNeededPage.png)

