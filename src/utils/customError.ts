export default class CustomError extends Error {
  constructor(msg: string, public statusCode: number) {
    super(msg);
  }
}
