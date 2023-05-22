import { Request, Response } from "express";

interface ResponseDetails {
  res: Response;
  statusCode: number;
  success: boolean;
  msg: string;
  data?: any;
  error?: any;
}

export const sendResponse = (resDetails: ResponseDetails) => {
  const { res, statusCode, success, msg, data = {}, error = {} } = resDetails;

  return res.status(statusCode).json({
    success,
    msg,
    data,
    error,
  });
};

export const createSuccessResponse = (
  res: Response,
  msg: string = "Success",
  statusCode: number = 200,
  data: any = {}
) => {
  return sendResponse({
    res,
    statusCode,
    success: true,
    msg,
    data,
  });
};

export const createErrorResponse = (
  req: Request,
  res: Response,
  statusCode: number = 500,
  msg: string = "Server Internal Error.",
  error: any = {}
) => {
  return sendResponse({
    res,
    statusCode,
    success: false,
    msg,
    error,
  });
};
