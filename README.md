# CloudMart E-Commerce Application

A complete full-stack e-commerce application designed for AWS hosting. This project demonstrates a decoupled architecture with a React frontend and a Node.js/Express backend using Sequelize ORM with MySQL (AWS RDS).

## 🚀 Quick Start (Frontend Preview)

This environment runs the **Frontend** immediately in your browser using a **Mock API**.
To see the full backend integration, follow the "Backend Setup" instructions below locally.

## 🛠 Tech Stack

**Frontend:**
- React 18 (TypeScript)
- Tailwind CSS (Styling)
- Context API (State Management)
- Axios (API Requests)

**Backend:**
- Node.js & Express
- Sequelize ORM
- MySQL (AWS RDS)
- JWT (JSON Web Tokens) & Bcrypt

**Infrastructure (AWS):**
- **EC2**: Hosts the Node.js Backend and React Frontend (via Nginx/S3).
- **RDS**: Managed MySQL Database.
- **S3**: Object storage for product images.

---

## 📂 Project Structure

```
/
├── index.html              # Entry HTML
├── index.tsx               # React Entry
├── App.tsx                 # Main Component & Routing
├── services/
│   └── api.ts              # API Service (Axios + Mock Mode)
├── components/             # Reusable UI Components
├── pages/                  # Page Views (Home, Admin, Login)
├── backend/                # Backend Source Code (Reference)
│   ├── server.js           # Entry Point
│   ├── config/db.js        # Database Connection
│   ├── models/             # Sequelize Models
│   ├── routes/             # Express Routes
│   └── middleware/         # Auth Middleware
└── README.md
```

---

## 🔧 Backend Setup (Local & AWS)

To run the backend, you must export the files located in the `backend/` directory of this project to your local machine or EC2 instance.

### 1. Environment Variables (.env)
Create a `.env` file in the `backend/` root:

```env
PORT=5000
DB_HOST=your-rds-endpoint.us-east-1.rds.amazonaws.com
DB_USER=admin
DB_PASS=yourpassword
DB_NAME=ecommerce_db
JWT_SECRET=your_super_secret_key
```

### 2. Install Dependencies
```bash
cd backend
npm init -y
npm install express sequelize mysql2 dotenv bcryptjs jsonwebtoken cors helmet
```

### 3. Run Server
```bash
node server.js
```

---

## ☁️ AWS Deployment Architecture

### 1. Database (AWS RDS)
1. Go to RDS Console > Create Database > MySQL.
2. Select "Free Tier".
3. **Public Access**: No (for security) or Yes (for easier development).
4. Security Group: Allow Inbound on port `3306` from your EC2 instance security group.

### 2. Backend (AWS EC2)
1. Launch an EC2 instance (Ubuntu/Amazon Linux 2).
2. Install Node.js: `curl -fsSL https://rpm.nodesource.com/setup_16.x | bash -`
3. Clone/Copy your backend code.
4. Set environment variables.
5. Use **PM2** to keep the app running: `npm install -g pm2 && pm2 start server.js`.

### 3. Frontend (AWS S3 + CloudFront)
1. Build the React app: `npm run build`.
2. Create an S3 Bucket (Enable Static Website Hosting).
3. Upload the `dist/` or `build/` contents.
4. (Optional) Set up CloudFront for HTTPS and caching.

---

## 🔐 Security Features
- **BCrypt**: Hashes passwords before storage.
- **JWT**: Stateless authentication for API routes.
- **RBAC**: Middleware ensures only 'admin' role can modify products.
- **Environment Variables**: Sensitive credentials never committed to code.

## 🔮 Future Enhancements
- Integration with Stripe for payments.
- Real-time order updates using WebSockets.
- Terraform scripts for Infrastructure as Code (IaC).
