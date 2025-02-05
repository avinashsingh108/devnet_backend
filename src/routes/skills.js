const express = require("express");
const skillsRouter = express.Router();
const { userAuth } = require("../middlewares/userAuth");
const { skills } = require("../utils/skillsData");

skillsRouter.get("/skills/suggestion", async (req, res) => {
  const query = req.query.q;
  const filteredSkills = skills.filter((skill) =>
    skill.toLowerCase().includes(query.toLocaleLowerCase())
  );
  if (filteredSkills.length === 0) {
    return res.json(["No match found"]);
  }
  res.json(filteredSkills);
});

module.exports = skillsRouter;
