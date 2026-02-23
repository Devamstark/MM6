# 🚀 SmartShop - Future Roadmap & Planned Features

This document outlines the planned enhancements and future feature sets for the SmartShop e-commerce platform. These features are prioritized to transition the application from a robust MVP to a market-ready "Super App."

---

## 🤖 1. AI & Intelligent Search
*   **AI Product Recommendations**: 
    *   *Implementation*: Use a recommendation engine (item-to-item collaborative filtering) to show "Frequently Bought Together" on product pages.
*   **Visual Search (Image Discovery)**: 
    *   *Implementation*: Integrate a computer vision API (like AWS Rekognition or specialized JS models) to allow users to search for products using photos.
*   **Smart AI Chatbot**: 
    *   *Implementation*: A GPT-integrated support bot to handle order tracking queries, product suggestions, and FAQ resolution.

## 📱 2. Enhanced User Experience (UX)
*   **Persistent Wishlist**: 
    *   *Implementation*: A new database model `Wishlist` and a dedicated frontend page for users to curate collections.
*   **Back-in-Stock Notifications**: 
    *   *Implementation*: A subscription service that sends an email or push notification when a product's `stock_quantity` increases from 0.

## 💳 3. Marketing & Conversion Tools
*   **Coupon & Promo Code Engine**: 
    *   *Implementation*: A `DiscountCode` model with validation logic at the checkout stage.
*   **Abandoned Cart Recovery**: 
    *   *Implementation*: A Celery/Redis background task that emails users who have left items in their cart for more than 24 hours.
*   **Loyalty Points Program**: 
    *   *Implementation*: Reward users with "SmartPoints" for every purchase, redeemable as currency in future orders.

## 📦 4. Logistics & Post-Purchase
*   **Real-time Shipping Tracker**: 
    *   *Implementation*: API integration with shipping carriers (mocked for development) to show package location on an interactive map.
*   **Automated Returns Portal**: 
    *   *Implementation*: A self-service portal for users to initiate returns and receive automated QR codes for shipping.
*   **Verified Social Proof**: 
    *   *Implementation*: Display a "LIVE" toast message when other users make purchases to create a sense of platform activity.

## 🛡️ 5. Advanced Security (The Next Level)
*   **Two-Factor Authentication (2FA)**: 
    *   *Implementation*: Integrate TOTP (Time-based One-Time Password) for Admin and Seller accounts via apps like Google Authenticator.
*   **Automated Image Optimization Pipeline**: 
    *   *Implementation*: A backend hook that uses `Pillow` to automatically resize and convert all uploaded MinIO images to **WebP** format for faster loading.
*   **Security Audit Logging**: 
    *   *Implementation*: Track all "Sensitive Actions" (like password changes or admin logins) in a dedicated, immutable audit log.

---

**Last Updated**: February 2026  
**Status**: Planning Phase
