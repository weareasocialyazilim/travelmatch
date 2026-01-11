'use client';

import { useState } from 'react';
import {
  Code,
  Play,
  Copy,
  Check,
  Terminal,
  Database,
  Webhook,
  Key,
  Bug,
  RefreshCw,
  Clock,
  AlertTriangle,
  CheckCircle,
  Send,
  FileJson,
  Braces,
} from 'lucide-react';
import { CanvaButton } from '@/components/canva/CanvaButton';
import { CanvaInput } from '@/components/canva/CanvaInput';
import {
  CanvaCard,
  CanvaCardHeader,
  CanvaCardTitle,
  CanvaCardSubtitle,
  CanvaCardBody,
  CanvaStatCard,
} from '@/components/canva/CanvaCard';
import { CanvaBadge } from '@/components/canva/CanvaBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Mock API endpoints
const apiEndpoints = [
  { method: 'GET', path: '/api/users', description: 'Kullanıcı listesi' },
  { method: 'GET', path: '/api/users/:id', description: 'Kullanıcı detayı' },
  {
    method: 'PATCH',
    path: '/api/users/:id',
    description: 'Kullanıcı güncelle',
  },
  { method: 'GET', path: '/api/moments', description: 'Moment listesi' },
  { method: 'GET', path: '/api/tasks', description: 'Görev listesi' },
  { method: 'POST', path: '/api/tasks', description: 'Yeni görev oluştur' },
  { method: 'GET', path: '/api/stats', description: 'İstatistikler' },
  { method: 'GET', path: '/api/disputes', description: 'Anlaşmazlık listesi' },
];

const recentWebhooks = [
  {
    id: 'wh_1',
    event: 'user.created',
    status: 'success',
    timestamp: '2024-12-18T14:30:00Z',
    duration: '124ms',
  },
  {
    id: 'wh_2',
    event: 'payment.completed',
    status: 'success',
    timestamp: '2024-12-18T14:28:00Z',
    duration: '89ms',
  },
  {
    id: 'wh_3',
    event: 'moment.created',
    status: 'failed',
    timestamp: '2024-12-18T14:25:00Z',
    duration: '2341ms',
    error: 'Timeout exceeded',
  },
  {
    id: 'wh_4',
    event: 'match.created',
    status: 'success',
    timestamp: '2024-12-18T14:22:00Z',
    duration: '156ms',
  },
];

const sampleResponse = {
  success: true,
  data: {
    users: [
      {
        id: 'usr_123',
        display_name: 'John Doe',
        email: 'john@example.com',
        is_verified: true,
        created_at: '2024-01-15T10:30:00Z',
      },
    ],
    total: 1,
    limit: 50,
    offset: 0,
  },
};

