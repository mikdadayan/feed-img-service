import {
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommandInput,
  GetObjectCommandInput,
  DeleteObjectCommandInput,
} from "@aws-sdk/client-s3";

export enum S3CommandType {
  PUT = "put",
  GET = "get",
  DELETE = "delete",
}

type paramsPropType =
  | PutObjectCommandInput
  | GetObjectCommandInput
  | DeleteObjectCommandInput;

export const createS3Command = (
  commandType: S3CommandType,
  params: paramsPropType
) => {
  let command;

  switch (commandType) {
    case S3CommandType.PUT:
      command = new PutObjectCommand(params);
      break;
    case S3CommandType.GET:
      command = new GetObjectCommand(params);
      break;
    case S3CommandType.DELETE:
      command = new DeleteObjectCommand(params);
      break;
    default:
      throw new Error("Invalid S3 command type.");
  }
  return command;
};
