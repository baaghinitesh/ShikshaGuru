"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const chatController_1 = require("../controllers/chatController");
const router = express_1.default.Router();
// All chat routes require authentication
router.use(auth_1.protect);
// Chat routes
router.get('/', chatController_1.getUserChats);
router.post('/', chatController_1.createChat);
router.get('/:id', chatController_1.getChatById);
// Message routes
router.get('/:id/messages', chatController_1.getChatMessages);
router.post('/:id/messages', chatController_1.sendMessage);
router.patch('/:id/messages/read', chatController_1.markMessagesAsRead);
router.get('/:id/messages/search', chatController_1.searchMessages);
// Individual message routes
router.delete('/:id/messages/:messageId', chatController_1.deleteMessage);
router.patch('/:id/messages/:messageId', chatController_1.editMessage);
exports.default = router;
//# sourceMappingURL=chat.js.map