# Professional Email DNS Guide (EwallHost)

**Goal**: Host your website (`smartshop1.us`) on the VPS while using **EwallHost** for professional email (`support@smartshop1.us`).

---

## � DNS Configuration Logic

Since the website and email are on different servers, follow these rules in your **cPanel Zone Editor**:

### 1. The Website (VPS)
Keep these pointed to your VPS IP (`157.90.149.223`):
*   **A Record** (`smartshop1.us`) -> `157.90.149.223`
*   **CNAME** (`www`) -> `smartshop1.us`
*   **A Records** (`api`, `db`, `minio`, `s3`) -> `157.90.149.223`

### 2. The Email (EwallHost)
Add these records to route mail to EwallHost's professional servers:

#### **MX Records (For Receiving Email)**
| Priority | Destination |
| :--- | :--- |
| 10 | `us2.mx1.mailhostbox.com` |
| 20 | `us2.mx2.mailhostbox.com` |
| 30 | `us2.mx3.mailhostbox.com` |

#### **SPF Record (For Deliverability)**
*   **Type**: TXT
*   **Name**: `smartshop1.us`
*   **Value**: `"v=spf1 redirect=_spf.mailhostbox.com"`

#### **SMTP Endpoint (For the Website to Send Mail)**
*   **Type**: CNAME
*   **Name**: `smtp`
*   **Value**: `us2.smtp.mailhostbox.com`

---

## 📧 Application Settings (Dokploy)

Configure these in your backend environment variables to connect the shop:

*   **EMAIL_HOST**: `us2.smtp.mailhostbox.com`
*   **EMAIL_PORT**: `587`
*   **EMAIL_USE_TLS**: `True`
*   **EMAIL_HOST_USER**: `support@smartshop1.us`
*   **DEFAULT_FROM_EMAIL**: `support@smartshop1.us`
