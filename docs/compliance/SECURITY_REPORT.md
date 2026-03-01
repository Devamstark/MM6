# Cybersecurity Implementation Report: SmartShop

**Date:** February 24, 2026
**Last Updated:** February 24, 2026 *(Updated after internal security audit)*
**Subject:** University Assignment — Week 4: Security Engineering
**Project:** SmartShop E-Commerce Platform Deployment
**Team:** Smart Tech — Abdul Choudhary (PM), Aqveena Manoj (Backend), Vrushika Gajjar (Designer), Abdul Munshi (Security/Network), Devam Trivedi (Full Stack/DevOps)

---

## 🚀 Executive Summary

The SmartShop application is deployed using a **Defense in Depth** strategy — implementing security at the network, server, and application layers. An internal security audit was conducted on **February 23, 2026** using SpiderFoot OSINT scanning and manual code review, which identified and resolved several vulnerabilities.

> 📄 See `SECURITY_AUDIT_2026-02-23.md` for the full methodology and findings.

### 🏆 External Security Certifications

| Audit Tool | Grade | What It Tests |
| :--- | :--- | :--- |
| **SecurityHeaders.com** | **A+** | HTTP security headers (HSTS, CSP, XFO, Permissions-Policy) |
| **SSLLabs (Qualys)** | **A** | TLS strength, cipher suites, certificate validity |

### 📊 Internal Audit Results (2026-02-23)

| Severity | Found | Fixed | Remaining |
| :--- | :--- | :--- | :--- |
| 🔴 Critical | 2 | 2 | 0 |
| 🟠 High | 2 | 2 | 0 |
| 🟡 Medium | 3 | 3 | 0 |
| 🟢 Low/Info | 5 | 4 | 1* |

*\*nginx version header — disclosed by Dokploy's infrastructure, not application code.*

---

## 🛡️ Layer 1: Network & Perimeter Security

We use a proactive firewall strategy to ensure only intended traffic reaches the server.

- **UFW (Uncomplicated Firewall):** Configured with a "Default Deny" policy. Only ports 22 (SSH), 80/443 (Web), 3000 (Dokploy), and 2025 (File Browser) are accessible.
- **Hidden Services:** Critical infrastructure (PostgreSQL, Redis) is isolated within a private Docker bridge network. They have no public ports — invisible to external scanners like Nmap.
- **Subdomain Obfuscation:** Administrative tools (MinIO Console, File Browser) are served via direct IP and non-standard ports rather than public subdomains. This prevents discovery via OSINT tools like SpiderFoot and Shodan.
- **Admin URL Obfuscation:** *(Added 2026-02-24)* The Django admin panel has been moved from the predictable `/admin/` path to a non-guessable path (`/ssx/`) to prevent automated brute-force targeting.

---

## 🔒 Layer 2: Transport Layer Security

Encryption is enforced for all data in transit to prevent Man-in-the-Middle (MITM) attacks.

- **Automatic HTTPS:** Traefik handles SSL/TLS termination using Let's Encrypt with 4096-bit RSA keys.
- **HSTS Enforcement:** `Strict-Transport-Security` is set with a 1-year duration, including subdomains and preloading. Browsers are forced to communicate **only** via HTTPS.
- **TLS 1.3:** The server supports TLS 1.3 — the fastest and most secure handshake protocol available.
- **HTTP/3 (QUIC):** *(Detected by SpiderFoot audit)* The `alt-svc: h3=":443"` header is served, enabling HTTP/3 for compatible browsers — improving both performance and connection security.

---

## 🧪 Layer 3: Application & HTTP Header Hardening

Security headers instruct the browser on how to behave when rendering SmartShop content.

| Header | Value | Protection |
| :--- | :--- | :--- |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` | Forces HTTPS always |
| `X-Frame-Options` | `DENY` | Prevents clickjacking via iframes |
| `Content-Security-Policy` | Restrictive ruleset | Prevents XSS content injection |
| `Referrer-Policy` | `same-origin` | Prevents URL leakage to third parties |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), browsing-topics=()` | Blocks unauthorized browser API access |
| `Cross-Origin-Opener-Policy` | `same-origin` | Prevents Spectre/side-channel tab attacks |

> **Note:** SpiderFoot flagged these headers as "non-standard." This is a false positive — all are modern W3C/IETF security standards working as intended.