export default function DevToolsPage() {
  const [selectedMethod, setSelectedMethod] = useState('GET');
  const [apiPath, setApiPath] = useState('/api/users');
  const [requestBody, setRequestBody] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendRequest = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    setResponse(JSON.stringify(sampleResponse, null, 2));
    setIsLoading(false);
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET':
        return 'bg-green-500';
      case 'POST':
        return 'bg-blue-500';
      case 'PATCH':
        return 'bg-yellow-500';
      case 'PUT':
        return 'bg-orange-500';
      case 'DELETE':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Geliştirici Araçları
          </h1>
          <p className="text-muted-foreground">
            API playground ve hata ayıklama
          </p>
        </div>
      </div>

      <Tabs defaultValue="playground" className="space-y-4">
        <TabsList>
          <TabsTrigger value="playground">
            <Code className="mr-2 h-4 w-4" />
            API Playground
          </TabsTrigger>
          <TabsTrigger value="webhooks">
            <Webhook className="mr-2 h-4 w-4" />
            Webhooks
          </TabsTrigger>
          <TabsTrigger value="database">
            <Database className="mr-2 h-4 w-4" />
            Database
          </TabsTrigger>
          <TabsTrigger value="debug">
            <Bug className="mr-2 h-4 w-4" />
            Debug
          </TabsTrigger>
        </TabsList>

        <TabsContent value="playground" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Request Builder */}
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>API İsteği</CardTitle>
                  <CardDescription>
                    API uç noktalarını test edin
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Select
                      value={selectedMethod}
                      onValueChange={setSelectedMethod}
                    >
                      <SelectTrigger className="w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GET">GET</SelectItem>
                        <SelectItem value="POST">POST</SelectItem>
                        <SelectItem value="PATCH">PATCH</SelectItem>
                        <SelectItem value="PUT">PUT</SelectItem>
                        <SelectItem value="DELETE">DELETE</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      value={apiPath}
                      onChange={(e) => setApiPath(e.target.value)}
                      placeholder="/api/endpoint"
                      className="flex-1 font-mono"
                    />
                    <Button onClick={handleSendRequest} disabled={isLoading}>
                      {isLoading ? (
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="mr-2 h-4 w-4" />
                      )}
                      Gönder
                    </Button>
                  </div>

                  {['POST', 'PATCH', 'PUT'].includes(selectedMethod) && (
                    <div className="space-y-2">
                      <Label>Request Body</Label>
                      <Textarea
                        value={requestBody}
                        onChange={(e) => setRequestBody(e.target.value)}
                        placeholder='{"key": "value"}'
                        className="font-mono h-32"
                      />
                    </div>
                  )}

                  {/* Response */}
                  {response && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Response</Label>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCopy(response)}
                        >
                          {copied ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <div className="relative rounded-lg bg-muted p-4 overflow-auto max-h-96">
                        <pre className="text-sm font-mono text-green-600">
                          {response}
                        </pre>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Endpoints List */}
            <Card>
              <CardHeader>
                <CardTitle>API Uç Noktaları</CardTitle>
                <CardDescription>Mevcut endpointler</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {apiEndpoints.map((endpoint, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setSelectedMethod(endpoint.method);
                        setApiPath(endpoint.path);
                      }}
                      className="w-full flex items-center gap-2 rounded-lg border p-3 text-left hover:bg-muted transition-colors"
                    >
                      <Badge
                        className={`${getMethodColor(endpoint.method)} text-white text-xs`}
                      >
                        {endpoint.method}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <p className="font-mono text-sm truncate">
                          {endpoint.path}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {endpoint.description}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Webhook Logları</CardTitle>
                <CardDescription>Son gelen webhook istekleri</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentWebhooks.map((webhook) => (
                    <div
                      key={webhook.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="flex items-center gap-3">
                        {webhook.status === 'success' ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                        )}
                        <div>
                          <p className="font-medium font-mono text-sm">
                            {webhook.event}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(webhook.timestamp).toLocaleString(
                              'tr-TR',
                            )}
                          </p>
                          {webhook.error && (
                            <p className="text-xs text-red-500">
                              {webhook.error}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{webhook.duration}</Badge>
                        <Button size="sm" variant="ghost">
                          <FileJson className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Webhook Yapılandırması</CardTitle>
                <CardDescription>Webhook endpoint ayarları</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Webhook URL</Label>
                  <Input
                    placeholder="https://your-domain.com/webhook"
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Secret Key</Label>
                  <div className="flex gap-2">
                    <Input
                      type="password"
                      value="whsec_xxxxxxxxxxxxxxxx"
                      readOnly
                      className="font-mono"
                    />
                    <Button variant="outline" size="icon">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Aktif Eventler</Label>
                  <div className="flex flex-wrap gap-2">
                    <Badge>user.created</Badge>
                    <Badge>user.updated</Badge>
                    <Badge>payment.completed</Badge>
                    <Badge>moment.created</Badge>
                    <Badge>match.created</Badge>
                    <Badge variant="outline">+ Ekle</Badge>
                  </div>
                </div>
                <Button className="w-full">Kaydet</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SQL Sorgusu</CardTitle>
              <CardDescription>
                Veritabanı üzerinde salt okunur sorgular çalıştırın (SELECT
                only)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="SELECT * FROM profiles LIMIT 10;"
                className="font-mono h-32"
              />
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  <AlertTriangle className="inline h-4 w-4 mr-1" />
                  Sadece SELECT sorguları çalıştırılabilir
                </p>
                <Button>
                  <Play className="mr-2 h-4 w-4" />
                  Çalıştır
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tablo İstatistikleri</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">profiles</p>
                  <p className="text-2xl font-bold">24,589</p>
                  <p className="text-xs text-muted-foreground">satır</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">moments</p>
                  <p className="text-2xl font-bold">89,432</p>
                  <p className="text-xs text-muted-foreground">satır</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">matches</p>
                  <p className="text-2xl font-bold">156,789</p>
                  <p className="text-xs text-muted-foreground">satır</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">transactions</p>
                  <p className="text-2xl font-bold">45,231</p>
                  <p className="text-xs text-muted-foreground">satır</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="debug" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Ortam Değişkenleri</CardTitle>
                <CardDescription>Yapılandırma durumu</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { key: 'NEXT_PUBLIC_SUPABASE_URL', status: 'set' },
                    { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', status: 'set' },
                    { key: 'SUPABASE_SERVICE_ROLE_KEY', status: 'set' },
                    { key: 'STRIPE_SECRET_KEY', status: 'set' },
                    { key: 'SENTRY_DSN', status: 'set' },
                    { key: 'POSTHOG_KEY', status: 'not_set' },
                  ].map((env) => (
                    <div
                      key={env.key}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <code className="text-sm">{env.key}</code>
                      {env.status === 'set' ? (
                        <Badge className="bg-green-500">Ayarlandı</Badge>
                      ) : (
                        <Badge variant="destructive">Eksik</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sistem Bilgisi</CardTitle>
                <CardDescription>Uygulama durumu</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <span className="text-sm">Node.js Version</span>
                    <code className="text-sm">v20.10.0</code>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <span className="text-sm">Next.js Version</span>
                    <code className="text-sm">14.0.4</code>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <span className="text-sm">Build ID</span>
                    <code className="text-sm">abc123def</code>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <span className="text-sm">Environment</span>
                    <Badge>Production</Badge>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <span className="text-sm">Uptime</span>
                    <code className="text-sm">3d 14h 22m</code>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
