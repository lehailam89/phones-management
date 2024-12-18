const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI("AIzaSyB3vuKdE8o5acHk5RXXNLCs4FvwGGcBZJ0");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

module.exports.getChatPage = (req, res) => {
    res.render('client/pages/chat/index', {
        pageTitle: 'Chat với AI Gemini'
    });
};

module.exports.handleMessage = async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: "Message is required" });
    }   

    try {
        const text = 'Bây giờ, bạn hãy đóng vai là nhân viên tư vấn của cửa hàng điện thoại Lâm Mobile, khi tôi nhắn tin hỏi bạn hãy trả lời như nhân viên, phản hồi thuần text, không ký tự đặc biệt, không format in đậm, bullets, xuống dòng,...:' + message 
        const result = await model.generateContent(text);
        res.json({ response: result.response.text() });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to generate response" });
    }
};