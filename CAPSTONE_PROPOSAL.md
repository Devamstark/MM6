# Senior Capstone Project Proposal: CloudMart E-Commerce Platform

## 1. Project Description

**CloudMart** is a comprehensive, scalable, and secure B2C e-commerce platform designed to facilitate seamless interactions between buyers, sellers, and administrators. This project integrates modern software engineering principles with a robust, decoupled cloud architecture to simulate a real-world enterprise application.

The platform solves the complexity of managing multi-role inventory and sales data by providing three distinct user interfaces:
1.  **Shopper Interface:** A responsive storefront for product discovery, advanced filtering (by category, price, brand), cart management, and secure checkout simulation.
2.  **Seller Dashboard:** A dedicated portal for third-party merchants to manage their inventory, view sales analytics (revenue, units sold), and track order fulfillment.
3.  **Admin Dashboard:** A centralized control panel for platform oversight, allowing administrators to manage users, monitor global system health, and enforce content policies.

By decoupling the frontend and backend, CloudMart adheres to modern web development standards, ensuring high maintainability, testability, and scalability. The project serves as a practical demonstration of Agile SDLC methodologies, from requirement elicitation to automated testing and cloud deployment.

---

## 2. Technology Stack

This project utilizes a modern, verified technology stack selected for its industry relevance, stability, and alignment with academic integrity requirements.

### **Frontend (Client-Side)**
*   **Language:** JavaScript (ES6+), HTML5, CSS3
*   **Framework:** **React.js** (for component-based UI architecture)
*   **Styling:** Tailwind CSS (utility-first styling for responsiveness)
*   **Deployment:** **Vercel** (Global Content Delivery Network)

### **Backend (Server-Side)**
*   **Language:** **Python 3.x**
*   **Framework:** **Django** (High-level web framework for rapid development)
*   **API Layer:** **Django REST Framework (DRF)** (for building RESTful APIs)
*   **Authentication:** JWT (JSON Web Tokens) for stateless, secure session management
*   **Deployment:** **Render** (Containerized generic web service)

### **Database (Persistence)**
*   **Database Engine:** **PostgreSQL** (Enterprise-grade relational database)
*   **Hosting:** **Neon** (Serverless PostgreSQL platform)

### **Quality Assurance & Testing**
*   **End-to-End Testing:** **Playwright** (JavaScript-based automated browser testing)
*   **Unit Testing:** Python `unittest` / Django Test Suite

---

## 3. Cloud Architecture & Deployment

The application follows a **Decoupled (Headless) Architecture**, ensuring a clean separation of concerns:

1.  **Presentation Layer (Frontend):**
    *   Hosted on **Vercel**, the React application serves as the user interface. It consumes the backend API via HTTPS requests. Vercel provides automatic deployments from Git, ensuring a continuous delivery pipeline.

2.  **Logic Layer (Backend):**
    *   Hosted on **Render**, the Django/Python application handles all business logic, data validation, and API routing. It exposes a strictly typed REST API to the frontend.
    *   **Security:** This layer implements Role-Based Access Control (RBAC) to ensure only authorized users (e.g., Sellers/Admins) can modify sensitive data.

3.  **Data Layer (Database):**
    *   Hosted on **Neon**, the PostgreSQL database stores relational data including users, products, orders, and payment records. It is connected to the backend via a secure, encrypted connection string.

**Deployment Diagram:**
`[React/Vercel] <HTTPS / JSON> [Django/Render] <TCP / SQL> [PostgreSQL/Neon]`

---

## 4. Technical Justification

### **Integration of Python & JavaScript**
The decision to separate the frontend (JavaScript/React) from the backend (Python/Django) leverages the strengths of both ecosystems:
*   **Python (Backend):** Selected for its clear syntax and robust standard libraries, Python simplifies complex data modeling and business logic implementation. Django was chosen over other frameworks for its "batteries-included" approach to security (CSRF protection, SQL injection prevention) and its mature ORM (Object-Relational Mapping).
*   **JavaScript (Frontend & Testing):** A rich, interactive user interface is best achieved with a browser-native language. React allows for modular, reusable components. Furthermore, using JavaScript for **Playwright** testing aligns the testing environment with the browser environment, allowing for highly accurate simulation of user behaviors.

### **SDLC & Agile Methodology**
The project follows an Iterative, Agile development lifecycle:
*   **Sprint-based Development:** Features are broken down into user stories (e.g., "As a Seller, I want to update stock levels").
*   **CI/CD Pipeline:** Code changes are version-controlled via Git. Front-end deployments are automated via Vercel, ensuring rapid feedback loops.

---

## 5. Compliance & Security Features
*   **Authentication:** Custom user model in Django handling secure password hashing (PBKDF2) and JWT generation.
*   **Authorization:** Custom permissions in DRF ensure standard users cannot access Seller or Admin endpoints.
*   **Data Integrity:** PostgreSQL constraints (Foreign Keys, Unique constraints) prevent invalid data states.
*   **Environment Security:** All sensitive credentials (DB URLs, Secret Keys) are decoupled from the codebase using environment variables.
