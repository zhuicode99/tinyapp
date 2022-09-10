

const users = {};
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


const getUserByEmail = (email) => {
  for (let user of Object.keys(users)) {
    if (users[user]['email'] === email) {
      return user;
    }
  }
};


const getUrlsForUser = (userID) => {
  const urls = {};
  const keys = Object.keys(urlDatabase);
  for (const key of keys) {
    const url = urlDatabase[key];
    if (url.userID === userID) {
      urls[key] = url;
    }
  }
  return urls;
}


const generateRandomString = () => {
  let randomStr = "";
  let calc = (Math.random()).toString(36).substring(2, 8);
  randomStr += calc;
  return randomStr;
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

  return { id, email };
}


const userStatus = (session) => {
  if (session) {
    if (session.user_id) {
      return true;
    }
  }
  return false;
};



const userPerm = (req) => {
  if (!userStatus(req.session)) {
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
 
  console.log(req.params.id)
  if (urlDatabase[req.params.id].userID !== req.session.user_id) {
    return {
      status: 401,
      send: '<h1><center>You do not own this URL!</center></h1>',
      permission: false,
    };
  }
  return { status: 200, send: '', permission: true };
};








module.exports = { users, getUserByEmail, generateRandomString, urlDatabase, userData, userStatus, userPerm, getUrlsForUser };