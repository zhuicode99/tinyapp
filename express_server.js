const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser")

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));//body-parser,from buffer to str so we can read

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

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => { //use form method-post to action-urls
  res.render("urls_new");
});

//search for the longUrl by shortUrl
app.get("/urls/:id", (req, res) => {  //id is shortURL
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
 /*  console.log("here", templateVars)   if key already exist,return the value:longURL
  console.log("param", req.params) */
  //req.params = input on http url
  res.render("urls_show", templateVars);
}); 

//if input exist shortURL, will redirect to related longURL
app.get("/u/:id", (req, res) => { //id is shortURL
  const longURL = urlDatabase[req.params.id]
  res.redirect(longURL); //if input exist, you can click to redirect
});

app.post("/urls", (req, res) => { //use post to trigger previous entered form info, from urls/new to urls.
  console.log(req.body); // req.body = whatever I input on the form
  let id = generateRandomString();
  urlDatabase[id] = req.body.longURL; //{ longURL: 'google' }
  res.redirect(`/urls/${id}`);//??whats this used for? not able to click and redirect
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});