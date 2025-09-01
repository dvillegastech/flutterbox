# Vercel Deployment Guide

This guide will help you deploy FlutterForge to Vercel.

## Prerequisites

1. A Vercel account (https://vercel.com/signup)
2. A Supabase project with the database configured
3. Git repository connected to GitHub

## Deployment Steps

### 1. Import Project to Vercel

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Select the `vercel` branch for deployment

### 2. Configure Environment Variables

In the Vercel dashboard, add the following environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_SITE_URL=https://your-project.vercel.app
```

### 3. Build Settings

The following settings are already configured in `vercel.json`:

- **Framework Preset**: Next.js
- **Build Command**: `pnpm build`
- **Output Directory**: `.next`
- **Install Command**: `pnpm install`

### 4. Deploy

Click "Deploy" and Vercel will:
1. Install dependencies
2. Build the project
3. Deploy to production

## Post-Deployment

### Update Supabase Settings

1. Go to your Supabase project settings
2. Add your Vercel domain to the allowed URLs:
   - Site URL: `https://your-project.vercel.app`
   - Redirect URLs: `https://your-project.vercel.app/api/auth/callback`

**Important**: The callback URL uses `/api/auth/callback` (not `/auth/callback`) because Vercel uses the API route for authentication callbacks.

### Configure Custom Domain (Optional)

1. In Vercel dashboard, go to Settings > Domains
2. Add your custom domain
3. Update DNS settings as instructed
4. Update environment variable: `NEXT_PUBLIC_SITE_URL`

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key (public) | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (secret) | Yes |
| `NEXT_PUBLIC_SITE_URL` | Your production URL | Yes |

## Performance Optimizations

The project includes several optimizations for Vercel:

1. **Edge Runtime**: API routes use Edge Runtime where possible
2. **Image Optimization**: Next.js Image component with AVIF/WebP
3. **Code Splitting**: Monaco Editor is lazy-loaded
4. **SWC Minification**: Faster builds with SWC
5. **Security Headers**: Configured in `vercel.json`

## Troubleshooting

### Build Fails

1. Check all environment variables are set correctly
2. Ensure `pnpm-lock.yaml` is committed
3. Check build logs for specific errors

### Authentication Issues

1. Verify Supabase redirect URLs include your Vercel domain
2. Check CORS settings in Supabase
3. Ensure environment variables are correct

### Database Connection

1. Verify Supabase project is active
2. Check RLS policies are properly configured
3. Run SQL migrations from `sql/` directory

## Monitoring

### Analytics

Vercel provides built-in analytics:
1. Go to your project dashboard
2. Click on "Analytics" tab
3. Enable Web Analytics

### Logs

View real-time logs:
1. Go to Functions tab in Vercel dashboard
2. Select a function to view logs
3. Use filters to find specific errors

## Deployment Environments

### Production
- Branch: `vercel`
- URL: `https://your-project.vercel.app`

### Preview
- All other branches create preview deployments
- URLs: `https://your-project-git-branch-name.vercel.app`

## CI/CD Pipeline

Every push to the `vercel` branch triggers:
1. Automatic deployment
2. Build verification
3. Preview generation

## Support

For deployment issues:
- Vercel Documentation: https://vercel.com/docs
- Supabase Documentation: https://supabase.com/docs
- Project Issues: https://github.com/dvillegastech/flutterforge/issues