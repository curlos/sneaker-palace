# Sneaker Palace 👟

<div align="center">
  <img src="client/public/icon.png" alt="Sneaker Palace Logo" width="120" height="120">
  
  <h3>The Ultimate Sneaker E-Commerce Experience</h3>
  
  <p>
    <a href="https://sneaker-palace.vercel.app/" target="_blank">🌐 Live Demo</a>
    ·
    <a href="https://github.com/curlos/sneaker-palace/issues">🐛 Report Bug</a>
    ·
    <a href="https://github.com/curlos/sneaker-palace/issues">✨ Request Feature</a>
  </p>
  
  <p>
    <img src="https://img.shields.io/badge/React-18.0+-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React">
    <img src="https://img.shields.io/badge/TypeScript-4.0+-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
    <img src="https://img.shields.io/badge/Node.js-18.0+-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js">
    <img src="https://img.shields.io/badge/MongoDB-6.0+-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB">
  </p>
</div>

---

## 📖 About The Project

Sneaker Palace is a modern, full-stack e-commerce platform dedicated to sneaker enthusiasts worldwide. Built with cutting-edge technologies, it offers a seamless shopping experience with over **20,000 sneakers** from **20+ premium brands** including Nike, Jordan, Adidas, New Balance, and more.

### ✨ Key Features

- **🔐 User Authentication** - Secure registration, login, and profile management
- **👟 Extensive Catalog** - 20,000+ sneakers from top brands with detailed product pages
- **🔍 Advanced Search & Filtering** - Powerful MongoDB Atlas Search with intelligent text matching, filter by brand, gender, price, size, and more
- **🛒 Shopping Cart** - Persistent cart with real-time updates and quantity management
- **💳 Secure Checkout** - Integrated Stripe payment processing
- **⭐ Review System** - User reviews with photo uploads
- **📱 Responsive Design** - Optimized for all devices with TailwindCSS
- **📦 Order Management** - Complete order history and status tracking
- **❤️ Favorites** - Save products to wishlist for later
- **🖼️ Image Upload** - Cloudinary integration for review photos

## 🛠️ Built With

### Frontend
- **React 17** - Modern UI library with hooks
- **TypeScript** - Type-safe JavaScript for better development experience
- **Redux Toolkit** - Efficient state management with RTK Query
- **TailwindCSS** - Utility-first CSS framework for rapid styling
- **React Router** - Client-side routing for SPA navigation
- **Headless UI** - Accessible React components
- **Heroicons** - Beautiful SVG icons
- **Stripe.js** - Secure payment processing

### Backend
- **Node.js** - JavaScript runtime for server-side development
- **Express.js** - Fast, unopinionated web framework
- **TypeScript** - Type safety on the server
- **MongoDB** - NoSQL database for flexible data storage
- **MongoDB Atlas Search** - Advanced full-text search capabilities
- **Mongoose** - Elegant MongoDB object modeling
- **Passport.js** - Authentication middleware
- **JWT** - Secure token-based authentication
- **Stripe API** - Payment processing
- **Cloudinary** - Image storage and optimization
- **Multer** - File upload handling
- **bcrypt** - Password hashing

### Tools & Deployment
- **Vercel** - Frontend hosting and deployment
- **MongoDB Atlas** - Cloud database hosting with search indexing
- **Cloudinary** - Image CDN and storage
- **Morgan** - HTTP request logging
- **CORS** - Cross-origin resource sharing

## 🌐 Live Demo

