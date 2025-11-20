# 🚀 Deploy to Vercel in 30 Seconds

## Quick Deploy

### Option 1: One-Click Deploy Button

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/LakshmiSravya123/TripPlanner)

1. Click the button above
2. Sign in with GitHub
3. Import the `TripPlanner` repository
4. Add environment variable:
   - Name: `OPENAI_API_KEY`
   - Value: Your OpenAI API key (starts with `sk-`)
5. Click "Deploy"
6. Wait ~2 minutes
7. Your app is live! 🎉

### Option 2: Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Import from GitHub: `LakshmiSravya123/TripPlanner`
4. Add Environment Variable:
   - Key: `OPENAI_API_KEY`
   - Value: Your OpenAI API key
5. Click "Deploy"

### Option 3: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd ai-trip-planner
vercel

# Add environment variable
vercel env add OPENAI_API_KEY
# Enter your API key when prompted
```

## Environment Variables

**Required:**
- `OPENAI_API_KEY` - Your OpenAI API key

Get one at: https://platform.openai.com/api-keys

## Post-Deploy

1. Your app will be live at `your-project.vercel.app`
2. Test the trip planner
3. Share with friends! 🎉

## Troubleshooting

**Build fails?**
- Check that `OPENAI_API_KEY` is set in Vercel dashboard
- Verify your API key has credits
- Check build logs in Vercel dashboard

**3D Globe not showing?**
- Check browser console for WebGL errors
- Try Chrome or Firefox (best WebGL support)

**Animations lagging?**
- Normal on first load (assets loading)
- Should be smooth after initial load

---

**That's it! Your magical trip planner is live! ✨**

