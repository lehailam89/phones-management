# 📱 Lâm Mobiles - Hệ thống quản lý cửa hàng điện thoại

Dự án website bán điện thoại với đầy đủ chức năng quản lý admin và giao diện người dùng hiện đại.

## 🌟 Tính năng chính

### 🛒 Giao diện khách hàng (Client)
- **Trang chủ**: Hiển thị sản phẩm nổi bật, mới nhất với slider ảnh
- **Danh sách sản phẩm**: Tìm kiếm, lọc theo danh mục, sắp xếp theo giá/tên
- **Chi tiết sản phẩm**: Gallery ảnh với swiper, thông tin chi tiết, bình luận đa cấp
- **Giỏ hàng**: Thêm/xóa sản phẩm, cập nhật số lượng, hiển thị giá khuyến mãi
- **Thanh toán**: Form thông tin giao hàng, xác nhận đơn hàng
- **Tài khoản**: Đăng ký/đăng nhập, quản lý thông tin, lịch sử đơn hàng
- **Chat AI**: Trợ lý ảo tư vấn sản phẩm với Google Gemini API
- **Blog**: Đọc bài viết về công nghệ

### 🔧 Bảng điều khiển Admin
- **Dashboard**: Thống kê tổng quan với biểu đồ
- **Quản lý sản phẩm**: CRUD, upload nhiều ảnh, phân loại danh mục
- **Quản lý danh mục**: Cấu trúc cây phân cấp
- **Quản lý đơn hàng**: Xem chi tiết, theo dõi trạng thái
- **Quản lý tài khoản**: Admin và Client
- **Phân quyền**: Hệ thống RBAC với roles và permissions
- **Quản lý bài viết**: Editor WYSIWYG
- **Cài đặt**: Thông tin cửa hàng, logo, liên hệ

## 🛠️ Công nghệ sử dụng

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Web framework
- **MongoDB** - Database NoSQL
- **Mongoose** - ODM cho MongoDB
- **Pug** - Template engine
- **Cloudinary** - Cloud storage cho ảnh

### Frontend
- **Bootstrap 4** - CSS framework
- **jQuery** - JavaScript library
- **Font Awesome** - Icons
- **Swiper.js** - Slider/carousel
- **TinyMCE** - Rich text editor

### AI & APIs
- **Google Gemini AI** - Chatbot thông minh
- **RAG (Retrieval-Augmented Generation)** - Tư vấn sản phẩm

### Security & Utils
- **bcryptjs/md5** - Mã hóa mật khẩu
- **express-flash** - Thông báo flash
- **method-override** - Support HTTP verbs
- **multer** - File upload middleware

## 📁 Cấu trúc project

```
c:\code\phones-management\
├── 📂 controllers/          # Controllers xử lý logic
│   ├── admin/              # Controllers admin
│   └── client/             # Controllers client
├── 📂 models/              # Mongoose models
├── 📂 routes/              # Route definitions
│   ├── admin/              # Admin routes
│   └── client/             # Client routes
├── 📂 views/               # Pug templates
│   ├── admin/              # Admin views
│   └── client/             # Client views
├── 📂 public/              # Static files
│   ├── css/               # Stylesheets
│   ├── js/                # JavaScript files
│   └── images/            # Static images
├── 📂 middlewares/         # Custom middlewares
├── 📂 helpers/             # Helper functions
├── 📂 validates/           # Input validation
├── 📂 config/              # Configuration files
└── 📂 node_modules/        # Dependencies
```

## 🚀 Hướng dẫn cài đặt

### 1. Clone repository
```bash
git clone https://github.com/lehailam89/phones-management
cd phones-management
```

### 2. Cài đặt dependencies
```bash
npm install
```

### 3. Cấu hình môi trường
Tạo file `.env` trong thư mục gốc:
```env
PORT=3000

# Database MongoDB
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/database-name

# Cloudinary (Image Storage)
CLOUD_NAME=your_cloudinary_name
CLOUD_KEY=your_cloudinary_api_key
CLOUD_SECRET=your_cloudinary_api_secret

# Email Configuration (Nodemailer)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Google AI (Gemini)
GOOGLE_GENERATIVE_AI_KEY=your_gemini_api_key
```

⚠️ **Lưu ý bảo mật:** 
- Không bao giờ commit file `.env` vào repository
- Thêm `.env` vào file `.gitignore`
- Sử dụng environment variables trên production server

### 4. Khởi chạy ứng dụng
```bash
# Development mode
npm run dev

# Production mode
npm start
```

Truy cập: `http://localhost:3000`


