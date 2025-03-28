# OpenTrust - Government Budget Management System

![OpenTrust Logo](logo.png)

here is project being live🚀

https://opentrustglobal-frontend.onrender.com/

your account is a treasure to us❤️😍

**Transparent, Secure, and Efficient Budget Management**

## 🌟 Features

### 👤 User Management
```mermaid
flowchart TD
  A[User Registration] -->|Login| B[Authentication]
  B --> C{Role-based Access}
  C -->|Admin| D[Admin Dashboard]
  C -->|Citizen| E[Citizen Portal]
```
- Multi-role Authentication
- Admin Dashboard with full control
- Citizen Portal for budget tracking
- Secure login and registration system
- Role-based access control

### 💰 Budget Management
```mermaid
flowchart TD
  A[Create Budget] --> B[Allocate Funds]
  B --> C[Track Spending]
  C --> D{Status}
  D -->|Active| E[Monitor]
  D -->|Completed| F[Archive]
  D -->|Pending| G[Review]
```
- Comprehensive Budget Control
- Create and manage government budgets
- Track allocated and spent amounts
- Set project timelines with start and end dates
- Monitor budget status (Active/Completed/Pending)
- Department-wise budget allocation
- Detailed project descriptions

### 🏛️ Department Management
```mermaid
graph TD
  A[Government] -->|Ministries| B[Departments]
  B -->|Budgets| C[Allocation]
  C -->|Spending| D[Analysis]
```
- Organized Structure
- Predefined government departments
- Department-specific budget tracking
- Ministry-level budget allocation
- Department-wise spending analysis

### 📊 Analytics & Reporting
```mermaid
pie
  title Budget Distribution
  "Education" : 30
  "Healthcare" : 25
  "Infrastructure" : 20
  "Defense" : 15
  "Other" : 10
```
- Real-time Insights
- Interactive budget visualization
- Spending patterns analysis
- Department-wise budget distribution
- Historical budget tracking
- Custom report generation

### 🔍 Fraud Detection
```mermaid
sequenceDiagram
  participant User
  participant System
  participant AI_Model
  User->>System: Submit Transaction
  System->>AI_Model: Analyze Transaction
  AI_Model-->>System: Risk Assessment
  System-->>User: Alert if Fraud Detected
```
- AI-powered fraud detection
- Anomaly detection in spending patterns
- Suspicious transaction alerts
- Risk assessment reports
- Real-time monitoring system

### 🎨 User Interface
- Modern Design
- Responsive dashboard layout
- Interactive data visualization
- Dark/Light mode support
- Mobile-friendly interface
- Intuitive navigation

### 🔒 Security Features
```mermaid
flowchart TD
  A[User Login] --> B[JWT Token]
  B --> C{Authorization}
  C -->|Valid| D[Access Granted]
  C -->|Invalid| E[Access Denied]
```
- JWT authentication
- Password hashing
- Role-based authorization
- Secure API endpoints
- Data encryption

## 🛠️ Technology Stack
```mermaid
mindmap
  root((Technology Stack))
    Frontend
      React.js
      Tailwind CSS
      React Query
      Chart.js
    Backend
      Node.js
      Express.js
      MongoDB
      JWT Authentication
```

### 🚀 Getting Started

#### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

#### Installation
```sh
# Clone the repository
git clone https://github.com/yourusername/opentrust.git
cd opentrust

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

#### Set up environment variables
```sh
# In server directory
cp .env.example .env
# Edit .env with your configuration

# In client directory
cp .env.example .env
# Edit .env with your configuration
```

#### Start the development servers
```sh
# Start server (from server directory)
npm run dev

# Start client (from client directory)
npm run dev
```

## 📝 API Documentation

### Authentication Endpoints
```mermaid
sequenceDiagram
  participant Client
  participant Server
  Client->>Server: POST /api/auth/register
  Client->>Server: POST /api/auth/login
  Client->>Server: POST /api/auth/logout
```

### Budget Endpoints
```mermaid
flowchart TD
  A[Client Request] --> B[GET /api/budgets]
  A --> C[POST /api/budgets]
  A --> D[PUT /api/budgets/:id]
  A --> E[DELETE /api/budgets/:id]
```

### Fraud Detection Endpoints
```mermaid
flowchart TD
  A[Transaction] --> B[Analyze]
  B --> C{Fraud?}
  C -->|Yes| D[Flag Alert]
  C -->|No| E[Approve Transaction]
```

## 🤝 Contributing
```mermaid
graph TD
  A[Fork Repository] --> B[Create Feature Branch]
  B --> C[Commit Changes]
  C --> D[Push Branch]
  D --> E[Open Pull Request]
```
- Fork the repository
- Create your feature branch (`git checkout -b feature/AmazingFeature`)
- Commit your changes (`git commit -m 'Add some AmazingFeature'`)
- Push to the branch (`git push origin feature/AmazingFeature`)
- Open a Pull Request

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors
- Abdiawal Aden - Initial work - https://github.com/awale398

## 🙏 Acknowledgments
- Thanks to all contributors who have helped shape OpenTrust
- Special thanks to the open-source community
- Inspired by the need for transparent government spending
- Made with ❤️ for transparent governance

© 2025 OpenTrust. All rights reserved.


