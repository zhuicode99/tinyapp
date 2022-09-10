const express = require("express");
const cookieSession = require('cookie-session');
const app = express();
const bcrypt = require('bcryptjs');
const PORT = 8080; 
const { 
  users,
  urlDatabase,
  getUserByEmail,
  getUrlsForUser,
  generateRandomString,
  userData,
  userStatus,
  userPerm
} = require('./helpers');

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['superman'],
  maxAge: 24 * 60 * 60 * 1000 
}))

//------------Endpoints------------

//Homepage: already logged in,redir to url page, if not, login page
app.get('/', (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  } else {
    req.session = null;
    res.redirect('/login');
  }
});

//Urls page
app.get('/urls', (req, res) => {  
  if (!userStatus(req.session)) { //verify if user is logged in 
    req.session = null;
    res.send("Please log in first <a href='/login'>Try Login!</a>");
  }
  //pass user data to header partial
  const data = userData(req.session);
  const urls = getUrlsForUser(req.session.user_id);
  const templateVars = { urls: urls, username: data.email };
  console.log("here", templateVars)
  res.render('urls_index', templateVars); 
  // console.log("here", templateVars);
});

//Urls/new page
app.get("/urls/new", (req, res) => { 
  
  if (!userStatus(req.session)) {
    return res.redirect('/login');
  }
  
  const data = userData(req.session);
  const templateVars = {username: data.username};//////data(req.session)
  res.render("urls_new", templateVars);
});


//urls/:id page: search for the longUrl by shortUrl
app.get("/urls/:id", (req, res) => {  //id is shortURL
  //verify if user has permission
  const permission = userPerm(req);
  if (!permission.permission) {
    return res.status(permission.status).send(permission.send);
  }
  //pass user data to header partial
  const userInfo = userData(req.session);
  const userDatabase = getUrlsForUser(req.session.user_id);
  const urlData = userDatabase[req.params.id];

  const templateVars = {
    id: req.params.id,
    longURL: urlData.longURL,
    username: userInfo.username
  };
  console.log("right here",urlData)
  console.log("left here",templateVars)
  return res.render('urls_show', templateVars);
});


//POST /urls/:id
app.post('/urls/:id', (req, res) => {
  const permission = userPerm(req);

  if (!permission.permission) {
    return res.status(permission.status).send(permission.send);
  }

  urlDatabase[req.params.id].longURL = req.body.longURL;
  return res.redirect('/urls');
});

//potential bugs below
//u/:id page: if input exist shortURL, will redirect to related longURL
app.get("/u/:id", (req, res) => { 

  if (!urlDatabase[req.params.id]) {
    return res.send("<h1>Invalid ID!</h1>");
  }

  const longURL = urlDatabase[req.params.id]
  res.redirect(longURL.longURL); 
});


//POST /urls page: use post to trigger previous entered form info, from urls/new to urls.
app.post("/urls", (req, res) => { 

  if (!userStatus(req.session)) {
    return res.status(401).send('<h1><center>Please login to use ShortURL!</center></h1>');
  }

  const id = generateRandomString();
 
  urlDatabase[id] = {
    urlID: id,
    longURL: req.body.longURL,
    userID: req.session.user_id,
  };

  // urlDatabase[id] = req.body.longURL; 
  return res.redirect(`/urls/${id}`);
});


//POST /urls/:id: to edit longURLs
app.post("/urls/:id", (req, res) => { 
  const permission = userPerm(req);
  if (!permission.permission) {
    return res.status(permission.status).send(permission.send);
  }

  urlDatabase[req.params.id].longURL = req.body.longURL;
  res.redirect("/urls"); 
  // console.log("righthere",req.body.longURL)
})

//POST /urls/:id/delete: to delete unwanted urls from url list 
app.post('/urls/:id/delete', (req, res) => {
  
  const id = req.params.id; // extract the id from the url // req.params
 
  delete urlDatabase[id]; // // delete it from the db

  res.redirect('/urls');
});

//login page
app.get('/login', (req, res) => {

  if (userStatus(req.session)) {
    return res.redirect('/urls') // if logged in, redirect to homepage
  }

  res.render("urls_login", {username: null});
});

//register page
app.get('/register', (req, res) => {

  if (userStatus(req.session)) {//if user logged in, redirect back to homepage
    res.redirect("/urls_");
  } 

  const templateVars = { username: req.session.user_id };
  
  return res.render('urls_register', templateVars);
});

//POST login 
app.post('/login', (req, res) => {
  const email = req.body.email;
  const pswd = req.body.password;
  const userId = getUserByEmail(email);

  if (!userId || !bcrypt.compareSync(pswd, users[userId].password)) {
    return res.send("Incorrect email or password!<a href='/login'>Please Try Again!</a>");
  }
 
  req.session.user_id = userId; //once logged in, store req.session.user_id as uerId
  
  res.redirect("/urls");
});

//POST register
app.post('/register', (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  
  if (!email || !password) {
    return res.send("Sorry! Your entry is either empty or invalid.<a href='/register'>Please Try Again!</a>")
  } 

  if (getUserByEmail(email)) {
    return res.send("Email already registered<a href='/login'>Please Login!</a>");
  } 

  const randomId = generateRandomString();
  
  users[randomId] = { 
    id: randomId,
    email: req.body.email,
    password: bcrypt.hashSync(password, 10)
  };

  req.session.user_id = randomId;
  res.redirect("/urls");
});

//POST logout
app.post('/logout', (req, res) => {
  req.session = null; //clear the cookie when logout
  return res.redirect("/");
});

//server is listening
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});