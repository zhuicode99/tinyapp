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
  userInfo,
} = require('./helpers');

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
  if (!userStatus(req.session)) {
    res.status(401).send('<h1><center>Please log in first</center></h1>');
  }
 
  const data = userData(req.session);
  const info = userInfo(req.session.user_id)
  const templateVars = { urls: info, username: data.username };
  res.render('urls_index', templateVars);
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
  
  const perm = userPerm(req);
  if (!userPerm.permission) {
    return res.status(perm.status).send(perm.send);
  }
  const data = userData(req.session);
  // const info = getUserDatabase(id)
  const templateVars = { 
    id: req.params.id, 
    longURL: urlDatabase[req.params.id],
    username: data.username,
    urls: urlDatabase
  };
  res.render("urls_show", templateVars);
});

app.post('/urls/:id', (req, res) => {
  res.redirect(`/urls/${req.params.id}`);
});


//if input exist shortURL, will redirect to related longURL
app.get("/u/:id", (req, res) => { //id is shortURL
  const longURL = urlDatabase[req.params.id]
  res.redirect(longURL); //if input exist, you can click to redirect
});

app.post("/urls", (req, res) => { //use post to trigger previous entered form info, from urls/new to urls.
  const id = generateRandomString();
  console.log(req.body); // req.body = whatever I input on the form
  urlDatabase[id] = req.body.longURL; //{ longURL: 'google' }
  // const templateVars = { id: id, longURL: urlDatabase[id]};// why cause error
  // res.render('urls_show', templateVars)//these two lines not allow me to redirect.
  res.redirect("/urls");//??whats this used for? not able to click and redirect
});

//edit 
app.post("/urls/:id", (req, res) => { //EDIT
  urlDatabase[req.params.id] = req.body.longURL;//EDIT
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

  const data = userData('');
  res.render("urls_login", data);
});

//w3d3:1 : render the new template
app.get('/register', (req, res) => {
  if (userStatus(req.session)) {//if user logged in, redirect back to homepage
    
    res.redirect("/urls_");
  } 
  const templateVars = { username: req.session.username };
  
  return res.render('urls_register', templateVars);
});

//login 
app.post('/login', (req, res) => {
  const email = req.body.email;
  const userId = getUserByEmail(email, users)
  const pswd = req.body.password;

  if (!users[userId]) {
    return res.status(400).send('<h3>Incorrect email!</h3>');
  }
  if (!bcrypt.compareSync(pswd, users[userId].password)) {
    return res.status(400).send('<h3>Incorrect password!</h3>');
  }
  res.session.user_id = userId;
  return res.redirect("/urls");
});

//done ?//create post /register route
app.post('/register', (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  
  if (!email || !password) {
    return res.status(400).send('<h3>Sorry! Your entry is either empty or invalid.</h3>')//html format
  } 
  if (getUserByEmail(email)) {
    return res.status(400).send(`<h3>${email} already registered</h3>`)
  } 
  const randomId = generateRandomString();
  users[randomId] = { 
    id: randomId,
    email: req.body.email,
    password: bcrypt.hashSync(password, 10)
  };
  res.session.user_id = randomId;
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