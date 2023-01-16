const express = require("express");
const mongoose = require("mongoose");
const app = express();
const ejsMate = require("ejs-mate");
const path = require("path");
const test = require("./hashing");
const User = require("./models/User");
const Parites = require("./models/Parites");
const Votes = require("./models/Votes");
const methodOverride = require("method-override");
const flash = require("connect-flash");
const session = require("express-session");
const { isLoggedIn, isAdmin } = require("./middleware");
const catchAsync = require("./utils/catchAsync");
const Event = require("./models/Event");
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
mongoose.connect("mongodb://localhost:27017/votingApp", {
  useNewUrlParser: true,
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database Connected");
});

const sessionConfig = {
  secret: "supersecret!",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

app.use(session(sessionConfig));

app.use(flash());
app.use(methodOverride("_method"));

app.use((req, res, next) => {
  console.log(req.session);
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

// take to home page
app.get("/", (req, res) => {
  res.render("home");
});

// take ot register page
app.get("/register", (req, res) => {
  res.render("register");
});

// register the user using post

app.post("/register", async (req, res) => {
  const { name, phone, addharno, password, dob } = req.body;
  const hash = await test.securePassword(password);
  console.log(hash);
  const user = new User({
    name: name,
    phone: phone,
    aadhar: addharno,
    password: hash,
    date_of_birth: dob,
  });
  await user.save();
  console.log(user);
  req.session.isAuthenticated = true;
  res.redirect(`/vote/${user.id}`);
});

// take to login page
app.get("/login", (req, res) => {
  res.render("login");
});

// login the user using post
app.post("/login", async (req, res) => {
  const { addharno, password } = req.body;
  const user = await User.findOne({ aadhar: addharno });
  // console.log(comparePassword);
  if (!user) {
    res.redirect("/login");
  } else {
    const comparePassword = await test.verifyPassword(password, user.password);
    if (comparePassword) {
      req.session.isAuthenticated = true;
      // res.flash("success", "Welcome Back!");
      res.redirect(`/vote/${user.id}`);
    } else {
      res.redirect("/login");
    }
  }
});

// logout the user using post
app.post("/logout", isLoggedIn, (req, res) => {
  req.session.isAuthenticated = false;
  res.redirect("/");
});
// take to vote page
app.get("/vote/:id", isLoggedIn, async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);
  const parties = await Parites.find({});
  const event = await Event.find({});
  console.log(user);
  res.render("voting_page", { user, parties, event });
});

// register a vote using post
app.post("/vote/:user_id/:party_id", isLoggedIn, async (req, res) => {
  const { user_id, party_id } = req.params;
  const user = await User.findById(user_id);
  const addVote = await Votes({ party: party_id, voters: user_id });
  user.isVoted = true;
  await addVote.save();
  await user.save();
  res.redirect("/");
});

// start the voting
app.post("/start", isAdmin, async (req, res) => {
  const id = "63c52bc886058ae77e526022";
  const event = await Event.findByIdAndUpdate(id, {
    start: true,
    end: false,
  });
  await event.save();
  console.log(event);
  res.redirect("/");
});

//end the voting

app.post("/end", isAdmin, async (req, res) => {
  const id = "63c52bc886058ae77e526022";
  const event = await Event.findByIdAndUpdate(id, {
    start: false,
    end: true,
  });
  await event.save();
  console.log(event);
  res.redirect("/");
});

// admin portal page
app.get("/admin", isAdmin, async (req, res) => {
  const users = await User.find({});
  const parties = await Parites.find({});
  console.log(parties);
  res.render("admin/portal", { users, parties });
});

// login page for admin
app.get("/admin/login", (req, res) => {
  res.render("admin/login");
});

//login the admin using post
app.post("/admin/login", async (req, res) => {
  const { username, password } = req.body;
  if (username === "admin" && password === "admin") {
    req.session.isAdmin = true;
    res.redirect("/admin");
  } else {
    res.redirect("/admin/login");
  }
});

// add new party
app.get("/parties/new", isAdmin, (req, res) => {
  res.render("new_party");
});

// add new party using post
app.post(
  "/parties/new",
  isLoggedIn,
  catchAsync(async (req, res) => {
    const { name, image, leader, manifesto } = req.body;
    const party = new Parites({
      name: name,
      image: image,
      leader: leader,
      manifesto: manifesto,
    });
    console.log(party);
    await party.save();
    res.redirect("/");
  })
);

//edit party
app.get("/parties/edit/:id", isAdmin, async (req, res) => {
  const { id } = req.params;
  const party = await Parites.findById(id);
  res.render("edit_party", { party });
});

//edit party using put

app.put(
  "/parties/edit/:id",
  isAdmin,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const { name, image, leader, manifesto } = req.body;
    const party = await Parites.findByIdAndUpdate(id, {
      name: name,
      image: image,
      leader: leader,
      manifesto: manifesto,
    });
    await party.save();
    console.log(party);
    res.redirect("/admin");
  })
);

// delete a party
app.delete(
  "/parties/delete/:id",
  isAdmin,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const party = await Parites.findByIdAndDelete(id);
    res.redirect("/admin");
  })
);
// stop the voting and display the result
app.get("/result", async (req, res) => {
  const parties = await Parites.find({});
  const votes = await Votes.find({});
  const event = await Event.find({});
  const result = [];
  //sort the votes
  let maxVotes = 0;
  for (let i = 0; i < parties.length; i++) {
    let count = 0;
    for (let j = 0; j < votes.length; j++) {
      if (parties[i]._id.equals(votes[j].party)) {
        count++;
      }
    }
    if (count > maxVotes) {
      maxVotes = count;
    }
    result.push({ party: parties[i], count: count });
  }
  console.log(result, maxVotes);

  res.render("result", { event, result, maxVotes });
});

app.all("*", (req, res, next) => {
  res.render("404");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
