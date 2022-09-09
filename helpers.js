const getUserByEmail = (email) => {
  let userId = "";
  for (let key of Object.keys(users)) {
    if (users[key]['email'] === email) {
      userId = key
    }
  }
  return userId;
}


















module.exports = getUserByEmail;