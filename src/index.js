import dotenv from "dotenv";
import Connect_Db from "./db/index.js";
import app from "./app.js";
dotenv.config({
  path: "./env",
});
Connect_Db()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server Listening at : ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("ERROR IN DATABASE: ", err);
  });
