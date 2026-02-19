# cPanel DNS Migration Guide

**Goal**: Move your website (`smartshop.net`) to the new VPS while keeping your email on the old cPanel server (`51.83.161.4`).

---

## 🛑 STEP 1: DO THIS NOW (Before Buying VPS)
*Log in to your cPanel -> **Zone Editor** -> **Manage**.*

### 1. Fix the "Mail" Record
Currently, your mail record is a "CNAME" that follows your main domain. If you move the main domain to the VPS, email will break. You must "pin" it to the old server.

1.  Find the record named: `mail.smartshop.net`
    *   Type: **CNAME**
    *   Value: `smartshop.net`
2.  **DELETE** this record.
3.  **CREATE A NEW RECORD**:
    *   **Name**: `mail.smartshop.net`
    *   **Type**: **A** (Address)
    *   **Value/IP**: `51.83.161.4` (Address of your current cPanel)
    *   **TTL**: `14400`

### 2. Check the MX Record
1.  Find the record of Type: **MX**
2.  Ensure it points to: `mail.smartshop.net`
3.  Priority: `0`

**Result**: Your email is now safe. It is permanently pointed to `51.83.161.4`, regardless of where the website goes.

---

## 🚀 STEP 2: DO THIS AFTER BUYING VPS
*Once HostAsia gives you your **New VPS IP Address** (let's call it `NEW_VPS_IP`).*

### 1. Point the Website to VPS
1.  Find the record named: `smartshop.net` (The root domain)
    *   Type: **A**
2.  **EDIT** this record:
    *   **Old Value**: `51.83.161.4`
    *   **New Value**: `157.90.149.223` (e.g. 123.45.67.89)

### 2. Point "www" to VPS
1.  Find the record named: `www.smartshop.net`
    *   Type: **CNAME**
2.  Ensure it points to `smartshop.net`. (This usually updates automatically, but check it).

---

## Summary of Final Records

| Name | Type | Value / IP | Purpose |
| :--- | :--- | :--- | :--- |
| `mail.smartshop.net` | **A** | `51.83.161.4` | **Email** stays on cPanel |
| `smartshop.net` | **A** | `157.90.149.223` | **Website** goes to VPS |
| `www.smartshop.net` | **CNAME** | `smartshop.net` | **Website** goes to VPS |
| `MX Record` | **MX** | `mail.smartshop.net` | Routes email to the mail server |
