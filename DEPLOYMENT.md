# 🚀 Deployment Guide - Feedback System

This guide covers multiple deployment options for your complete feedback system.

## 📋 Prerequisites

- Git repository with your code
- MongoDB Atlas account (for database)
- Deployment platform accounts (Vercel, Railway, etc.)

## 🎯 Deployment Options

### **Option 1: Cloud Deployment (Recommended - Free)**

#### **Step 1: Database Setup (MongoDB Atlas)**

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Sign up for free account
   - Create a new cluster (M0 Free tier)

2. **Get Connection String**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database password

#### **Step 2: Backend Deployment (Railway/Render)**

**Railway (Recommended):**
1. Go to [Railway](https://railway.app/)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Set environment variables:
   ```
   MONGODB_URI=your_mongodb_atlas_connection_string
   SECRET_KEY=your_super_secret_key_here
   ```
6. Deploy

**Render:**
1. Go to [Render](https://render.com/)
2. Sign up and connect GitHub
3. Create "Web Service"
4. Select your repository
5. Set build command: `pip install -r requirements.txt`
6. Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
7. Add environment variables (same as Railway)
8. Deploy

#### **Step 3: Frontend Deployment (Vercel)**

1. **Update API URL**
   ```bash
   # Create .env.local file
   VITE_API_URL=https://your-backend-url.railway.app
   ```

2. **Deploy to Vercel**
   - Go to [Vercel](https://vercel.com/)
   - Sign up with GitHub
   - Import your repository
   - Set environment variable: `VITE_API_URL`
   - Deploy

### **Option 2: Docker Deployment**

#### **Local Docker Deployment**

```bash
# Build and run with Docker Compose
docker-compose -f docker-compose.prod.yml up -d

# Access your application
# Frontend: http://localhost
# Backend: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

#### **Cloud Docker Deployment (DigitalOcean, AWS, etc.)**

1. **Set up server**
2. **Install Docker and Docker Compose**
3. **Clone repository**
4. **Set environment variables**
5. **Run deployment**

```bash
# On your server
git clone your-repo-url
cd feedback_system
docker-compose -f docker-compose.prod.yml up -d
```

### **Option 3: Manual Server Deployment**

#### **Backend (Ubuntu/CentOS)**

```bash
# Install Python and dependencies
sudo apt update
sudo apt install python3 python3-pip python3-venv nginx

# Clone repository
git clone your-repo-url
cd feedback_system/backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp env.example .env
# Edit .env with your MongoDB URI and secret key

# Run with systemd
sudo nano /etc/systemd/system/feedback-backend.service
```

**Systemd service file:**
```ini
[Unit]
Description=Feedback System Backend
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/path/to/feedback_system/backend
Environment=PATH=/path/to/feedback_system/backend/venv/bin
ExecStart=/path/to/feedback_system/backend/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start service
sudo systemctl enable feedback-backend
sudo systemctl start feedback-backend
```

#### **Frontend (Nginx)**

```bash
# Build frontend
npm run build

# Copy to nginx
sudo cp -r dist/* /var/www/html/

# Configure nginx
sudo nano /etc/nginx/sites-available/feedback-system
```

**Nginx configuration:**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/html;
    index index.html;

    location /api/ {
        proxy_pass http://localhost:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/feedback-system /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 🔧 Environment Variables

### **Backend (.env)**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/feedback_system
SECRET_KEY=your-super-secret-key-change-this-in-production
```

### **Frontend (.env.local)**
```env
VITE_API_URL=https://your-backend-url.com
```

## 🌐 Domain & SSL Setup

### **Custom Domain**
1. Point your domain to your server IP
2. Update nginx configuration with your domain
3. Restart nginx

### **SSL Certificate (Let's Encrypt)**
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 📊 Monitoring & Maintenance

### **Logs**
```bash
# Backend logs
sudo journalctl -u feedback-backend -f

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### **Database Backup**
```bash
# MongoDB backup
mongodump --uri="your_mongodb_connection_string" --out=/backup/$(date +%Y%m%d)
```

### **Updates**
```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build
```

## 🔒 Security Checklist

- [ ] Change default MongoDB password
- [ ] Use strong SECRET_KEY
- [ ] Enable HTTPS/SSL
- [ ] Set up firewall rules
- [ ] Regular security updates
- [ ] Database backups
- [ ] Monitor logs for suspicious activity

## 🆘 Troubleshooting

### **Common Issues**

1. **CORS Errors**
   - Update backend CORS settings
   - Check frontend API URL

2. **Database Connection**
   - Verify MongoDB URI
   - Check network connectivity
   - Ensure IP whitelist in MongoDB Atlas

3. **Build Failures**
   - Check Node.js version
   - Clear npm cache: `npm cache clean --force`
   - Delete node_modules and reinstall

4. **Port Conflicts**
   - Check if ports are already in use
   - Update port configurations

## 📞 Support

For deployment issues:
1. Check logs for error messages
2. Verify environment variables
3. Test API endpoints manually
4. Check network connectivity

---

**Happy Deploying! 🚀** 