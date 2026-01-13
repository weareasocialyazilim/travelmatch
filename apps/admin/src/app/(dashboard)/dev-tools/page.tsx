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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
        return 'bg-green-500 dark:bg-green-600';
      case 'POST':
        return 'bg-blue-500 dark:bg-blue-600';
      case 'PATCH':
        return 'bg-yellow-500 dark:bg-yellow-600';
      case 'PUT':
        return 'bg-orange-500 dark:bg-orange-600';
      case 'DELETE':
        return 'bg-red-500 dark:bg-red-600';
      default:
        return 'bg-gray-500 dark:bg-gray-600';
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
              <CanvaCard>
                <CanvaCardHeader>
                  <CanvaCardTitle>API İsteği</CanvaCardTitle>
                  <CanvaCardSubtitle>
                    API uç noktalarını test edin
                  </CanvaCardSubtitle>
                </CanvaCardHeader>
                <CanvaCardBody className="space-y-4">
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
                    <CanvaButton
                      onClick={handleSendRequest}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="mr-2 h-4 w-4" />
                      )}
                      Gönder
                    </CanvaButton>
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
                        <CanvaButton
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCopy(response)}
                        >
                          {copied ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </CanvaButton>
                      </div>
                      <div className="relative rounded-lg bg-muted p-4 overflow-auto max-h-96">
                        <pre className="text-sm font-mono text-green-600 dark:text-green-400">
                          {response}
                        </pre>
                      </div>
                    </div>
                  )}
                </CanvaCardBody>
              </CanvaCard>
            </div>

            {/* Endpoints List */}
            <CanvaCard>
              <CanvaCardHeader>
                <CanvaCardTitle>API Uç Noktaları</CanvaCardTitle>
                <CanvaCardSubtitle>Mevcut endpointler</CanvaCardSubtitle>
              </CanvaCardHeader>
              <CanvaCardBody>
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
                      <CanvaBadge
                        className={`${getMethodColor(endpoint.method)} text-white text-xs`}
                      >
                        {endpoint.method}
                      </CanvaBadge>
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
              </CanvaCardBody>
            </CanvaCard>
          </div>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            <CanvaCard>
              <CanvaCardHeader>
                <CanvaCardTitle>Webhook Logları</CanvaCardTitle>
                <CanvaCardSubtitle>Son gelen webhook istekleri</CanvaCardSubtitle>
              </CanvaCardHeader>
              <CanvaCardBody>
                <div className="space-y-3">
                  {recentWebhooks.map((webhook) => (
                    <div
                      key={webhook.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="flex items-center gap-3">
                        {webhook.status === 'success' ? (
                          <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-red-500 dark:text-red-400" />
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
                            <p className="text-xs text-red-500 dark:text-red-400">
                              {webhook.error}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <CanvaBadge variant="default">
                          {webhook.duration}
                        </CanvaBadge>
                        <CanvaButton size="sm" variant="ghost">
                          <FileJson className="h-4 w-4" />
                        </CanvaButton>
                      </div>
                    </div>
                  ))}
                </div>
              </CanvaCardBody>
            </CanvaCard>

            <CanvaCard>
              <CanvaCardHeader>
                <CanvaCardTitle>Webhook Yapılandırması</CanvaCardTitle>
                <CanvaCardSubtitle>Webhook endpoint ayarları</CanvaCardSubtitle>
              </CanvaCardHeader>
              <CanvaCardBody className="space-y-4">
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
                    <CanvaButton variant="primary" size="sm" iconOnly>
                      <RefreshCw className="h-4 w-4" />
                    </CanvaButton>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Aktif Eventler</Label>
                  <div className="flex flex-wrap gap-2">
                    <CanvaBadge>user.created</CanvaBadge>
                    <CanvaBadge>user.updated</CanvaBadge>
                    <CanvaBadge>payment.completed</CanvaBadge>
                    <CanvaBadge>moment.created</CanvaBadge>
                    <CanvaBadge>match.created</CanvaBadge>
                    <CanvaBadge variant="default">+ Ekle</CanvaBadge>
                  </div>
                </div>
                <CanvaButton className="w-full">Kaydet</CanvaButton>
              </CanvaCardBody>
            </CanvaCard>
          </div>
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <CanvaCard>
            <CanvaCardHeader>
              <CanvaCardTitle>SQL Sorgusu</CanvaCardTitle>
              <CanvaCardSubtitle>
                Veritabanı üzerinde salt okunur sorgular çalıştırın (SELECT
                only)
              </CanvaCardSubtitle>
            </CanvaCardHeader>
            <CanvaCardBody className="space-y-4">
              <Textarea
                placeholder="SELECT * FROM profiles LIMIT 10;"
                className="font-mono h-32"
              />
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  <AlertTriangle className="inline h-4 w-4 mr-1" />
                  Sadece SELECT sorguları çalıştırılabilir
                </p>
                <CanvaButton>
                  <Play className="mr-2 h-4 w-4" />
                  Çalıştır
                </CanvaButton>
              </div>
            </CanvaCardBody>
          </CanvaCard>

          <CanvaCard>
            <CanvaCardHeader>
              <CanvaCardTitle>Tablo İstatistikleri</CanvaCardTitle>
            </CanvaCardHeader>
            <CanvaCardBody>
              <div className="grid gap-4 md:grid-cols-4">
                <CanvaStatCard label="profiles" value="24,589" />
                <CanvaStatCard label="moments" value="89,432" />
                <CanvaStatCard label="matches" value="156,789" />
                <CanvaStatCard label="transactions" value="45,231" />
              </div>
            </CanvaCardBody>
          </CanvaCard>
        </TabsContent>

        <TabsContent value="debug" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            <CanvaCard>
              <CanvaCardHeader>
                <CanvaCardTitle>Ortam Değişkenleri</CanvaCardTitle>
                <CanvaCardSubtitle>Yapılandırma durumu</CanvaCardSubtitle>
              </CanvaCardHeader>
              <CanvaCardBody>
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
                        <CanvaBadge className="bg-green-500 dark:bg-green-600">
                          Ayarlandı
                        </CanvaBadge>
                      ) : (
                        <CanvaBadge variant="error">Eksik</CanvaBadge>
                      )}
                    </div>
                  ))}
                </div>
              </CanvaCardBody>
            </CanvaCard>

            <CanvaCard>
              <CanvaCardHeader>
                <CanvaCardTitle>Sistem Bilgisi</CanvaCardTitle>
                <CanvaCardSubtitle>Uygulama durumu</CanvaCardSubtitle>
              </CanvaCardHeader>
              <CanvaCardBody>
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
                    <CanvaBadge>Production</CanvaBadge>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <span className="text-sm">Uptime</span>
                    <code className="text-sm">3d 14h 22m</code>
                  </div>
                </div>
              </CanvaCardBody>
            </CanvaCard>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
