const crypto = require("crypto"),
  ai = require("../services/aiService"),
  Chat = require("../model/ChatHisory");
exports.chat = async (q, res, n) => {
  try {
    const { message, sessionId = crypto.randomUUID() } = q.body;
    if (!message?.trim()) {
      const e = new Error("Vui lòng nhập nội dung tin nhắn");
      e.statusCode = 400;
      throw e;
    }
    const result = await ai.chat(message);
    await Chat.findOneAndUpdate(
      { user: q.user._id, sessionId },
      {
        $push: {
          messages: {
            $each: [
              { sender: "user", message },
              {
                sender: "bot",
                message: result.answer,
                relatedPaintings: result.paintings.map((x) => x._id),
              },
            ],
          },
        },
      },
      { upsert: true },
    );
    res.json({ success: true, sessionId, ...result });
  } catch (e) {
    n(e);
  }
};
exports.history = async (q, res, n) => {
  try {
    res.json({
      success: true,
      data: await Chat.find({ user: q.user._id })
        .populate("messages.relatedPaintings")
        .sort("-updatedAt")
        .limit(20),
    });
  } catch (e) {
    n(e);
  }
};

