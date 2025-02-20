'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const client = new QueryClient()

// This function is a wrapper around the QueryClientProvider component.
// It provides the client to the rest of the app.
// This is necessary to use React Query hooks like useQuery and useMutation.
export default function ReactQueryClientProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
