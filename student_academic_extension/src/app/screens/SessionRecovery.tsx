import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { AlertTriangle, RefreshCw, Clock, ShieldCheck, ExternalLink } from 'lucide-react'

export default function SessionRecovery() {
  const [sessionStatus, setSessionStatus] = useState<'active' | 'expired' | 'recovering'>('active')
  const [lastActivity, setLastActivity] = useState(new Date().toISOString())

  const simulateExpiry = () => {
    setSessionStatus('expired')
    setLastActivity(new Date().toISOString())
  }

  const handleRecover = () => {
    setSessionStatus('recovering')
    setTimeout(() => {
      setSessionStatus('active')
      setLastActivity(new Date().toISOString())
    }, 2000)
  }

  const formatTime = (iso: string) => {
    return new Date(iso).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Session Recovery</h1>
        <p className="text-muted-foreground text-sm">Automatic portal session recovery and management</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <ShieldCheck size={20} className="text-green-500" />
            <CardTitle className="text-base">Session Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                sessionStatus === 'active' ? 'bg-green-100 text-green-700' :
                sessionStatus === 'expired' ? 'bg-red-100 text-red-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>
                {sessionStatus === 'active' ? 'Active' :
                 sessionStatus === 'expired' ? 'Expired' : 'Recovering'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Clock size={20} className="text-blue-500" />
            <CardTitle className="text-base">Last Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{formatTime(lastActivity)}</div>
            <p className="text-xs text-muted-foreground">Session timestamp</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <RefreshCw size={20} className="text-orange-500" />
            <CardTitle className="text-base">Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {sessionStatus === 'expired' ? (
                <button
                  onClick={handleRecover}
                  className="flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm"
                >
                  <RefreshCw size={14} />
                  Recover Session
                </button>
              ) : (
                <button
                  onClick={simulateExpiry}
                  className="flex items-center gap-1 px-3 py-1.5 border border-border rounded-md text-sm"
                >
                  <AlertTriangle size={14} />
                  Simulate Expiry
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Session Recovery Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <AlertTriangle size={20} className="text-orange-500 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Session Expiration Detection</p>
                <p className="text-xs text-muted-foreground mt-1">Automatically detects when your portal session has expired</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <RefreshCw size={20} className="text-blue-500 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Quick Re-authentication Flow</p>
                <p className="text-xs text-muted-foreground mt-1">Guides you through a smooth re-authentication process</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <ExternalLink size={20} className="text-green-500 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Restore Previous Page</p>
                <p className="text-xs text-muted-foreground mt-1">Automatically returns you to the page you were viewing before logout</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
