# OpenTrust - Government Budget Management System

<div align="center">
  <img src="client/public/vite.svg" alt="OpenTrust Logo" width="120" height="120"/>
  <p><em>Transparent, Secure, and Efficient Budget Management</em></p>
</div>

## 🌟 Features

### 👤 User Management
- **Multi-role Authentication**
  - Admin Dashboard with full control
  - Citizen Portal for budget tracking
  - Secure login and registration system
  - Role-based access control

### 💰 Budget Management
- **Comprehensive Budget Control**
  - Create and manage government budgets
  - Track allocated and spent amounts
  - Set project timelines with start and end dates
  - Monitor budget status (Active/Completed/Pending)
  - Department-wise budget allocation
  - Detailed project descriptions

### 🏛️ Department Management
- **Organized Structure**
  - Predefined government departments
  - Department-specific budget tracking
  - Ministry-level budget allocation
  - Department-wise spending analysis

### 📊 Analytics & Reporting
- **Real-time Insights**
  - Interactive budget visualization
  - Spending patterns analysis
  - Department-wise budget distribution
  - Historical budget tracking
  - Custom report generation

### 🔍 Fraud Detection
- **Advanced Security**
  - AI-powered fraud detection
  - Anomaly detection in spending patterns
  - Suspicious transaction alerts
  - Risk assessment reports
  - Real-time monitoring system

### 🎨 User Interface
- **Modern Design**
  - Responsive dashboard layout
  - Interactive data visualization
  - Dark/Light mode support
  - Mobile-friendly interface
  - Intuitive navigation

### 🔒 Security Features
- **Enterprise-grade Security**
  - JWT authentication
  - Password hashing
  - Role-based authorization
  - Secure API endpoints
  - Data encryption

## 🛠️ Technology Stack

### Frontend
- React.js with TypeScript
- Tailwind CSS for styling
- React Query for state management
- React Router for navigation
- Shadcn UI components
- Chart.js for data visualization

### Backend
- Node.js with Express
- MongoDB database
- JWT authentication
- RESTful API architecture
- TypeScript support

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/opentrust.git
cd opentrust
```

2. Install dependencies
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

3. Set up environment variables
```bash
# In server directory
cp .env.example .env
# Edit .env with your configuration

# In client directory
cp .env.example .env
# Edit .env with your configuration
```

4. Start the development servers
```bash
# Start server (from server directory)
npm run dev

# Start client (from client directory)
npm run dev
```

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Budget Endpoints
- `GET /api/budgets` - Get all budgets
- `POST /api/budgets` - Create new budget
- `PUT /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget

### Fraud Detection Endpoints
- `GET /api/fraud/reports` - Get fraud reports
- `POST /api/fraud/analyze` - Analyze transaction
- `GET /api/fraud/statistics` - Get fraud statistics

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- Your Name - Initial work - [YourGithub](https://github.com/yourusername)

## 🙏 Acknowledgments

- Thanks to all contributors who have helped shape OpenTrust
- Special thanks to the open-source community
- Inspired by the need for transparent government spending

---

<div align="center">
  <p>Made with ❤️ for transparent governance</p>
  <p>© 2024 OpenTrust. All rights reserved.</p>
</div> 