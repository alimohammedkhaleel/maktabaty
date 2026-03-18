# Database Deployment Guide for Vercel + Railway/PlanetScale

## 🎯 Current Setup
- DB: MySQL (`mysql2/promise`)
- Connection: `server/config/db.js` uses `MYSQL_URL` env var (mysql://...)
- Ready for cloud DBs!

## 🚀 Railway Deployment (Recommended for MySQL)

### 1. Create Railway Account
```
https://railway.app
```

### 2. New Project → Deploy from GitHub
- Connect your repo
- Railway auto-detects Node.js

### 3. Add MySQL Database
```
New → Database → MySQL
```
- Get `MYSQL_URL` from Variables tab

### 4. Railway Env Vars
```
MYSQL_URL=mysql://user:pass@host:port/db
PORT=3001
NODE_ENV=production
```

### 5. Run Init Scripts (Railway Shell)
```
railway shell
npm run init-db
node scripts/createAdmin.js
node scripts/createQuizTables.js
```

## ☁️ Vercel + Railway DB

### Vercel Env Vars
```
MYSQL_URL=your-railway-mysql-url
NODE_ENV=production
```

### vercel.json (already good)
```
{
  "functions": {
    "api/**/*.js": {
      "runtime": "nodejs18.x"
    }
  }
}
```

## 🛠 Railway URL Parser (if needed)
```
node -e "
const url = new URL(process.env.MYSQL_URL);
console.log('HOST:', url.hostname);
console.log('PORT:', url.port);
console.log('USER:', url.username);
console.log('PASS:', decodeURIComponent(url.password));
console.log('DB:', url.pathname.slice(1));
"
```

## ✅ Test Connection
```
# Local test
cp .env.example .env
# Add MYSQL_URL
npm start
```

## 🚨 Common Issues
1. **Connection Limit**: Railway free tier = 10 connections
2. **SSL**: Railway MySQL supports SSL (auto in URL)
3. **Idle Timeout**: Use pool with `acquireTimeout: 60000`

## 🌟 Production Ready Commands
```
# Railway
railway up
railway env:set MYSQL_URL $MYSQL_URL

# Vercel
vercel env add MYSQL_URL production
vercel --prod
```

## 📋 Schema Migration
Create `server/migrations/` folder + run on deploy:
```
railway shell 'npm run migrate'
```

**✅ DB ready for Vercel/Railway! Copy MYSQL_URL from Railway → paste in Vercel dashboard.**

