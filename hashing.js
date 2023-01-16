const bcrypt = require("bcrypt");

module.exports.securePassword = async (password) => {
  const hash = await bcrypt.hash(password, 12);
  console.log(hash);
  return hash;
};

module.exports.verifyPassword = async (password, hash) => {
  const compare = await bcrypt.compare(password, hash);
  console.log(compare);
  return compare;
};

// const hash = "$2b$12$RFpxWDag.kaVdyEPoOqcmOEYehRlf7rldpwRyMKKD/WOvn6I1lHzi";
// securePassword("cheems");
// verifyPassword("cheems", hash);
