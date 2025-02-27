const express = require("express");
const connectDB = require("./src/config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const initializeSocket = require("./src/utils/socket");
const http = require("http");

const app = express();
const server = http.createServer(app);
const io = initializeSocket(server);
app.use(
  cors({
    origin: ["https://devnet-blush.vercel.app", "http://localhost:5173"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT || 3000;
const authRouter = require("./src/routes/auth");
const profileRouter = require("./src/routes/profile");
const requestRouter = require("./src/routes/request");
const userRouter = require("./src/routes/user");
const skillsRouter = require("./src/routes/skills");
const chatRouter = require("./src/routes/chat");

app.get("/ping", (req, res) => {
  res.status(200).send("Server is active");
});

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", skillsRouter);
app.use("/", chatRouter);
connectDB()
  .then(() => {
    console.log("Database connected successfully");
    server.listen(PORT, () => {
      console.log("Server started successfully");
    });
  })
  .catch((err) => {
    console.log("Database not connected:", err);
  });
