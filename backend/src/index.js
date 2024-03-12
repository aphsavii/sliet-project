import express from "express";
import dbConnect from "./db/dbConnect.js";
import { app } from "./app.js";

dbConnect()
  .then(() => {
    app.listen(process.env.PORT || 5000, () =>
      console.log("App is running on port", process.env.PORT)
    );
  })
  .catch((err) => console.log("connection failed", err?.message));
