# tinyApp - URL Shortener
## Made by Matias Wengiel for the LighthouseLabs Web Developer Program
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
