"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createErrorResponse = exports.createSuccessResponse = exports.sendResponse = void 0;
const sendResponse = (resDetails) => {
    const { res, statusCode, success, msg, data = {}, error = {} } = resDetails;
    return res.status(statusCode).json({
        success,
        msg,
        data,
        error,
    });
};
exports.sendResponse = sendResponse;
const createSuccessResponse = (res, msg = "Success", statusCode = 200, data = {}) => {
    return (0, exports.sendResponse)({
        res,
        statusCode,
        success: true,
        msg,
        data,
    });
};
exports.createSuccessResponse = createSuccessResponse;
const createErrorResponse = (req, res, statusCode = 500, msg = "Server Internal Error.", error = {}) => {
    return (0, exports.sendResponse)({
        res,
        statusCode,
        success: false,
        msg,
        error,
    });
};
exports.createErrorResponse = createErrorResponse;
//# sourceMappingURL=response-utils.js.map