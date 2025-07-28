# Email Confirmation Test Plan

## Test Scenarios

### 1. New User Sign Up Flow
**Steps:**
1. Go to homepage
2. Click "Sign Up" 
3. Enter new email, password, and name
4. Submit form

**Expected Results:**
- User sees "Please check your email for a confirmation link!"
- User receives confirmation email
- User cannot access `/dashboard` (redirected to `/email-confirmation`)
- User cannot access any protected routes

### 2. Email Confirmation Page
**Steps:**
1. After signup, try to access `/dashboard`
2. Should be redirected to `/email-confirmation`

**Expected Results:**
- Page shows user's email address
- "I've Confirmed My Email" button is available
- "Resend Confirmation Email" button is available
- "Sign Out" button is available

### 3. Email Confirmation Process
**Steps:**
1. Click confirmation link in email
2. Return to application
3. Click "I've Confirmed My Email" button

**Expected Results:**
- User is redirected to `/dashboard`
- User can access all protected routes
- User can use all features

### 4. Existing Confirmed User Sign In
**Steps:**
1. Go to homepage
2. Click "Sign In"
3. Enter confirmed user's email and password

**Expected Results:**
- User is signed in successfully
- User is redirected to `/dashboard`
- User can access all features

### 5. Existing Confirmed User Sign Up Attempt
**Steps:**
1. Go to homepage
2. Click "Sign Up"
3. Enter email of existing confirmed user
4. Enter any password and name

**Expected Results:**
- User sees "An account with this email already exists. Please sign in instead."
- User is not signed up

### 6. Unconfirmed User Sign In Attempt
**Steps:**
1. Go to homepage
2. Click "Sign In"
3. Enter email of unconfirmed user
4. Enter any password

**Expected Results:**
- User sees "No account found with this email. Please sign up first."
- User is not signed in

### 7. Unconfirmed User Sign Up Again
**Steps:**
1. Go to homepage
2. Click "Sign Up"
3. Enter email of unconfirmed user
4. Enter any password and name

**Expected Results:**
- User sees "Please check your email for a confirmation link!"
- New confirmation email is sent
- User cannot access protected routes

### 8. Wrong Password for Confirmed User
**Steps:**
1. Go to homepage
2. Click "Sign In"
3. Enter confirmed user's email
4. Enter wrong password

**Expected Results:**
- User sees "Incorrect password. Please try again."
- User is not signed in

### 9. Resend Confirmation Email
**Steps:**
1. On email confirmation page
2. Click "Resend Confirmation Email"

**Expected Results:**
- Success message appears
- New confirmation email is sent
- Button shows loading state during process

### 10. Sign Out from Confirmation Page
**Steps:**
1. On email confirmation page
2. Click "Sign Out"

**Expected Results:**
- User is signed out
- User is redirected to homepage

## Manual Testing Checklist

- [ ] New user signup works correctly
- [ ] Confirmation emails are sent
- [ ] Unconfirmed users cannot access dashboard
- [ ] Confirmed users can access dashboard
- [ ] Error messages are correct
- [ ] Resend functionality works
- [ ] Sign out works
- [ ] Middleware redirects correctly
- [ ] RLS policies block unconfirmed users
- [ ] All protected routes are protected

## Browser Testing

Test in:
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

## Mobile Testing

Test on:
- [ ] iOS Safari
- [ ] Android Chrome
- [ ] Mobile responsive design

## Edge Cases

- [ ] Network errors during signup
- [ ] Network errors during signin
- [ ] Expired confirmation links
- [ ] Multiple signup attempts
- [ ] Browser back/forward navigation
- [ ] Page refresh during confirmation process 