## 🗃️ Database Models

### Products (Sản phẩm)
- title, description, price, discountPercentage
- thumbnail, images[], stock, position
- product_category_id, featured, status
- comments[] (với replies đa cấp)

### Users (Khách hàng)
- fullName, email, password, phone
- avatar, status, tokenUser

### Orders (Đơn hàng)
- userInfo: {fullName, phone, address}
- products[], totalPrice, createdAt

### ProductCategory (Danh mục)
- title, description, thumbnail
- parent_id (cấu trúc cây), position, status

### Accounts (Admin)
- fullName, email, password, phone
- avatar, role_id, token, status

### Roles & Permissions
- Roles: title, description, permissions[]
- RBAC system với chi tiết quyền

## 🔐 Hệ thống phân quyền (RBAC)

### Roles mẫu:
- **Super Admin**: Toàn quyền hệ thống
- **Manager**: Quản lý sản phẩm, đơn hàng
- **Staff**: Chỉ xem và chỉnh sửa cơ bản
- **Viewer**: Chỉ xem dữ liệu

### Permissions:
```javascript
[
  "products_view", "products_create", "products_edit", "products_delete",
  "categories_view", "categories_create", "categories_edit", "categories_delete",
  "accounts_view", "accounts_create", "accounts_edit", "accounts_delete",
  "roles_view", "roles_create", "roles_edit", "roles_permissions",
  "orders_view", "posts_view", "posts_create"
]
```

## 🤖 Chat AI Features

### RAG System:
- **Intent Analysis**: Phân tích ý định người dùng
- **Product Search**: Tìm kiếm sản phẩm thông minh
- **Context Awareness**: Hiểu ngữ cảnh cuộc trò chuyện
- **Smart Fallback**: Xử lý khi AI API lỗi

### Supported Intents:
- `search_product` - Tìm sản phẩm
- `price_inquiry` - Hỏi giá
- `promotion_inquiry` - Khuyến mãi
- `store_info` - Thông tin cửa hàng
- `product_comparison` - So sánh sản phẩm

## 📊 Tính năng nâng cao

### 🖼️ Multi-image Upload
- Cloudinary integration
- Thumbnail + Gallery images
- Image optimization
- Responsive display

### 💬 Comment System
- Nested replies (đa cấp)
- AJAX real-time
- User authentication
- Timestamp formatting

### 🛒 Shopping Cart
- Session-based cart
- Price calculations
- Discount handling
- Responsive design

### 📱 Responsive Design
- Mobile-first approach
- Bootstrap grid system
- Touch-friendly interface
- Cross-browser compatible

## 🔧 Scripts

```json
{
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js",
    "test": "echo \"No test specified\"",
    "lint": "eslint . --ext .js",
    "format": "prettier --write ."
  }
}
```

## 📈 Performance Optimizations

- **Database Indexing**: Tối ưu queries
- **Image Optimization**: Cloudinary auto-optimization
- **Caching**: Session & static file caching
- **Pagination**: Giảm tải server
- **Lazy Loading**: Images và content

## 🛡️ Security Features

- **Password Hashing**: MD5/bcrypt
- **Input Validation**: Server-side validation
- **CSRF Protection**: Method override
- **Session Management**: Secure cookies
- **File Upload Security**: Type và size validation

## 🔮 Roadmap

### Phase 1 (Completed) ✅
- [x] Basic CRUD operations
- [x] User authentication
- [x] Shopping cart
- [x] Order management
- [x] Admin panel

### Phase 2 (Completed) ✅
- [x] AI Chatbot integration
- [x] Advanced permissions
- [x] Multi-image upload
- [x] Comment system
- [x] Blog functionality

### Phase 3 (Future) 📋
- [ ] Payment gateway integration
- [ ] Real-time notifications
- [ ] Advanced analytics
- [ ] Mobile app API
- [ ] Multi-language support
- [ ] Advanced SEO features

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Liên hệ

- **Developer**: Lê Hải Lâm
- **Email**: lehailamltk@gmail.com
- **GitHub**: [@lehailam89](https://github.com/lehailam89)
- **Demo**: [https://phones-management-seven.vercel.app/](https://phones-management-seven.vercel.app/)


### 🏆 Key Highlights

- 🚀 **Full-stack JavaScript** with modern tools
- 🤖 **AI-powered chatbot** for customer support
- 🛒 **Complete e-commerce** functionality
- 🔐 **Advanced RBAC** permission system
- 📱 **Responsive design** for all devices
- ☁️ **Cloud integration** with Cloudinary
- 💾 **MongoDB** for scalable data storage




