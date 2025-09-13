"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Placeholder route handlers
const uploadFile = (req, res) => {
    res.json({ success: true, message: 'Upload file - To be implemented' });
};
const uploadImage = (req, res) => {
    res.json({ success: true, message: 'Upload image - To be implemented' });
};
const deleteFile = (req, res) => {
    res.json({ success: true, message: 'Delete file - To be implemented' });
};
// All upload routes require authentication
router.use(auth_1.protect);
router.post('/file', uploadFile);
router.post('/image', uploadImage);
router.delete('/:id', deleteFile);
exports.default = router;
//# sourceMappingURL=upload.js.map