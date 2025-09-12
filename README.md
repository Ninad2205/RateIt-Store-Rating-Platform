# 🏪 Store Rating System

A comprehensive full-stack web application for rating and managing stores with role-based access control.

## 🌟 Features

### 👤 **User Roles**
- **System Administrator**: Complete system management
- **Normal User**: Browse and rate stores
- **Store Owner**: Manage owned stores and view analytics

### 🔐 **Authentication & Security**
- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting protection
- Input validation and sanitization

### 🏬 **Store Management**
- Browse stores with search and filters
- Detailed store information display
- Store rating and review system
- Multi-store support for owners

### 🎨 **User Experience**
- Modern, responsive design
- Light/Dark mode toggle
- Real-time search with debouncing
- Toast notifications
- Loading states and error handling

## 🛠️ **Tech Stack**

### **Backend**
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **helmet** - Security headers
- **express-rate-limit** - Rate limiting

### **Frontend**
- **React.js** - UI framework
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **React Hook Form** - Form handling
- **React Hot Toast** - Notifications
- **Lucide React** - Icons

##  **Getting Started**

### **Prerequisites**
- Node.js (v14 or higher)
- MySQL Server
- npm or yarn

### **Installation**

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd store-rating-system
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   npm install
   
   # Install frontend dependencies
   cd client
   npm install
   cd ..
   ```

3. **Database Setup**
   ```bash
   # Login to MySQL
   mysql -u root -p
   
   # Create database
   CREATE DATABASE store_rating_system;
   
   # Run the database setup script
   node setup-db.js
   ```

4. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=store_rating_system
   JWT_SECRET=your_jwt_secret_key
   PORT=5000
   ```

5. **Start the Application**
   ```bash
   # Start backend server (Terminal 1)
   npm run server
   
   # Start frontend (Terminal 2)
   cd client
   npm start
   ```

6. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 👥 **Default Users**

### **System Administrator**
- **Email**: admin@store-rating.com
- **Password**: password

## 📊 **Database Schema**

### **Users Table**
- id, name, email, address, role, password, created_at

### **Stores Table**
- id, name, email, address, owner_id, created_at, updated_at

### **Ratings Table**
- id, user_id, store_id, rating, comment, created_at

## 🔄 **API Endpoints**

### **Authentication**
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### **Admin Routes**
- `GET /api/admin/users` - Get all users
- `POST /api/admin/users` - Create user
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/stores` - Get all stores
- `POST /api/admin/stores` - Create store
- `PUT /api/admin/stores/:id` - Update store
- `DELETE /api/admin/stores/:id` - Delete store

### **Store Routes**
- `GET /api/stores` - Get all stores (public)
- `GET /api/stores/my-store` - Get owner's stores
- `PUT /api/stores/my-store/:id` - Update store
- `POST /api/stores/:id/rate` - Rate a store

### **User Routes**
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile

## 🎯 **Key Features Implemented**

### **Admin Panel**
- ✅ User management (CRUD operations)
- ✅ Store management (CRUD operations)
- ✅ Advanced search and filtering
- ✅ Store rating display for store owners

### **Store Owner Dashboard**
- ✅ Multi-store management
- ✅ Real-time rating analytics
- ✅ Review management
- ✅ Store information editing

### **User Experience**
- ✅ Responsive design
- ✅ Light/Dark mode
- ✅ Debounced search
- ✅ Form validations
- ✅ Error handling

## 🔒 **Security Features**

- Password hashing with salt
- JWT token authentication
- Rate limiting (100 requests/15 minutes)
- Input validation and sanitization
- SQL injection prevention
- XSS protection headers

## 🚀 **Local Development & Deployment**

### **Quick Start**
```bash
# Install dependencies
npm run install-all

# Setup database
npm run setup

# Start development server
npm run dev
```

### **Production Build**
```bash
# Build frontend for production
npm run build

# Start production server
npm run server
```

### **Environment Variables**
Create a `.env` file in the root directory:
```env
NODE_ENV=development
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=store_rating_system
JWT_SECRET=your_strong_jwt_secret
```

---
