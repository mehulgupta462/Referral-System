import express from "express";
import http from "http";
import cors from "cors";
import "dotenv/config";
import connectDB from "./src/configs/mongodb.js";
import userRouter from "./src/routes/userRouter.js";
import authRouter from "./src/routes/authRouter.js";
import earningsRoute from "./src/routes/earningRouter.js";
import { getSocket, initSocket } from "./src/sockets/socket.js"; // Import the initSocket function

const app = express();
const server = http.createServer(app);

await connectDB();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Referral System API Running");
});

// Initialize the socket with the server
initSocket(server);

// Pass the socket instance to the earnings route
app.use("/api/earning", earningsRoute(getSocket())); // Use getSocket to pass the io instance

app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
