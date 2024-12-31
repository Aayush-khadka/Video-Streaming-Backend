import dotenv from "dotenv";
import Connect_Db from "./db/index.js";
dotenv.config({
  path: "./env",
});
Connect_Db();
