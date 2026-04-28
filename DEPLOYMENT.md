# AttenX Deployment Guide

## Architecture Overview
```
Frontend (Vercel) → Backend (Render) → Database (Railway)
```

## 1. Database Setup (Railway)

### Step 1: Create Railway Project
1. Go to [https://railway.app/](https://railway.app/)
2. Login with GitHub
3. Click **New Project → Provision MySQL**
4. Save the connection details:
   ```
   MYSQLHOST=containers-us-west-xxx.railway.app
   MYSQLPORT=6543
   MYSQLDATABASE=railway
   MYSQLUSER=root
   MYSQLPASSWORD=xxxxxxxx
   ```

### Step 2: Import Database Schema
```bash
# Connect to your Railway MySQL instance and run:
mysql -h MYSQLHOST -P MYSQLPORT -u MYSQLUSER -p MYSQLDATABASE < sql/attenx_schema.sql
```

## 2. Backend Deployment (Render)

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "AttenX backend ready for deployment"
git branch -M main
git remote add origin https://github.com/yourusername/attenx-backend.git
git push -u origin main
```

### Step 2: Deploy on Render
1. Go to [https://render.com/](https://render.com/)
2. Login with GitHub
3. Click **New + → Web Service**
4. Connect your GitHub repo
5. Use these settings:
   - **Environment**: Java
   - **Build Command**: `./mvnw clean package -DskipTests`
   - **Start Command**: `java -jar target/attenx-backend-1.0.0.jar`
   - **Instance Type**: Free

### Step 3: Add Environment Variables
In Render dashboard, add these environment variables:
```
MYSQLHOST=your-railway-host
MYSQLPORT=your-railway-port
MYSQLDATABASE=railway
MYSQLUSER=root
MYSQLPASSWORD=your-railway-password
PORT=8080
SPRING_PROFILES_ACTIVE=prod
```

### Step 4: Test Backend
After deployment, test: `https://your-app.onrender.com/api/auth/login`

## 3. Frontend Deployment (Vercel)

### Step 1: Configure API URL
In your frontend project, set the production API URL:
```env
VITE_API_URL=https://your-app.onrender.com
```

### Step 2: Deploy to Vercel
1. Push frontend to GitHub
2. Go to [https://vercel.com/](https://vercel.com/)
3. Click **Add New → Project**
4. Import GitHub repo
5. Framework: Vite/React/Next.js
6. Add environment variable: `VITE_API_URL=https://your-app.onrender.com`

## 4. Update CORS Configuration
After getting your Vercel URL, update `CorsConfig.java`:
```java
config.setAllowedOrigins(Arrays.asList(
    "http://localhost:3000",
    "http://localhost:5173",
    "https://your-vercel-app.vercel.app"
));
```

## 5. Final Testing
1. Frontend: `https://your-app.vercel.app`
2. Backend: `https://your-backend.onrender.com`
3. Test login, attendance marking, and all features

## Troubleshooting

### Common Issues:
- **CORS errors**: Update allowed origins in CorsConfig.java
- **Database connection**: Verify Railway credentials in Render env vars
- **Build failures**: Check Maven dependencies and Java version
- **Port issues**: Ensure PORT=8080 in Render environment

### Environment Variables Reference:
```
# Railway (Database)
MYSQLHOST=containers-us-west-xxx.railway.app
MYSQLPORT=6543
MYSQLDATABASE=railway
MYSQLUSER=root
MYSQLPASSWORD=xxxx

# Render (Backend)
PORT=8080
SPRING_PROFILES_ACTIVE=prod

# Vercel (Frontend)
VITE_API_URL=https://your-backend.onrender.com
```

## Success Metrics
✅ Frontend loads on Vercel
✅ Backend API responds on Render  
✅ Database connects to Railway
✅ Login functionality works
✅ Attendance marking works
✅ All CRUD operations functional
