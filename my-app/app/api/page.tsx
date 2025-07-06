import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Code, Database, Zap } from "lucide-react"

export default function APIPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Developer API</h1>
          <p className="text-lg text-gray-300">
            Integrate Contract Obituaries into your dApp, wallet, or block explorer
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Database className="h-6 w-6 text-blue-400" />
                <div>
                  <CardTitle className="text-white">The Graph API</CardTitle>
                  <CardDescription className="text-gray-300">Query obituary data via GraphQL</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Badge variant="outline" className="border-blue-500 text-blue-400">
                  GraphQL Endpoint
                </Badge>
                <pre className="bg-slate-900/50 p-3 rounded text-sm text-gray-300 overflow-x-auto">
                  {`query GetObituary($address: String!) {
  contractObituary(
    where: { contractAddress: $address }
  ) {
    id
    contractAddress
    reason
    lastSafeBlock
    verifications
    alternatives
  }
}`}
                </pre>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Code className="h-6 w-6 text-green-400" />
                <div>
                  <CardTitle className="text-white">REST API</CardTitle>
                  <CardDescription className="text-gray-300">
                    Simple HTTP endpoints for quick integration
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Badge variant="outline" className="border-green-500 text-green-400">
                  REST Endpoints
                </Badge>
                <div className="space-y-2 text-sm">
                  <div className="bg-slate-900/50 p-2 rounded">
                    <code className="text-green-400">GET</code>
                    <code className="text-gray-300 ml-2">/api/obituary/{"{address}"}</code>
                  </div>
                  <div className="bg-slate-900/50 p-2 rounded">
                    <code className="text-blue-400">POST</code>
                    <code className="text-gray-300 ml-2">/api/obituary</code>
                  </div>
                  <div className="bg-slate-900/50 p-2 rounded">
                    <code className="text-green-400">GET</code>
                    <code className="text-gray-300 ml-2">/api/obituaries</code>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Zap className="h-6 w-6 text-purple-400" />
                <div>
                  <CardTitle className="text-white">WebSocket</CardTitle>
                  <CardDescription className="text-gray-300">Real-time obituary notifications</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Badge variant="outline" className="border-purple-500 text-purple-400">
                  Real-time Updates
                </Badge>
                <pre className="bg-slate-900/50 p-3 rounded text-sm text-gray-300 overflow-x-auto">
                  {`const ws = new WebSocket(
  'wss://api.obituaries.xyz/ws'
);

ws.on('obituary:new', (data) => {
  console.log('New obituary:', data);
});`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Integration Examples</CardTitle>
              <CardDescription className="text-gray-300">Common use cases for Contract Obituaries API</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="text-white font-medium mb-2">Wallet Integration</h3>
                  <pre className="bg-slate-900/50 p-3 rounded text-sm text-gray-300 overflow-x-auto">
                    {`// Check before transaction
const checkContract = async (address) => {
  const response = await fetch(
    \`/api/obituary/\${address}\`
  );
  const obituary = await response.json();
  
  if (obituary.exists) {
    showWarning(obituary.reason);
    return false;
  }
  return true;
};`}
                  </pre>
                </div>
                <div>
                  <h3 className="text-white font-medium mb-2">dApp Integration</h3>
                  <pre className="bg-slate-900/50 p-3 rounded text-sm text-gray-300 overflow-x-auto">
                    {`// Filter out dead contracts
const getActiveContracts = async () => {
  const contracts = await getAllContracts();
  const active = [];
  
  for (const contract of contracts) {
    const obituary = await checkObituary(
      contract.address
    );
    if (!obituary.exists) {
      active.push(contract);
    }
  }
  return active;
};`}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
