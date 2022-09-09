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


















module.exports = { users, getUserByEmail };