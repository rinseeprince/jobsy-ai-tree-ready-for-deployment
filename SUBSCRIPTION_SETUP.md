# Subscription System Setup Guide

This guide explains how to set up the complete 3-tier subscription system for Jobsy AI.

## 🚀 Quick Start

The subscription system is designed to work **without Stripe initially** - all features will work with graceful fallbacks. You can add Stripe later when you're ready to accept payments.

## 📋 Environment Variables

Create a `.env.local` file with the following variables:

```env
# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI Configuration (Required)
OPENAI_API_KEY=your_openai_api_key

# Stripe Configuration (Optional - for payment processing)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Stripe Price IDs (Optional - for payment processing)
STRIPE_PRO_MONTHLY_PRICE_ID=price_your_pro_monthly_price_id
STRIPE_PRO_QUARTERLY_PRICE_ID=price_your_pro_quarterly_price_id
STRIPE_PREMIUM_MONTHLY_PRICE_ID=price_your_premium_monthly_price_id
STRIPE_PREMIUM_QUARTERLY_PRICE_ID=price_your_premium_quarterly_price_id

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🗄️ Database Setup

1. **Run the SQL script** to create subscription tables:
   ```bash
   # Copy the contents of scripts/001_create_subscription_tables.sql
   # and run it in your Supabase SQL editor
   ```

2. **The script creates**:
   - `user_subscriptions` table for subscription management
   - `usage_records` table for feature usage tracking
   - Proper indexes and RLS policies
   - Helper functions for usage queries

## 💳 Stripe Setup (Optional)

### 1. Create Stripe Account
- Sign up at [stripe.com](https://stripe.com)
- Get your API keys from the dashboard

### 2. Create Products and Prices
Create the following products in Stripe:

**Pro Plan**
- Monthly: $19/month
- Quarterly: $45/quarter

**Premium Plan**
- Monthly: $39/month
- Quarterly: $99/quarter

### 3. Set Up Webhooks
Configure webhook endpoint: `https://yourdomain.com/api/stripe/webhooks`

Events to listen for:
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

## 🎯 Subscription Tiers

### Free Tier - "Job Seeker"
- 3 CV generations per month
- 3 cover letters per month
- 1 application wizard use per month
- GPT-3.5 AI model
- Email support

### Pro Tier - $19/month or $45/quarter
- Unlimited CV generations
- 20 CV optimizations per month
- 20 cover letters per month
- 10 application wizard uses per month
- GPT-4 AI model
- Priority support
- Application tracking dashboard

### Premium Tier - $39/month or $99/quarter
- Unlimited everything
- GPT-4 AI model
- Priority support
- Application tracking dashboard
- 1-on-1 career coaching session (monthly)
- Salary negotiation guides
- Job market insights

## 🔧 Features

### Paywall System
- **PaywallModal**: Beautiful upgrade prompts when limits are reached
- **UsageIndicator**: Shows current usage with progress bars
- **SubscriptionStatus**: Displays subscription info and management

### API Integration
- All existing APIs now include paywall checks
- Automatic usage recording
- AI model selection based on tier (GPT-3.5 vs GPT-4)

### Graceful Fallbacks
- Works without Stripe configured
- Database operations fail gracefully
- Clear error messages for missing configuration

## 🧪 Testing

### Test Without Stripe
1. Set up Supabase and OpenAI
2. The system will work with free tier only
3. Users can use features up to their limits
4. Paywall modals will show but Stripe checkout will be disabled

### Test With Stripe
1. Complete Stripe setup
2. Test checkout flow
3. Test webhook processing
4. Verify subscription creation and updates

## 📊 Usage Tracking

The system automatically tracks:
- CV generations
- CV optimizations
- Cover letter generations
- Application wizard uses

Usage resets monthly and is tied to the user's subscription tier.

## 🔒 Security

- Row Level Security (RLS) policies ensure users can only access their own data
- All API routes include authentication checks
- Stripe webhook signature verification
- Graceful error handling for all edge cases

## 🚀 Deployment

1. **Set environment variables** in your hosting platform
2. **Run database migrations** (SQL script)
3. **Configure Stripe webhooks** (if using payments)
4. **Test the complete flow**

## 📝 Notes

- The system is designed to be **non-breaking** - all existing features continue to work
- Free tier users get GPT-3.5, paid users get GPT-4
- Usage limits are enforced at the API level
- All components include loading states and error handling
- The pricing page dynamically shows plans based on billing cycle selection

## 🆘 Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify all environment variables are set correctly
3. Ensure the database tables are created
4. Check Stripe webhook configuration (if using payments) 