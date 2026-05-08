const jwt = require("jsonwebtoken");
require("dotenv").config();

const instructorToken = jwt.sign(
  { id: "664000000000000000000001", role: "instructor" },
  process.env.JWT_SECRET
);

const studentToken = jwt.sign(
  { id: "664000000000000000000002", role: "student" },
  process.env.JWT_SECRET
);

console.log("INSTRUCTOR TOKEN:", instructorToken);
console.log("STUDENT TOKEN:", studentToken);