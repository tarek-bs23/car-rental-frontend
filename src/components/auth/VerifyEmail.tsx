import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../ui/button'
import { Input } from '../ui/input'

const OTP_LENGTH = 6
const INITIAL_COUNTDOWN = 60

export function VerifyEmail() {
  const navigate = useNavigate()
  const [otp, setOtp] = useState<string[]>(() => Array(OTP_LENGTH).fill(''))
  const [countdown, setCountdown] = useState(INITIAL_COUNTDOWN)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (countdown <= 0) return
    
    const timer = setTimeout(() => {
      setCountdown(curr => curr - 1)
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [countdown])

  const handleChange = useCallback((index: number, value: string) => {
    if (value.length > 1 || !/^\d*$/.test(value)) return
    
    setOtp(curr => {
      const newOtp = [...curr]
      newOtp[index] = value
      return newOtp
    })

    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }, [])

  const handleKeyDown = useCallback((index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }, [otp])

  const handleVerify = useCallback(() => {
    navigate('/welcome')
  }, [navigate])

  const handleResend = useCallback(() => {
    setCountdown(INITIAL_COUNTDOWN)
  }, [])

  const isOtpComplete = otp.every(digit => digit)

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-gray-900">Verify Your Email</h1>
            <p className="text-gray-600">
              We've sent a 6-digit code to your email
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex gap-2 justify-center">
              {otp.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center"
                />
              ))}
            </div>

            <Button 
              onClick={handleVerify}
              className="w-full h-12"
              disabled={!isOtpComplete}
            >
              Verify
            </Button>

            <div className="text-center">
              {countdown > 0 ? (
                <p className="text-gray-500 text-sm">
                  Resend code in {countdown}s
                </p>
              ) : (
                <button
                  onClick={handleResend}
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  Resend Code
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
