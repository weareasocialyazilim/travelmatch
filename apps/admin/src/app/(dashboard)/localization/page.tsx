'use client';

import { useState } from 'react';
import {
  Globe,
  Languages,
  Search,
  Plus,
  Check,
  AlertCircle,
  Edit,
  Download,
  Upload,
  MoreHorizontal,
  Eye,
  Copy,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// Mock localization data
const languages = [
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷', progress: 100, strings: 2456, missing: 0, status: 'complete' },
  { code: 'en', name: 'English', flag: '🇺🇸', progress: 100, strings: 2456, missing: 0, status: 'complete' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪', progress: 85, strings: 2087, missing: 369, status: 'review' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', progress: 78, strings: 1916, missing: 540, status: 'in_progress' },
  { code: 'es', name: 'Español', flag: '🇪🇸', progress: 72, strings: 1768, missing: 688, status: 'in_progress' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦', progress: 45, strings: 1105, missing: 1351, status: 'in_progress' },
  { code: 'ja', name: '日本語', flag: '🇯🇵', progress: 30, strings: 737, missing: 1719, status: 'draft' },
  { code: 'zh', name: '中文', flag: '🇨🇳', progress: 25, strings: 614, missing: 1842, status: 'draft' },
];

const translations = [
  { key: 'common.welcome', tr: 'Hoş Geldiniz', en: 'Welcome', de: 'Willkommen', fr: 'Bienvenue' },
  { key: 'common.login', tr: 'Giriş Yap', en: 'Login', de: 'Anmelden', fr: 'Connexion' },
  { key: 'common.signup', tr: 'Kayıt Ol', en: 'Sign Up', de: 'Registrieren', fr: "S'inscrire" },
  { key: 'common.logout', tr: 'Çıkış', en: 'Logout', de: 'Abmelden', fr: 'Déconnexion' },
  { key: 'profile.edit', tr: 'Profili Düzenle', en: 'Edit Profile', de: 'Profil bearbeiten', fr: '' },
  { key: 'moment.share', tr: 'Moment Paylaş', en: 'Share Moment', de: 'Moment teilen', fr: '' },
];

export default function LocalizationPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLang, setSelectedLang] = useState('all');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'complete':
        return <Badge className="bg-green-500">Tamamlandı</Badge>;
      case 'review':
        return <Badge className="bg-blue-500">İnceleniyor</Badge>;
      case 'in_progress':
        return <Badge className="bg-yellow-500">Devam Ediyor</Badge>;
      case 'draft':
        return <Badge variant="outline">Taslak</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Yerelleştirme</h1>
          <p className="text-muted-foreground">Çeviri ve dil yönetimi</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Dışa Aktar
          </Button>
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            İçe Aktar
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Yeni Dil
          </Button>
        </div>
      </div>

      {/* Language Progress */}
      <div className="grid gap-4 md:grid-cols-4">
        {languages.slice(0, 4).map((lang) => (
          <Card key={lang.code}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{lang.flag}</span>
                  <div>
                    <p className="font-medium">{lang.name}</p>
                    <p className="text-xs text-muted-foreground">{lang.code.toUpperCase()}</p>
                  </div>
                </div>
                {getStatusBadge(lang.status)}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">İlerleme</span>
                  <span className="font-medium">{lang.progress}%</span>
                </div>
                <Progress value={lang.progress} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{lang.strings} çevrildi</span>
                  <span>{lang.missing} eksik</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="languages" className="space-y-4">
        <TabsList>
          <TabsTrigger value="languages">Diller</TabsTrigger>
          <TabsTrigger value="strings">Çeviri Metinleri</TabsTrigger>
          <TabsTrigger value="missing">Eksik Çeviriler</TabsTrigger>
        </TabsList>

        <TabsContent value="languages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tüm Diller</CardTitle>
              <CardDescription>Desteklenen diller ve çeviri durumları</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Dil</TableHead>
                    <TableHead>Kod</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>İlerleme</TableHead>
                    <TableHead className="text-right">Çevrilen</TableHead>
                    <TableHead className="text-right">Eksik</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {languages.map((lang) => (
                    <TableRow key={lang.code}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{lang.flag}</span>
                          <span className="font-medium">{lang.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono">{lang.code.toUpperCase()}</TableCell>
                      <TableCell>{getStatusBadge(lang.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={lang.progress} className="h-2 w-20" />
                          <span className="text-sm">{lang.progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{lang.strings.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        {lang.missing > 0 ? (
                          <span className="text-red-500">{lang.missing}</span>
                        ) : (
                          <Check className="h-4 w-4 text-green-500 ml-auto" />
                        )}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="strings" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Anahtar veya çeviri ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={selectedLang} onValueChange={setSelectedLang}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Dil" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Diller</SelectItem>
                {languages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-64">Anahtar</TableHead>
                  <TableHead>🇹🇷 Türkçe</TableHead>
                  <TableHead>🇺🇸 English</TableHead>
                  <TableHead>🇩🇪 Deutsch</TableHead>
                  <TableHead>🇫🇷 Français</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {translations.map((item) => (
                  <TableRow key={item.key}>
                    <TableCell className="font-mono text-sm">{item.key}</TableCell>
                    <TableCell>{item.tr}</TableCell>
                    <TableCell>{item.en}</TableCell>
                    <TableCell>{item.de}</TableCell>
                    <TableCell>
                      {item.fr || (
                        <span className="text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Eksik
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="missing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Eksik Çeviriler</CardTitle>
              <CardDescription>Tamamlanması gereken çeviriler</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {languages
                  .filter((l) => l.missing > 0)
                  .map((lang) => (
                    <div
                      key={lang.code}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{lang.flag}</span>
                        <div>
                          <p className="font-medium">{lang.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {lang.missing} eksik çeviri
                          </p>
                        </div>
                      </div>
                      <Button size="sm">
                        <Edit className="mr-2 h-4 w-4" />
                        Çevirileri Tamamla
                      </Button>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
