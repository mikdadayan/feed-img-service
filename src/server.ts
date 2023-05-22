import express, { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";

import postRouter from "./lib/routes/postRouter/index";
import CustomError from "./lib/utils/customError";

const options: cors.CorsOptions = {
  origin: "*",
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "X-Access-Token",
  ],
  credentials: true,
  methods: "GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE",
};

dotenv.config();

const app = express();

app.use(cors(options));

app.use("/api", postRouter);

app.use(
  (error: CustomError, _req: Request, res: Response, _next: NextFunction) => {
    console.log(res);
    res.status(error.statusCode).json({ success: false, error: error.message });
  }
);

app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, msg: "404, Page Not Found." });
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
