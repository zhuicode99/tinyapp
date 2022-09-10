const express = require("express");
const cookieSession = require('cookie-session');
const app = express();
const bcrypt = require('bcryptjs');
const PORT = 8080; // default port 8080
const { 
  getUserByEmail,
  users,
  generateRandomString,
  urlDatabase,
  userData,
  userStatus,
  userPerm,
  getUrlsForUser
} = require('./helpers');

console.log("here");

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['superman'],
  maxAge: 24 * 60 * 60 * 1000 ///?
}))


//------------Endpoints------------

//Homepage: already logged in,redir to url page, if not, login page
app.get('/', (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});


app.get('/urls', (req, res) => {  
  if (!userStatus(req.session)) { //verify if user is logged in 
    req.session = null;
    res.send("Please log in first <a href='/login'>Try Login!</a>");
  }
 

  const data = userData(req.session);
  const urls = getUrlsForUser(req.session.user_id)
  const templateVars = { urls: urls, username: data.email };
  res.render('urls_index', templateVars);
  // console.log("thehatlkds", templateVars);
  // console.log(data)
});



//GET route to render the urls_new.ejs template
app.get("/urls/new", (req, res) => { // has to be infront of the second urls/new/ otherwise error
  
  if (!userStatus(req.session)) {
    return res.redirect('/login');
  }
  
  const data = userData(req.session);
  const templateVars = {username: data.username};//////data(req.session)
  res.render("urls_new", templateVars);
});


//search for the longUrl by shortUrl
app.get("/urls/:id", (req, res) => {  //id is shortURL
  
  const permission = userPerm(req);
  if (!permission.permission) {
    return res.status(permission.status).send(permission.send);
  }

  const userInfo = userData(req.session);
  const userDatabase = getUrlsForUser(req.session.user_id);
  const urlData = userDatabase[req.params.id];
  const userVariables = {
    id: req.params.id,
    longURL: urlData.longURL,
    username: userInfo.username,
  };
  return res.render('urls_show', userVariables);
});




app.post('/urls/:id', (req, res) => {
  res.redirect(`/urls/${req.params.id}`);
});





//if input exist shortURL, will redirect to related longURL
app.get("/u/:id", (req, res) => { //id is shortURL
  const longURL = urlDatabase[req.params.id]
  res.redirect(longURL); 
});


app.post("/urls", (req, res) => { //use post to trigger previous entered form info, from urls/new to urls.
  if (!userStatus(req.session)) {
    return res.status(401).send('<h1><center>Please login to use ShortURL!</center></h1>');
  }
  const id = generateRandomString();//short url
 
  urlDatabase[id] = {
    urlID: id,
    longURL: req.body.longURL,
    userID: req.session.user_id,
  };

  urlDatabase[id] = req.body.longURL; 
  return res.redirect(`/urls/${id}`);
});


//edit 
app.post("/urls/:id", (req, res) => { 
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls"); 
})



//delete 
app.post('/urls/:id/delete', (req, res) => {
  // extract the id from the url // req.params
  const id = req.params.id;
  // delete it from the db
  delete urlDatabase[id];
  res.redirect('/urls');
});

//get to login
app.get('/login', (req, res) => {
  if (userStatus(req.session)) {
    return res.redirect('/urls') // if logged in, redir to homepage
  }

  // const data = userData('');
  res.render("urls_login", {username: null});
});

//w3d3:1 : render the new template
app.get('/register', (req, res) => {
  if (userStatus(req.session)) {//if user logged in, redirect back to homepage
    res.redirect("/urls_");
  } 
  const templateVars = { username: req.session.user_id };

  
  return res.render('urls_register', templateVars);
});

//login 
app.post('/login', (req, res) => {
  const email = req.body.email;
  const pswd = req.body.password;
  const userId = getUserByEmail(email)
  if (!userId || !bcrypt.compareSync(pswd, users[userId].password)&&false) {
    res.send("Incorrect email or password!<a href='/login'>Please Try Again!</a>");
    return;
  }
 
  req.session.user_id = userId; //once logged in, req.session.user_id keep a value as userId;only when logged in we have this.
  
  res.redirect("/urls");
});


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

//done//logout
app.post('/logout', (req, res) => {
  res.clearCookie('session'); //change cookie from username to user_id
  return res.redirect("/");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});