Visit the live website: **[https://sneaker-palace.vercel.app/](https://sneaker-palace.vercel.app/)**

## 🎯 Website Features

### 🏠 Homepage
- Hero carousel showcasing featured sneakers
- Brand showcase with popular logos
- Quick access to different categories (Men's, Women's, Kids)
- Latest arrivals and trending products

### 👟 Product Catalog
- Browse 20,000+ sneakers with high-quality images
- Advanced filtering by brand, gender, price range, size, and color
- MongoDB Atlas Search for intelligent text matching and autocomplete
- Sort by price, popularity, newest arrivals, and ratings
- Pagination for optimal performance

### 🔍 Product Details
- Comprehensive product information
- Multiple product images and zoom functionality
- Size selection with availability status
- User reviews and ratings
- Related products suggestions
- Add to cart and favorites functionality

### 🛒 Shopping Experience
- Persistent shopping cart across sessions
- Quantity adjustment and item removal
- Real-time price calculations
- Secure checkout with Stripe integration
- Guest checkout and registered user options

### 👤 User Account
- Secure user registration and authentication
- Profile management with personal information
- Order history with detailed tracking
- Favorites/wishlist management
- Review management system

### ⭐ Review System
- Write detailed product reviews
- Upload photos with your reviews
- Star rating system (1-5 stars)
- Helpful review sorting and filtering

## 🗂️ Project Structure

```
sneaker-palace/
├── client/                 # React frontend application
│   ├── public/            # Static assets and favicon
│   ├── src/
│   │   ├── api/           # API service functions
│   │   ├── components/    # Reusable React components
│   │   ├── pages/         # Page components and routing
│   │   ├── redux/         # Redux store and slices
│   │   ├── skeleton_loaders/ # Loading states
│   │   ├── types/         # TypeScript type definitions
│   │   └── utils/         # Utility functions
│   ├── package.json
│   └── tailwind.config.js # TailwindCSS configuration
│
├── server/                # Node.js backend application
│   ├── database/          # Database connection
│   ├── models/            # Mongoose data models
│   ├── routes/            # Express API routes
│   │   ├── authRouter.ts  # Authentication endpoints
│   │   ├── userRouter.ts  # User management
│   │   ├── shoeRouter.ts  # Product catalog
│   │   ├── cartRouter.ts  # Shopping cart
│   │   ├── orderRouter.ts # Order management
│   │   ├── ratingRouter.ts# Review system
│   │   └── stripeRouter.ts# Payment processing
│   ├── assets/           # Static server assets
│   ├── server.ts         # Express server setup
│   └── package.json
│
└── README.md
```

### 🔌 API Endpoints

The backend provides RESTful APIs for:

- **Authentication** (`/auth`) - Login, register, logout
- **Users** (`/users`) - Profile management, preferences
- **Shoes** (`/shoes`) - Product catalog, search, filtering
- **Cart** (`/cart`) - Shopping cart operations
- **Orders** (`/orders`) - Order creation and history
- **Ratings** (`/rating`) - Review system
- **Payments** (`/checkout`) - Stripe integration
- **Images** (`/images`) - Photo upload handling
- **Admin** (`/admin`) - Administrative functions

## 📱 Screenshots

<div align="center">

### 🏠 Homepage (Desktop & Mobile)
<img src="https://user-images.githubusercontent.com/41396365/142689973-9c4e8840-4bd3-4817-a41b-d7cfed5bb210.png" height="250" /> <img src="https://user-images.githubusercontent.com/41396365/142695769-d95be33d-4585-4d92-a688-88b40ed3628f.png" height="250" />

### 👟 Product Catalog (Desktop & Mobile)
<img src="https://user-images.githubusercontent.com/41396365/142696625-ef567e1f-f7ed-4574-8e61-8848bc1effcc.png" height="250" /> <img src="https://user-images.githubusercontent.com/41396365/142696613-19f12ad7-c324-4014-bfea-66b16832e77e.png" height="250" />

### 📱 Product Details (Desktop & Mobile)
<img src="https://user-images.githubusercontent.com/41396365/142696795-4b73ba82-c315-4ab7-b135-c9c845be2e06.png" height="250" /> <img src="https://user-images.githubusercontent.com/41396365/142696813-c59eefca-c232-448e-a137-f435ab300027.png" height="250" />

### 🛒 Shopping Cart (Desktop & Mobile)
<img src="https://user-images.githubusercontent.com/41396365/142690077-f7bde4bf-f729-4b7d-a0a6-4068dc1c20ea.png" height="250" /> <img src="https://user-images.githubusercontent.com/41396365/142695597-0a2ad142-a106-425e-b8a8-acbf1b16c02d.png" height="250" />

### 💳 Checkout (Desktop & Mobile)
<img src="https://user-images.githubusercontent.com/41396365/142690146-638dc554-8278-4297-a895-85228171bdc4.png" height="250" /> <img src="https://user-images.githubusercontent.com/41396365/142695683-b0698eae-48ea-45e7-af6f-9996bdc4aab7.png" height="250" />

</div>

## 🚀 Performance & Features

- **⚡ Fast Loading** - Optimized images and efficient data fetching
- **📱 Mobile First** - Responsive design for all screen sizes
- **🛡️ Secure** - JWT authentication and secure payment processing
- **🎨 Modern UI** - Clean, intuitive interface with smooth animations
- **🔍 Smart Search** - MongoDB Atlas Search for advanced text matching

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 🙏 Acknowledgments

- **Icons** - [Freepik](https://www.freepik.com) from [Flaticon](https://www.flaticon.com/)
- **Product Data** - Various sneaker retailers and manufacturers
- **Images** - Product images from official brand sources
- **Inspiration** - Modern e-commerce platforms and design systems

---

<div align="center">
  <p>Built with ❤️ for sneaker enthusiasts worldwide</p>
  <p>
    <a href="https://sneaker-palace.vercel.app/">Visit Sneaker Palace</a>
  </p>
</div>
