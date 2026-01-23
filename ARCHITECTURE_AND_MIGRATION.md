# CloudMart Capstone Architecture & Migration Strategy

## 1. Cloud Architecture Overview

The CloudMart platform utilizes a modern **Decoupled (Headless) Architecture**, ensuring separation of concerns between presentation, business logic, and data persistence.

### **Components:**

1.  **Frontend (Presentation Layer)**
    *   **Host:** **Vercel**
    *   **Technology:** React 18, Tailwind CSS, Axios
    *   **Role:** Serves the UI to the browser. It contains NO business logic or database credentials. It communicates with the backend solely via HTTPS JSON API calls.
    *   **Justification:** Vercel provides a global Edge Network (CDN) for fast static asset delivery and automatic CI/CD deployments from Git.

2.  **Backend (Application Layer)**
    *   **Host:** **Render**
    *   **Technology:** Python 3.10, Django 4.2, Django REST Framework (DRF)
    *   **Role:** Handles API requests, performs authentication/authorization (JWT), validates data, and orchestrates database transactions.
    *   **Justification:** Render provides a managed container environment perfect for Python web services. Django is chosen for its maturity, security features (CSRF, SQL Injection protection), and "batteries-included" ORM.

3.  **Database (Persistence Layer)**
    *   **Host:** **Neon**
    *   **Technology:** PostgreSQL 15
    *   **Role:** Persistently stores relational data (Users, Products, Orders).
    *   **Justification:** Neon offers a serverless architecture for PostgreSQL, allowing for auto-scaling and branching workflows that fit firmly into modern Agile development.

### **Diagram**

```mermaid
graph LR
    User[Browser/Client] -- HTTPS/JSON --> Vercel[Frontend (React/Vercel)]
    Vercel -- HTTPS/API Calls --> Render[Backend (Django/Render)]
    Render -- SQL/TCP --> Neon[Database (PostgreSQL/Neon)]
```

---

## 2. Migration from Supabase to Django/Neon

To meet the requirements of the IT495 Capstone Proposal, the following migration steps were taken to move away from the "Backend-as-a-Service" (BaaS) model of Supabase to a custom "Infrastructure-as-a-Service" (IaaS/PaaS) model.

### **A. Database Migration (Supabase -> Neon)**
*   **Previous:** Managed Postgres inside Supabase.
*   **New:** Independent Postgres instance on Neon.
*   **Strategy:** 
    1.  The `SUPABASE_MIGRATION.sql` schema was converted to standard Django `models.py`.
    2.  Django's ORM (`python manage.py migrate`) now manages the schema state.
    3.  Row Level Security (RLS) policies from Supabase were replaced by Django's logic-layer permissions (e.g., `IsOwnerOrAdmin` permission classes in DRF).

### **B. Authentication (Supabase Auth -> Django JWT)**
*   **Previous:** Supabase Auth (handled by GoTrue server).
*   **New:** Custom Django User Model + SimpleJWT.
*   **Reasoning:** Moving auth to the backend provides complete control over the user lifecycle and integration with academic requirements for understanding session management.
*   **Implementation:**
    *   Users post credentials to `/api/token/`.
    *   Django validates and returns an `access` and `refresh` token.
    *   Frontend stores the token (HttpOnly cookies or Secure Storage) and attaches it to the `Authorization: Bearer <token>` header of subsequent requests.

### **C. API Layer (Supabase Client -> Django REST)**
*   **Previous:** Direct DB querying from the client using `@supabase/supabase-js`.
*   **New:** Explicit REST API endpoints built with Django REST Framework.
*   **Justification:** This strictly decouples the frontend from the database schema. The frontend no longer knows table names or columns, only the JSON contract exposed by the API views.

---

## 3. Academic Justification for Technology Choices

### **Why Python/Django over Node.js?**
While Node.js is performant, **Python** is the standard language for data-heavy and scientific computing, often emphasized in computer science curricula. **Django** specifically models strict MVC (Model-View-Controller, or MVT in Django) patterns, forcing a disciplined code structure beneficial for a senior capstone project where architectural clarity is graded.

### **Why Playwright over Selenium?**
**Playwright** represents the modern standard for end-to-end testing. Unlike Selenium, it handles dynamic content (React hydration) natively without brittle "sleep" statements. Using JavaScript for testing allows the test suite to share strict typing (TypeScript) with the frontend code, reducing context switching.

### **Why No AWS?**
While AWS is industry-standard, its complexity (IAM, VPCs) can obscure the core software engineering principles demonstrated in a semester-long project. Using **Vercel** and **Render** allows the focus to remain on **Software Architecture** and **Code Quality** rather than DevOps configuration, while still delivering a true cloud-native application.

---

## 4. Compliance Checklist

| Requirement | Status | Implementation |
| :--- | :--- | :--- |
| **Backend Language** | ✅ | Python 3.10+ |
| **Backend Framework** | ✅ | Django 4.2 + DRF |
| **Database** | ✅ | PostgreSQL (Neon) |
| **Frontend** | ✅ | React (Vercel) |
| **No AWS/Supabase** | ✅ | Removed all dependencies |
| **Testing** | ✅ | Playwright |
| **Architecture** | ✅ | Decoupled REST API |
