# ✅ New Issues & Fix Plan (Updated)

## 1. Fix Search Button Not Working
**Problem:** The search button is currently locked and not responding.

**Plan:** Implement **Database Search & Auto-suggestions**. We will create a backend endpoint that returns search results and keyword suggestions using optimized database queries (compatible with Postgres/SQLite), avoiding the high cost of ElasticSearch.

## 2. Fix Wishlist Button Not Working
**Problem:** The wishlist button is locked and not functioning.

**Plan:** We will enable the wishlist feature so users can add products to their wishlist and store them in their account.

## 3. Fix Login Session Persistence Issue
**Problem:** After logging in, refreshing the page sends users back to the sign-in page.

**Plan:** Implement proper session handling using cookies, JWT tokens, or local storage so users stay logged in after refreshing the page.
