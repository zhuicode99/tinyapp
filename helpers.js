const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

const getUserByEmail = (email) => {
  for (let user of Object.keys(users)) {
    if (users[user]['email'] === email) {
      return user;
    }
  }
  return undefined;
}


const generateRandomString = () => {
  let randomStr = "";
  let calc = (Math.random()).toString(36).substring(2, 8);
  randomStr += calc;
  return randomStr;
};

// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

const userData = (session) => {
  let email = "";
  let id = "";
  if (session) {
    id = session.user_id
  } else {
    id = undefined;
  }
  if (users[id]) {
    email = users[id].email;
  } else {
    email = undefined;
  };
  return { id, email};
}

const userStatus = (session) => {
  if (session) {
    if (session.user_id) {
      return true;
    }
  }
  return false;
}

const userInfo = (userID) => {
  const result = {};
  Object.keys(urlDatabase).forEach((key) => {
    const userData = urlDatabase[key];
    if (urlDatabase[key].userID === userID) {
      result[key] = {
        longURL: userData.longURL,
      };
    }
  });
  return result;
};

const userPerm = (req) => {
  if (userStatus(req.session)) {
    return {
      status: 401,
      send: '<h1><center>Please log in first!</center></h1>',
      permission: false,
    };
  }
  if (!urlDatabase[req.params.id]) {
    return {
      status: 404,
      send: '<h1><center>URL does not exist!</center></h1>',
      permission: false,
    };
  }
  if (urlDatabase[req.params.id].userID !== req.session.user_id) {
    return {
      status: 401,
      send: '<h1><center>You do not own this URL!</center></h1>',
      permission: false,
    };
  }
  return { status: 200, send: '', permission: true };
};








module.exports = { users, getUserByEmail, generateRandomString, userInfo, urlDatabase, userData, userStatus, userPerm };