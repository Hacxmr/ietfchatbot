import { useAuth } from "@/hooks/useAuth"

export function AuthDebugInfo() {
  const { user, isLoading, isAuthenticated } = useAuth()
  
  if (isLoading) {
    return <div className="p-4 bg-yellow-100 rounded">🔄 Authentication loading...</div>
  }
  
  return (
    <div className="p-4 bg-green-100 rounded mt-4">
      <h3 className="font-bold">🔍 Auth Debug Info:</h3>
      <p>✅ Clerk is loaded successfully</p>
      <p>🔐 Authenticated: {isAuthenticated ? "Yes" : "No"}</p>
      {isAuthenticated && user && (
        <div>
          <p>👤 User ID: {user.id}</p>
          <p>📧 Email: {user.emailAddresses?.[0]?.emailAddress}</p>
          <p>👋 Name: {user.firstName} {user.lastName}</p>
        </div>
      )}
    </div>
  )
}
