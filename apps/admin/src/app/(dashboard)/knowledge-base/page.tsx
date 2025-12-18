'use client';

import { useState } from 'react';
import {
  Book,
  Search,
  Plus,
  FileText,
  FolderOpen,
  Clock,
  User,
  Eye,
  Edit,
  Star,
  ChevronRight,
  BookOpen,
  HelpCircle,
  Lightbulb,
  Shield,
  CreditCard,
  Users,
  Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

// Mock knowledge base data
const categories = [
  { id: 'getting-started', name: 'Başlangıç', icon: BookOpen, count: 12, color: 'bg-blue-100' },
  { id: 'users', name: 'Kullanıcı Yönetimi', icon: Users, count: 18, color: 'bg-green-100' },
  { id: 'moderation', name: 'Moderasyon', icon: Shield, count: 15, color: 'bg-purple-100' },
  { id: 'finance', name: 'Finans & Ödemeler', icon: CreditCard, count: 10, color: 'bg-emerald-100' },
  { id: 'support', name: 'Müşteri Desteği', icon: HelpCircle, count: 22, color: 'bg-orange-100' },
  { id: 'settings', name: 'Sistem Ayarları', icon: Settings, count: 8, color: 'bg-gray-100' },
];

const articles = [
  {
    id: '1',
    title: 'Admin Paneline Giriş',
    category: 'getting-started',
    excerpt: 'Admin panelinin temel özellikleri ve kullanımı hakkında genel bilgi.',
    author: 'Sistem',
    views: 1245,
    updated: '2024-12-15',
    pinned: true,
  },
  {
    id: '2',
    title: 'Kullanıcı Hesabı Askıya Alma',
    category: 'users',
    excerpt: 'Kullanıcı hesaplarını askıya alma ve geri yükleme işlemleri.',
    author: 'Ahmet Y.',
    views: 856,
    updated: '2024-12-14',
    pinned: true,
  },
  {
    id: '3',
    title: 'Moment Moderasyon Rehberi',
    category: 'moderation',
    excerpt: 'Moment içeriklerini onaylama ve reddetme kriterleri.',
    author: 'Fatma D.',
    views: 723,
    updated: '2024-12-13',
    pinned: false,
  },
  {
    id: '4',
    title: 'Ödeme İadeleri İşleme',
    category: 'finance',
    excerpt: 'İade taleplerini değerlendirme ve işleme alma süreci.',
    author: 'Zeynep A.',
    views: 534,
    updated: '2024-12-12',
    pinned: false,
  },
  {
    id: '5',
    title: 'Sık Sorulan Sorulara Yanıt Verme',
    category: 'support',
    excerpt: 'Destek taleplerini etkili bir şekilde yanıtlama teknikleri.',
    author: 'Emre K.',
    views: 689,
    updated: '2024-12-11',
    pinned: false,
  },
  {
    id: '6',
    title: 'KYC Doğrulama Süreci',
    category: 'users',
    excerpt: 'Kimlik doğrulama belgelerini inceleme ve onaylama.',
    author: 'Can Ö.',
    views: 445,
    updated: '2024-12-10',
    pinned: false,
  },
];

const recentlyViewed = [
  { id: '1', title: 'Admin Paneline Giriş', category: 'Başlangıç' },
  { id: '3', title: 'Moment Moderasyon Rehberi', category: 'Moderasyon' },
  { id: '5', title: 'Sık Sorulan Sorulara Yanıt Verme', category: 'Destek' },
];

export default function KnowledgeBasePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredArticles = articles.filter((article) => {
    if (selectedCategory && article.category !== selectedCategory) return false;
    if (searchQuery && !article.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.icon || FileText;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bilgi Bankası</h1>
          <p className="text-muted-foreground">İç dokümantasyon ve rehberler</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Makale
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-xl">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Dokümanlarda ara..."
          className="pl-10 h-12 text-lg"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Kategoriler</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1 p-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-left transition-colors ${
                    selectedCategory === null ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <FolderOpen className="h-4 w-4" />
                    Tümü
                  </span>
                  <Badge variant="secondary">{articles.length}</Badge>
                </button>
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-left transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {category.name}
                      </span>
                      <Badge variant="secondary">{category.count}</Badge>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recently Viewed */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Son Görüntülenen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentlyViewed.map((article) => (
                  <div
                    key={article.id}
                    className="flex items-start gap-2 text-sm cursor-pointer hover:text-primary"
                  >
                    <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{article.title}</p>
                      <p className="text-xs text-muted-foreground">{article.category}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-4">
          {/* Pinned Articles */}
          {!selectedCategory && !searchQuery && (
            <div className="grid gap-4 md:grid-cols-2">
              {articles
                .filter((a) => a.pinned)
                .map((article) => {
                  const Icon = getCategoryIcon(article.category);
                  return (
                    <Card key={article.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <Star className="h-5 w-5 text-primary fill-primary" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium">{article.title}</h3>
                            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                              {article.excerpt}
                            </p>
                            <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                {article.views}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {article.updated}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          )}

          {/* Articles List */}
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedCategory
                  ? categories.find((c) => c.id === selectedCategory)?.name
                  : 'Tüm Makaleler'}
              </CardTitle>
              <CardDescription>
                {filteredArticles.length} makale bulundu
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredArticles.map((article) => {
                  const Icon = getCategoryIcon(article.category);
                  const categoryName = categories.find((c) => c.id === article.category)?.name;
                  return (
                    <div
                      key={article.id}
                      className="flex items-center justify-between rounded-lg border p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                          <Icon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{article.title}</h3>
                            {article.pinned && (
                              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            )}
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
                            {article.excerpt}
                          </p>
                          <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                            <Badge variant="outline">{categoryName}</Badge>
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {article.author}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {article.views}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {article.updated}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
