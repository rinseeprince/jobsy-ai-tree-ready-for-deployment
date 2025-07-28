import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    )
    
    // Try to sign in with a dummy password to check if user exists
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: "dummy_password_that_will_fail",
    })

    // Since Supabase doesn't distinguish between "user doesn't exist" and "wrong password",
    // we'll use a simple approach: maintain a list of known users
    // In a real production app, you'd want to use a different approach
    
    const knownUsers = [
      's.kalepa91@gmail.com',
      'samuel.k@taboola.com'
      // Add other known users here
    ]
    
    const userExists = knownUsers.includes(email.toLowerCase())

    return NextResponse.json({
      exists: userExists,
      error: error?.message,
      debug: {
        message: error?.message,
        status: error?.status,
        name: error?.name,
        checkedEmail: email
      }
    })

  } catch (error) {
    console.error('Error checking user existence:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 