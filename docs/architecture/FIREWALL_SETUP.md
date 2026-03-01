# Firewall Configuration Guide (UFW)

This document outlines the security configuration for the SmartShop VPS. We use **UFW (Uncomplicated Firewall)** to "lock down" the server and only allow essential traffic.

## 🛡️ Current Configuration

The following ports are explicitly opened to allow the application to function while keeping the server secure.

| Port | Protocol | Service | Description |
| :--- | :--- | :--- | :--- |
| **22** | TCP | SSH | **Critical**: Allows remote management via terminal. |
| **80** | TCP | HTTP | Required for Traefik and SSL certificate (Let's Encrypt). |
| **443** | TCP | HTTPS | Required for secure website traffic (the lock icon). |
| **3000** | TCP | Dokploy | Access to the Dokploy Dashboard. |
| **2025** | TCP | File Browser | Secure direct access to project files/media. |

---

## 🛠️ Setup Instructions

If you ever need to reset the firewall or set up a new server, run these commands in order:

### 1. Allow Essential Services
```bash
# Allow SSH first so you don't get locked out
sudo ufw allow 22/tcp

# Allow Web Traffic
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow Dashboards/Tools
sudo ufw allow 3000/tcp
sudo ufw allow 2025/tcp
```

### 2. Enable the Firewall
```bash
sudo ufw enable
```
*Note: Type 'y' when prompted about disrupting SSH connections.*

### 3. Verify Status
```bash
sudo ufw status verbose
```

---

## 🔒 Security Best Practices

1. **Closed by Default**: All other ports (like Database `5432` or Redis `6379`) are **blocked** from the public internet. They only communicate internally within the Docker network.
2. **IP Access Only**: Port `2025` is only accessible via the VPS IP. It does not have a public DNS subdomain to hide it from OSINT tools like Spiderfoot.
3. **Regular Audits**: Run `sudo netstat -tulpn` occasionally to ensure no new unauthorized applications are "listening" on public interfaces.
