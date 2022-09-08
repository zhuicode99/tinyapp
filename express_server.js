const express = require("express");
const cookieParser = require('cookie-parser')
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));//body-parser,from buffer to str so we can read
app.use(cookieParser());

function generateRandomString() {
  let randomStr = "";
  let calc = (Math.random()).toString(36).substring(2, 8);
  randomStr += calc;
  return randomStr;
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => { //still return key with bracket?
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//define username for login/out
app.get('/urls', (req, res) => {  // this function has to be infront of second function
  const templateVars = { urls: urlDatabase, username: req.cookies.username };
  res.render('urls_index', templateVars);
});

app.get("/urls", (req, res) => { // the second /urls function.
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => { //use form method-post to action-urls
  res.render("urls_new");
});


app.post("/urls", (req, res) => { //use post to trigger previous entered form info, from urls/new to urls.
  console.log(req.body); // req.body = whatever I input on the form
  let id = generateRandomString();
  urlDatabase[id] = req.body.longURL; //{ longURL: 'google' }
  const templateVars = { id: id, longURL: urlDatabase[id]};
  res.render('urls_show', templateVars)
  //res.redirect(`/urls/${id}`);//??whats this used for? not able to click and redirect
});

//GET route to render the urls_new.ejs template
app.get("/urls/new", (req, res) => {
  const templateVars = {urls: urlDatabase, username: req.cookies.username};
  res.render("urls_new", templateVars);
});

//search for the longUrl by shortUrl
app.get("/urls/:id", (req, res) => {  //id is shortURL
  const templateVars = { 
    id: req.params.id, 
    longURL: urlDatabase[req.params.id],
    urls: urlDatabase,
    username: req.cookies.username
  };
  res.render("urls_show", templateVars);
 /*  console.log("here", templateVars)   if key already exist,return the value:longURL
  console.log("param", req.params) */
  //req.params = input on http url
}); 

//if input exist shortURL, will redirect to related longURL
app.get("/u/:id", (req, res) => { //id is shortURL
  const longURL = urlDatabase[req.params.id]
  res.redirect(longURL); //if input exist, you can click to redirect
});

//after delete part, start edit part
app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;//?
  res.redirect("/urls"); 
})

//delete a url
app.post('/urls/:id/delete', (req, res) => {
  // extract the id from the url // req.params
  const id = req.params.id;
  // delete it from the db
  delete urlDatabase[id];
  res.redirect('/urls');
});

//login 
app.post('/login', (req, res) => {
  console.log(req.body.username)
  res.cookie('username', req.body.username);
  return res.redirect("/urls");
});

//logout
app.post('/logout', (req, res) => {
  res.clearCookie('username');
  return res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});