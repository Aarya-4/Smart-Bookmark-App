'use client'

import { createClient } from '../lib/supabase/client'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useState } from 'react'

export default function LogoutButton() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <motion.button
      onClick={handleLogout}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      disabled={loading}
      className="relative px-5 py-2.5 rounded-xl font-medium text-sm 
                 bg-linear-to-r from-gray-900 to-gray-700 
                 text-white shadow-md hover:shadow-lg
                 transition-all duration-300 disabled:opacity-70"
    >
      {/* Glow Effect */}
      <span className="absolute inset-0 rounded-xl bg-red-500/20 blur-xl opacity-0 hover:opacity-100 transition duration-300"></span>

      {/* Content */}
      <span className="relative flex items-center gap-2">
        {loading ? (
          <>
            <motion.span
              className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            />
            Signing out...
          </>
        ) : (
          <>
            <motion.span
              initial={{ x: 0 }}
              whileHover={{ x: 3 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              Logout
            </motion.span>
          </>
        )}
      </span>
    </motion.button>
  )
}