// To use these toast styles
// import { notify, GlobalToaster } from '@/components/ui/toast-config'
import toast, { Toaster, ToastOptions } from 'react-hot-toast'
import { CheckCircle, XCircle, Info, AlertTriangle } from 'lucide-react'
import { useState, useEffect } from 'react'

// Default styling options
export const toastOptions: ToastOptions = {
  duration: 4000,
  style: {
    background: 'var(--card)',
    color: 'var(--card-foreground)',
    border: '1px solid var(--border)',
    padding: '16px',
    borderRadius: '8px',
    fontSize: '14px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    maxWidth: '400px',
  },
}

// Global toast utility functions to ensure consistent usage
export const notify = {
  success: (message: string) =>
    toast.custom((t) => (
      <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } flex max-w-md bg-white shadow-lg rounded-lg pointer-events-auto`}
      >
        <div className="flex-shrink-0 bg-green-500 w-1 rounded-l-lg" />
        <div className="flex items-start p-4 w-full">
          <div className="flex-shrink-0 pt-0.5">
            <CheckCircle className="h-5 w-5 text-green-500" />
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900">Success</p>
            <p className="mt-1 text-base text-background">{message}</p>
          </div>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-500"
          >
            <XCircle className="h-5 w-5" />
          </button>
        </div>
      </div>
    )),

  error: (message: string) =>
    toast.custom((t) => (
      <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } flex max-w-md bg-white shadow-lg rounded-lg pointer-events-auto`}
      >
        <div className="flex-shrink-0 bg-red-500 w-1 rounded-l-lg" />
        <div className="flex items-start p-4 w-full">
          <div className="flex-shrink-0 pt-0.5">
            <XCircle className="h-5 w-5 text-red-500" />
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900">Error</p>
            <p className="mt-1 text-base text-foreground">{message}</p>
          </div>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-500"
          >
            <XCircle className="h-5 w-5" />
          </button>
        </div>
      </div>
    )),

  info: (message: string) =>
    toast.custom((t) => (
      <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } flex max-w-md bg-white shadow-lg rounded-lg pointer-events-auto`}
      >
        <div className="flex-shrink-0 bg-blue-500 w-1 rounded-l-lg" />
        <div className="flex items-start p-4 w-full">
          <div className="flex-shrink-0 pt-0.5">
            <Info className="h-5 w-5 text-blue-500" />
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900">Info</p>
            <p className="mt-1 text-base text-foreground">{message}</p>
          </div>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-500"
          >
            <XCircle className="h-5 w-5" />
          </button>
        </div>
      </div>
    )),

  warning: (message: string) =>
    toast.custom((t) => (
      <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } flex max-w-md bg-white shadow-lg rounded-lg pointer-events-auto`}
      >
        <div className="flex-shrink-0 bg-amber-500 w-1 rounded-l-lg" />
        <div className="flex items-start p-4 w-full">
          <div className="flex-shrink-0 pt-0.5">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900">Warning</p>
            <p className="mt-1 text-base text-foreground">{message}</p>
          </div>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-500"
          >
            <XCircle className="h-5 w-5" />
          </button>
        </div>
      </div>
    )),

  loading: (message: string) =>
    toast.custom((t) => (
      <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } flex max-w-md bg-white shadow-lg rounded-lg pointer-events-auto`}
      >
        <div className="flex-shrink-0 bg-blue-500 w-1 rounded-l-lg" />
        <div className="flex items-start p-4 w-full">
          <div className="flex-shrink-0 pt-0.5">
            <div className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900">Loading</p>
            <p className="mt-1 text-base text-foreground">{message}</p>
          </div>
        </div>
      </div>
    )),

  promise: toast.promise,
  dismiss: toast.dismiss,
}

// Global Toaster component with responsive positioning
export const GlobalToaster = () => {
  const [position, setPosition] = useState<
    'top-center' | 'top-right' | 'bottom-center'
  >('top-center')

  useEffect(() => {
    // Function to update position based on screen width
    const updatePosition = () => {
      if (window.innerWidth >= 768) {
        // md breakpoint in Tailwind
        setPosition('top-right')
      } else {
        setPosition('bottom-center') // Better for mobile UX
      }
    }

    // Set initial position
    updatePosition()

    // Add event listener for window resize
    window.addEventListener('resize', updatePosition)

    // Cleanup
    return () => window.removeEventListener('resize', updatePosition)
  }, [])

  return (
    <Toaster
      position={position}
      toastOptions={{
        ...toastOptions,
        // Add specific mobile styling for small screens
        ...(position === 'bottom-center' && {
          style: {
            ...toastOptions.style,
            maxWidth: '94%', // Slightly narrower on mobile
            width: '330px',
            bottom: '20px', // Add some space from bottom
          },
        }),
      }}
    />
  )
}
