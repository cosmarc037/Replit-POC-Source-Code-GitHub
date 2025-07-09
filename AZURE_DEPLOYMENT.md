# Azure Web App Deployment Guide

## Prerequisites

✅ **The application is ready for Azure deployment** with the following setup complete:
- Express.js backend with production build configuration
- React frontend with optimized Vite build
- Azure OpenAI integration configured
- Yahoo Finance API integration (no credentials needed)
- Health monitoring endpoints for Azure health checks

## Deployment Steps

### 1. Code Repository
- Push all files to GitHub repository
- Ensure `.gitignore` excludes `node_modules/`, `dist/`, and `.env` files

### 2. Azure Web App Configuration
**Runtime Settings:**
- **Runtime Stack:** Node.js 20 LTS
- **Operating System:** Linux (recommended)
- **Startup Command:** `npm run start`

**Environment Variables (Application Settings):**
```
OPENAI_API_KEY=your_azure_openai_key
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4o-mini
NODE_ENV=production
PORT=8080
```

### 3. Build Configuration
The application includes production build scripts:
```json
{
  "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
  "start": "NODE_ENV=production node dist/index.js"
}
```

### 4. Azure Deployment Options

**Option A: GitHub Actions (Recommended)**
- Azure will auto-generate a GitHub Actions workflow
- Automatic builds and deployments on code changes
- Zero-downtime deployments

**Option B: Local Git Deployment**
- Configure Azure deployment credentials
- Add Azure remote: `git remote add azure <deployment_url>`
- Deploy: `git push azure main`

**Option C: ZIP Deploy**
- Build locally: `npm run build`
- Create ZIP of project files
- Upload via Azure Portal or Azure CLI

## Key Considerations

### ✅ Already Configured
- **Port Binding:** Application uses `process.env.PORT || 5000` (Azure auto-assigns port)
- **Health Endpoints:** `/api/health` endpoint for Azure health checks
- **Static Files:** Express serves built React files in production
- **CORS:** Configured for production domains
- **Error Handling:** Comprehensive error handling and logging

### ⚠️ Environment Variables Required
Set these in Azure Portal > Configuration > Application Settings:
1. **OPENAI_API_KEY** - Your Azure OpenAI API key
2. **AZURE_OPENAI_ENDPOINT** - Your Azure OpenAI endpoint URL
3. **AZURE_OPENAI_DEPLOYMENT_NAME** - Your model deployment name

### 🔧 Optional Enhancements

**Database Integration (Future):**
- Current: In-memory storage (resets on restart)
- Upgrade: Add PostgreSQL connection string for persistent storage
- Already configured with Drizzle ORM schemas

**Custom Domain:**
- Configure custom domain in Azure Portal
- Update CORS settings for production domain

**Scaling:**
- Application is stateless and scales horizontally
- Consider Azure App Service Plan scaling rules

## Monitoring & Debugging

**Health Check:**
- Endpoint: `https://your-app.azurewebsites.net/api/health`
- Returns: System status and dependency health

**Logs:**
- Azure Portal > Log Stream for real-time logs
- Application Insights for detailed monitoring

**Common Issues:**
1. **Environment Variables:** Ensure all Azure OpenAI variables are set
2. **Build Errors:** Check Node.js version compatibility
3. **Memory:** Consider upgrading App Service Plan for better performance

## Security Considerations

- API keys stored as Azure environment variables (encrypted)
- No secrets in code repository
- HTTPS enforced by Azure by default
- Regular dependency updates recommended

## Performance Notes

- Yahoo Finance API calls may take 5-10 seconds
- Azure OpenAI analysis typically takes 15-30 seconds
- Consider implementing response caching for production
- File uploads limited to Azure App Service limits

---

**Ready for Production:** The application will work immediately after deployment with proper environment variables configured.