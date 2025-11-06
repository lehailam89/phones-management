const { GoogleGenerativeAI } = require("@google/generative-ai");
const RAGHelper = require("../../helpers/ragHelper");

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// Lưu trữ lịch sử cuộc trò chuyện trong memory (có thể chuyển sang Redis/Database sau)
const conversationStore = new Map();

module.exports.getChatPage = (req, res) => {
    res.render('client/pages/chat/index', {
        pageTitle: 'Chat với AI Gemini'
    });
};

module.exports.handleMessage = async (req, res) => {
    const { message, sessionId } = req.body;

    if (!message) {
        return res.status(400).json({ error: "Message is required" });
    }   

    // Tạo sessionId nếu chưa có
    const chatSessionId = sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Lấy lịch sử cuộc trò chuyện
    let conversationHistory = conversationStore.get(chatSessionId) || [];
    
    // Thêm tin nhắn mới vào lịch sử
    conversationHistory.push({
        role: 'user',
        content: message,
        timestamp: new Date()
    });

    try {
        // Sử dụng RAG để lấy context từ database và lịch sử
        const { intent, context } = await RAGHelper.buildContext(message, conversationHistory);
        
        // Xây dựng ngữ cảnh từ lịch sử cuộc trò chuyện
        let conversationContext = '';
        if (conversationHistory.length > 1) {
            conversationContext = '\n--- LỊCH SỬ CUỘC TRÒ CHUYỆN ---\n';
            // Lấy 10 tin nhắn gần nhất để tránh prompt quá dài
            const recentMessages = conversationHistory.slice(-11); // -11 để loại bỏ tin nhắn hiện tại
            recentMessages.slice(0, -1).forEach((msg, index) => {
                conversationContext += `${msg.role === 'user' ? 'Khách hàng' : 'Tôi'}: ${msg.content}\n`;
            });
            conversationContext += '--- KẾT THÚC LỊCH SỬ ---\n\n';
        }

        // Xây dựng prompt với context
        let contextPrompt = `Bạn là nhân viên tư vấn của cửa hàng điện thoại Lâm Mobiles. Hãy trả lời câu hỏi của khách hàng một cách chuyên nghiệp và hữu ích.

${conversationContext}

THÔNG TIN CỬA HÀNG:
${context.storeInfo ? `
- Tên cửa hàng: ${context.storeInfo.name}
- Số điện thoại: ${context.storeInfo.phone}
- Email: ${context.storeInfo.email}
- Địa chỉ: ${context.storeInfo.address}
` : ''}

`;

        // Thêm thông tin sản phẩm nếu có
        if (context.products && context.products.length > 0) {
            contextPrompt += `SẢN PHẨM LIÊN QUAN:\n`;
            context.products.forEach((product, index) => {
                contextPrompt += `${index + 1}. ${product.name}
   - Giá gốc: ${product.price.toLocaleString('vi-VN')}$
   - Giá khuyến mãi: ${product.discountPrice.toLocaleString('vi-VN')}$
   - Tồn kho: ${product.stock} sản phẩm
   - Mô tả: ${product.description}
   - Danh mục: ${product.category}

`;
            });
        }

        // Thêm thông tin danh mục nếu có
        if (context.categories && context.categories.length > 0) {
            contextPrompt += `DANH MỤC SẢN PHẨM:\n`;
            context.categories.forEach((category, index) => {
                contextPrompt += `${index + 1}. ${category.name}: ${category.description}\n`;
            });
        }

        // Thêm thông tin bài viết nếu có
        if (context.blogs && context.blogs.length > 0) {
            contextPrompt += `BÀI VIẾT LIÊN QUAN:\n`;
            context.blogs.forEach((blog, index) => {
                contextPrompt += `${index + 1}. ${blog.title}
   - Nội dung: ${blog.content}
   - Link: /blogs/${blog.slug}

`;
            });
        }

        // Thêm sản phẩm nổi bật nếu không có context cụ thể
        if (context.featuredProducts && context.featuredProducts.length > 0) {
            contextPrompt += `SẢN PHẨM NỔI BẬT:\n`;
            context.featuredProducts.forEach((product, index) => {
                contextPrompt += `${index + 1}. ${product.name} - ${product.discountPrice.toLocaleString('vi-VN')}đ\n`;
            });
        }

        contextPrompt += `
HƯỚNG DẪN TRẢ LỜI:
- Trả lời bằng tiếng Việt, thân thiện và chuyên nghiệp
- QUAN TRỌNG: Tham khảo lịch sử cuộc trò chuyện để trả lời phù hợp với ngữ cảnh
- Nếu khách hàng đề cập đến thông tin đã thảo luận trước đó, hãy liên kết với những gì đã nói
- Nếu khách hàng nói "nó", "cái đó", "sản phẩm này" thì xem lại lịch sử để hiểu họ đang nói về gì
- Sử dụng thông tin từ database để đưa ra lời khuyên chính xác
- Nếu khách hàng hỏi về sản phẩm cụ thể, hãy đề xuất từ danh sách sản phẩm liên quan
- Nếu khách hàng hỏi thông tin liên hệ, sử dụng thông tin cửa hàng ở trên
- Không sử dụng ký tự đặc biệt, in đậm hay bullet points
- Luôn kết thúc bằng câu hỏi để tiếp tục hỗ trợ khách hàng

CÂU HỎI HIỆN TẠI CỦA KHÁCH HÀNG: ${message}`;

        const result = await model.generateContent(contextPrompt);
        const aiResponse = result.response.text();
        
        // Lưu phản hồi của AI vào lịch sử
        conversationHistory.push({
            role: 'assistant',
            content: aiResponse,
            timestamp: new Date()
        });
        
        // Lưu lại lịch sử (giới hạn 20 tin nhắn để tiết kiệm memory)
        if (conversationHistory.length > 20) {
            conversationHistory = conversationHistory.slice(-20);
        }
        conversationStore.set(chatSessionId, conversationHistory);
        
        res.json({ 
            response: aiResponse,
            sessionId: chatSessionId,
            messageCount: conversationHistory.length 
        });
    } catch (error) {
        console.error('Error in chat:', error);
        res.status(500).json({ error: "Failed to generate response" });
    }
};