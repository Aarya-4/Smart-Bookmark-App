'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { createClient } from '../lib/supabase/client'
import { useEffect } from 'react'

export default function LoginPage() {
  const supabase = createClient()
  const router = useRouter()

  // Auto-redirect if user is already logged in
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace('/dashboard')
    })
  }, [])

  const loginWithGoogle = async () => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`, // Must match Supabase & Google Cloud
        },
      })
    } catch (error: any) {
      console.error('Google login error:', error.message)
      alert('Login failed. Please try again.')
    }
  }

  return (
    <div className="relative h-screen w-screen">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/logo/vivid-colours-plants-natural-environment.jpg"
          alt="Background"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Centered login card */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="bg-white shadow-2xl rounded-3xl p-10 w-96 text-center relative overflow-hidden"
        >
          {/* Top accent */}
          <motion.div
            className="absolute top-0 left-0 h-2 bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-t-3xl"
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
          />

          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold mb-4 text-gray-800"
          >
            Welcome Back
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-gray-500 mb-8"
          >
            Sign in to access your dashboard
          </motion.p>

          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0px 8px 20px rgba(0,0,0,0.12)' }}
            whileTap={{ scale: 0.95 }}
            onClick={loginWithGoogle}
            className="flex items-center justify-center w-full bg-white border border-gray-300 px-5 py-3 rounded-xl text-gray-700 font-medium transition-all"
          >
            <Image
              src="/logo/Logo-google-icon-PNG.avif"
              alt="Google Logo"
              width={24}
              height={24}
              className="mr-3"
            />
            Continue with Google
          </motion.button>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-gray-400 mt-6 text-sm"
          >
            By continuing, you agree to our{' '}
            <span className="underline cursor-pointer">Terms of Service</span> and{' '}
            <span className="underline cursor-pointer">Privacy Policy</span>.
          </motion.p>
        </motion.div>
      </div>
    </div>
  )
}