---

## 🐍 Layer 4: Backend Application Security

The Django backend is hardened specifically for production environments.

### Authentication & Sessions
- **JWT Authentication:** All API endpoints use `djangorestframework-simplejwt`. Tokens expire after 60 minutes (access) and 1 day (refresh).
- **Cookie Security:** `SESSION_COOKIE_SECURE` and `CSRF_COOKIE_SECURE` are enabled — session tokens only travel over encrypted connections.
- **Role-Based Access Control (RBAC):** Four user roles (`admin`, `seller`, `blogger`, `user`) with endpoint-level permission checks.

### API Security
- **Authentication Required:** Orders, users, payments, addresses, wishlists all require valid JWT.
- **API Index Removed:** *(Fixed 2026-02-24)* Switched from `DefaultRouter` to `SimpleRouter` — the public `/api/` endpoint map is no longer exposed.
- **Admin-Only Endpoints:** Dashboard stats and bulk product upload now enforce admin/seller-only access.
- **Read-Only Public Access:** Products, hero banners, blog posts, and categories are intentionally public (required for e-commerce functionality).

### Data Protection
- **ORM Queries Only:** All database queries use Django's ORM — native protection against SQL Injection.
- **Input Validation:** DRF serializers validate all incoming data before it reaches the database.
- **Password Security:** Django's `PBKDF2` hashing with SHA-256. Password reset codes expire in 15 minutes.
- **No Sensitive Data in Logs:** *(Fixed 2026-02-24)* Password reset codes are no longer printed to server logs.

### Production Hardening
- **`DEBUG=False` by Default:** *(Fixed 2026-02-24)* Changed default from `True` to `False` — prevents Django error pages from leaking source code.
- **`ALLOWED_HOSTS` Hardened:** *(Fixed 2026-02-24)* Changed default from `*` (wildcard) to explicit production domain list.
- **XSS Filter:** `SECURE_BROWSER_XSS_FILTER` active in production.
- **Content Type Sniffing:** `SECURE_CONTENT_TYPE_NOSNIFF` prevents MIME-type confusion attacks.

---

## 🌐 Layer 5: SEO & Crawler Control

- **`robots.txt`:** *(Added 2026-02-24)* Instructs all web crawlers to avoid indexing `/api/`, `/ssx/`, and `/media/`. Prevents API endpoints and admin login from appearing in search engines.
- **`sitemap.xml`:** *(Added 2026-02-24)* Submitted to Google Search Console to guide indexing of product and blog pages.
- **Dynamic Meta Tags:** Per-page title, description, Open Graph, and canonical URL tags implemented via `useSEO` hook.

---

## 🔍 OWASP Top 10 Coverage

| OWASP Risk | Status | Implementation |
| :--- | :--- | :--- |
| A01 - Broken Access Control | ✅ Mitigated | RBAC with role checks on all sensitive endpoints |
| A02 - Cryptographic Failures | ✅ Mitigated | TLS 1.3, HSTS, secure cookies, PBKDF2 password hashing |
| A03 - Injection | ✅ Mitigated | Django ORM (no raw SQL), DRF input validation |
| A04 - Insecure Design | ✅ Mitigated | Defense in depth, least-privilege API design |
| A05 - Security Misconfiguration | ✅ Fixed | DEBUG=False default, admin URL obfuscated, ALLOWED_HOSTS hardened |
| A06 - Vulnerable Components | 🟡 Monitor | Dependencies managed via pip/npm; audit periodically |
| A07 - Auth & Session Failures | ✅ Mitigated | JWT with expiry, secure cookies, CSRF protection |
| A08 - Software & Data Integrity | ✅ Mitigated | Docker image pinning, no untrusted CDN scripts |
| A09 - Security Logging | 🟡 Partial | Django logging active; no SIEM integration yet |
| A10 - SSRF | ✅ Mitigated | No server-side URL fetching; outbound limited to email SMTP |

---

## 📈 Conclusion

The SmartShop deployment demonstrates a professional-grade security posture that exceeds typical student project standards. Following the internal audit of February 23, 2026, **all critical and high-severity vulnerabilities have been remediated**. The platform is resilient against the most common web vulnerabilities identified in the OWASP Top 10, validated by both external certification tools (SecurityHeaders.com A+, SSLLabs A) and internal code review.
