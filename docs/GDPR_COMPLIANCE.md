# GDPR Compliance Guide for SmartShop

SmartShop is committed to protecting the privacy and personal data of our users. This document outlines how we comply with the General Data Protection Regulation (GDPR).

---

## **1. Data We Collect**
We only collect data that is **strictly necessary** to provide our e-commerce services:
*   **Identity Data**: Name, Username.
*   **Contact Data**: Email address, Phone number.
*   **Transactional Data**: Order history, Shipping addresses.
*   **Technical Data**: IP address (via Cloudflare for security), Login activity logs.

## **2. Legal Basis for Processing**
*   **Contractual Necessity**: To process orders and deliver products.
*   **Legal Obligation**: To maintain financial records for tax purposes.
*   **Consent**: For marketing communications (Newsletter).

## **3. Data Subject Rights (How we comply)**

### **A. Right to Information & Transparency**
*   Our **Privacy Policy** (accessible at the footer) clearly explains what data is collected and how it is used.
*   We use a **Cookie Consent Banner** to inform users about tracking.

### **B. Right to Access & Portability**
*   Users can view their data anytime in their **User Profile**.
*   We provide a **"Download My Data"** feature in the profile settings, allowing users to export their information in JSON format.

### **C. Right to Rectification**
*   Users can update their personal information, addresses, and security settings instantly through the **Profile Dashboard**.

### **D. Right to Erasure ("Right to be Forgotten")**
*   Users have the right to delete their accounts. We provide a **"Delete Account"** button. 
*   *Note: Transactional data related to financial records may be retained as required by law (e.g., tax audits).*

## **4. Data Security & Storage**
*   **Encryption**: All traffic is encrypted via **SSL/TLS (HTTPS)** through Cloudflare.
*   **Hashing**: User passwords are encrypted using **PBKDF2/Argon2** (standard Django security).
*   **Data Residency**: All data is stored on your private VPS. We do not use third-party cloud databases (like Neon or MongoDB Atlas).
*   **Private Communications**: We use a **private SMTP mailbox** for emails, ensuring that email content and recipient addresses stay within our controlled infrastructure.

## **5. Data Minimization**
*   We do not store credit card numbers. All payments are processed through secure gateways (PayPal/Stripe) that handle PCI compliance.
*   We automatically purge expired session data from Redis.

## **6. Third-Party Processors**
We minimize third-party data sharing. Current processors include:
*   **Cloudflare**: For DNS, CDN, and Security (WAF).
*   **Dokploy**: For infrastructure management.
*   **Private SMTP**: For transactional emails.

---
**Last Updated**: February 25, 2026
**Compliance Status**: Fully Compliant
