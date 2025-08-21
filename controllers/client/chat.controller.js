const { GoogleGenerativeAI } = require("@google/generative-ai");
const RAGHelper = require("../../helpers/ragHelper");

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_KEY);
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
        // Sử dụng RAG để lấy context từ database
        const { intent, context } = await RAGHelper.buildContext(message);
        
        // Xây dựng prompt với context
        let contextPrompt = `Bạn là nhân viên tư vấn của cửa hàng điện thoại Lâm Mobiles. Hãy trả lời câu hỏi của khách hàng một cách chuyên nghiệp và hữu ích.

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
- Sử dụng thông tin từ database ở trên để đưa ra lời khuyên chính xác
- Nếu khách hàng hỏi về sản phẩm cụ thể, hãy đề xuất từ danh sách sản phẩm liên quan
- Nếu khách hàng hỏi thông tin liên hệ, sử dụng thông tin cửa hàng ở trên
- Không sử dụng ký tự đặc biệt, in đậm hay bullet points
- Luôn kết thúc bằng câu hỏi để tiếp tục hỗ trợ khách hàng

CÂU HỎI CỦA KHÁCH HÀNG: ${message}`;

        const result = await model.generateContent(contextPrompt);
        res.json({ response: result.response.text() });
    } catch (error) {
        console.error('Error in chat:', error);
        res.status(500).json({ error: "Failed to generate response" });
    }
};