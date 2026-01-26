import { useState, useCallback, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { toast } from 'sonner'
import { apiJson } from '../../lib/api'
import { endpoints } from '../../lib/endpoints'
import ChevronLeft from 'lucide-react/dist/esm/icons/chevron-left'

export function ResetPassword() {
  const navigate = useNavigate()
  const location = useLocation()
  const resetToken = (location.state as { resetToken?: string })?.resetToken || ''

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!resetToken) {
      toast.error('Invalid reset token. Please start again.')
      navigate('/forgot-password')
    }
  }, [resetToken, navigate])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoading || !newPassword || !confirmPassword) return

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    setIsLoading(true)

    try {
      await apiJson({
        path: endpoints.auth.resetPassword,
        method: 'POST',
        body: { resetToken, newPassword },
        skipAuth: true,
      })

      toast.success('Password reset successfully. Please log in.')
      navigate('/login')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to reset password'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }, [newPassword, confirmPassword, resetToken, isLoading, navigate])

  if (!resetToken) return null

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="flex items-center h-14 px-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <span className="ml-2">Reset Password</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col px-6 py-8">
        <div className="w-full max-w-md mx-auto space-y-8">
          <div className="space-y-2">
            <h1 className="text-gray-900">Create New Password</h1>
            <p className="text-gray-600">
              Enter your new password below. Make sure it's at least 8 characters.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <p className="text-xs text-gray-500">Must be at least 8 characters</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full h-12" disabled={isLoading}>
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
