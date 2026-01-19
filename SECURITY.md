# Security Guidelines

## Environment Variables

### ✅ DO

1. **Store secrets in `.env` files** - These are gitignored
2. **Use `.env.example` as templates** - With placeholder values only
3. **Keep API keys private** - Never share them publicly
4. **Rotate keys if exposed** - Generate new keys immediately if compromised
5. **Use different keys per environment** - Separate keys for dev/staging/prod

### ❌ DON'T

1. **Never commit `.env` files** - They contain real secrets
2. **Never put real keys in `.env.example`** - This file is committed to git
3. **Never hardcode secrets in code** - Always use environment variables
4. **Never share keys in chat/email** - Use secure methods
5. **Never push secrets to public repos** - Even in comments

## For Supabase Edge Functions

### Local Development

```bash
# Create supabase/functions/.env (gitignored)
KAKAO_REST_API_KEY=your-real-key
OPENAI_API_KEY=your-real-key
```

### Production Deployment

Set secrets via Supabase Dashboard or CLI:

```bash
# Set secrets for production
supabase secrets set KAKAO_REST_API_KEY=your-real-key
supabase secrets set OPENAI_API_KEY=your-real-key

# List secrets (shows names only, not values)
supabase secrets list
```

## Current Status

✅ `.env` files are properly gitignored
✅ `.env.example` uses placeholder values
✅ Your Kakao API key is stored in `supabase/functions/.env` (not committed)

## If You've Exposed a Key

1. **Rotate the key immediately** - Generate a new one from the provider
2. **Check git history** - Look for any commits with the exposed key
3. **Rewrite history if needed** - Use `git filter-branch` or BFG Repo-Cleaner
4. **Update all environments** - Replace the old key everywhere

## API Key Providers

- **Kakao API**: https://developers.kakao.com/console/app
- **OpenAI**: https://platform.openai.com/api-keys
- **Anthropic**: https://console.anthropic.com/settings/keys
- **Supabase**: Project Settings > API

---

**Remember:** Treat API keys like passwords. Once exposed, they should be considered compromised and rotated immediately.
