'use client';

import { useState } from 'react';
import {
  Users,
  TrendingUp,
  CheckCircle,
  XCircle,
  Instagram,
  ThumbsUp,
  ThumbsDown,
  ClipboardList,
  Send,
  ExternalLink,
  MapPin,
  BarChart3,
  ChevronRight,
  Globe2,
} from 'lucide-react';
import { CanvaButton } from '@/components/canva/CanvaButton';
import {
  CanvaCard,
  CanvaCardBody,
  CanvaStatCard,
} from '@/components/canva/CanvaCard';
import { CanvaBadge } from '@/components/canva/CanvaBadge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// 15 Şehir Hub Verisi
const cityHubs = [
  { name: 'İstanbul', applicants: 24, ambassadors: 12, growth: '+15%' },
  { name: 'Roma', applicants: 12, ambassadors: 8, growth: '+5%' },
  { name: 'Paris', applicants: 18, ambassadors: 9, growth: '+8%' },
  { name: 'Tokyo', applicants: 32, ambassadors: 6, growth: '+22%' },
  { name: 'Dubai', applicants: 15, ambassadors: 11, growth: '+12%' },
  { name: 'New York', applicants: 45, ambassadors: 20, growth: '+30%' },
  { name: 'Seul', applicants: 28, ambassadors: 5, growth: '+18%' },
  { name: 'Rio de Janeiro', applicants: 10, ambassadors: 4, growth: '+2%' },
  { name: 'Marakeş', applicants: 7, ambassadors: 3, growth: '+4%' },
  { name: 'Amsterdam', applicants: 14, ambassadors: 7, growth: '+9%' },
  { name: 'Los Angeles', applicants: 22, ambassadors: 14, growth: '+11%' },
  { name: 'Atina', applicants: 6, ambassadors: 4, growth: '0%' },
  { name: 'Singapur', applicants: 19, ambassadors: 8, growth: '+14%' },
  { name: 'Sidney', applicants: 11, ambassadors: 5, growth: '+6%' },
  { name: 'Reykjavik', applicants: 5, ambassadors: 2, growth: '+25%' },
];

// Güncellenmiş Profesyonel Veri Modeli
const applications = [
  {
    id: 'app_1',
    name: 'Elif Arslan',
    username: '@elif_journey',
    platform: 'Instagram',
    social_link: 'https://instagram.com/elif_journey',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=elif',
    followers: 8500,
    applied_at: '16.12.2024',
    status: 'pending',
    votes: { approve: 3, reject: 0 },
  },
];

export default function CreatorsPage() {
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [evaluationNote, setEvaluationNote] = useState('');

  const formatNumber = (num: number) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className="space-y-6">
      {/* Sayfa Başlığı ve Genel İstatistikler */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 uppercase">
            İçerik Üreticisi Programı
          </h1>
          <p className="text-muted-foreground text-sm font-medium">
            Marka elçilerini ve bölgesel genişlemeyi yönetin
          </p>
        </div>
      </div>

      <Tabs defaultValue="geographic" className="space-y-4">
        <TabsList className="bg-slate-100 p-1 rounded-xl">
          <TabsTrigger value="geographic" className="rounded-lg gap-2">
            <Globe2 className="h-4 w-4" /> Bölgesel Dağılım
          </TabsTrigger>
          <TabsTrigger value="applications" className="rounded-lg">
            Yeni Başvurular
            <CanvaBadge className="ml-2 bg-blue-700 text-[10px]">
              {applications.length}
            </CanvaBadge>
          </TabsTrigger>
          <TabsTrigger value="creators" className="rounded-lg">
            Aktif Elçiler
          </TabsTrigger>
        </TabsList>

        {/* Bölgesel Dağılım İçeriği */}
        <TabsContent value="geographic" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
              <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                En Aktif Hub
              </p>
              <p className="text-xl font-black text-blue-900">NEW YORK</p>
            </div>
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
              <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                Global Elçi Sayısı
              </p>
              <p className="text-xl font-black text-emerald-900">118</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Toplam Hub
              </p>
              <p className="text-xl font-black text-slate-900">15/15</p>
            </div>
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
              <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                Ort. İçerik Kalitesi
              </p>
              <p className="text-xl font-black text-amber-900">4.8/5.0</p>
            </div>
          </div>

          <CanvaCard className="border-slate-200 overflow-hidden shadow-sm">
            <CanvaCardBody className="p-0">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="hover:bg-transparent border-slate-100">
                    <TableHead className="font-bold text-slate-400 uppercase text-[10px] tracking-widest py-5">
                      Şehir Hub
                    </TableHead>
                    <TableHead className="text-center font-bold text-slate-400 uppercase text-[10px] tracking-widest">
                      Bekleyen Başvuru
                    </TableHead>
                    <TableHead className="text-center font-bold text-slate-400 uppercase text-[10px] tracking-widest">
                      Aktif Elçi
                    </TableHead>
                    <TableHead className="text-center font-bold text-slate-400 uppercase text-[10px] tracking-widest">
                      Büyüme
                    </TableHead>
                    <TableHead className="text-right font-bold text-slate-400 uppercase text-[10px] tracking-widest pr-8">
                      Aksiyon
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cityHubs.map((hub) => (
                    <TableRow key={hub.name} className="border-slate-100 group">
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-100 rounded-xl group-hover:bg-blue-100 transition-colors">
                            <MapPin className="h-4 w-4 text-slate-500 group-hover:text-blue-600" />
                          </div>
                          <span className="font-bold text-slate-900">
                            {hub.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <CanvaBadge className="bg-blue-50 text-blue-700 border-blue-100 font-mono">
                          {hub.applicants}
                        </CanvaBadge>
                      </TableCell>
                      <TableCell className="text-center">
                        <CanvaBadge className="bg-emerald-50 text-emerald-700 border-emerald-100 font-mono">
                          {hub.ambassadors}
                        </CanvaBadge>
                      </TableCell>
                      <TableCell className="text-center font-bold text-emerald-600 text-xs">
                        {hub.growth}
                      </TableCell>
                      <TableCell className="text-right pr-8">
                        <CanvaButton
                          variant="ghost"
                          size="sm"
                          className="hover:bg-slate-100 text-slate-400 hover:text-slate-900"
                        >
                          Detayları Gör{' '}
                          <ChevronRight className="ml-1 h-3 w-3" />
                        </CanvaButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CanvaCardBody>
          </CanvaCard>
        </TabsContent>

        <TabsContent value="applications" className="space-y-4">
          <div className="grid gap-4">
            {applications.map((app) => (
              <CanvaCard
                key={app.id}
                className="border-slate-200 shadow-sm border-l-4 border-l-blue-600"
              >
                <CanvaCardBody className="p-6">
                  <div className="flex items-center justify-between">
                    {/* Aday Bilgileri */}
                    <div className="flex items-center gap-4">
                      <Avatar className="h-14 w-14 border border-slate-200 shadow-inner">
                        <AvatarImage src={app.avatar} />
                        <AvatarFallback>{app.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-lg text-slate-900 leading-tight">
                            {app.name}
                          </p>
                          <a
                            href={app.social_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-400 hover:text-pink-600 transition-colors"
                          >
                            <Instagram className="h-4 w-4" />
                          </a>
                        </div>
                        <p className="text-xs font-medium text-slate-500">
                          {app.username} • {app.platform}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-tighter italic">
                          Başvuru Tarihi: {app.applied_at}
                        </p>
                      </div>
                    </div>

                    {/* Değerlendirme Metrikleri */}
                    <div className="flex items-center gap-12">
                      <div className="text-center border-r pr-8 border-slate-100">
                        <p className="text-lg font-bold text-slate-900">
                          {formatNumber(app.followers)}
                        </p>
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                          Takipçi
                        </p>
                      </div>

                      <div className="flex flex-col items-center border-r pr-8 border-slate-100">
                        <p className="text-[10px] text-slate-400 uppercase font-bold mb-2 tracking-widest">
                          Ekip Oylaması
                        </p>
                        <div className="flex gap-4 font-mono">
                          <div className="flex items-center gap-1.5 text-emerald-700 font-black bg-emerald-50 px-2.5 py-1 rounded-lg text-xs">
                            <ThumbsUp className="h-3.5 w-3.5" />{' '}
                            {app.votes.approve}
                          </div>
                          <div className="flex items-center gap-1.5 text-rose-700 font-black bg-rose-50 px-2.5 py-1 rounded-lg text-xs">
                            <ThumbsDown className="h-3.5 w-3.5" />{' '}
                            {app.votes.reject}
                          </div>
                        </div>
                      </div>

                      {/* Aksiyon Grubu */}
                      <div className="flex gap-2">
                        <CanvaButton
                          variant="ghost"
                          className="text-slate-700 border border-slate-200 hover:bg-slate-50"
                          onClick={() => setSelectedApp(app)}
                        >
                          <ClipboardList className="mr-2 h-4 w-4" />
                          Profili İncele
                        </CanvaButton>
                        <CanvaButton
                          variant="primary"
                          className="bg-slate-900 text-white font-bold px-6"
                        >
                          Elçi Olarak Ata
                        </CanvaButton>
                      </div>
                    </div>
                  </div>
                </CanvaCardBody>
              </CanvaCard>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="creators" className="space-y-4">
          <div className="flex items-center justify-center p-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <div className="text-center">
              <Users className="mx-auto h-12 w-12 text-slate-300" />
              <h3 className="mt-2 text-sm font-semibold text-slate-900">
                Elçi Listesi
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Aktif elçiler yakında burada listelenecek.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Detaylı İnceleme ve Not Modalı */}
      <Dialog open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
        <DialogContent className="sm:max-w-[550px] border-slate-200 rounded-[2.5rem]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-black text-slate-900 uppercase">
              <ClipboardList className="h-5 w-5 text-blue-700" />
              Başvuru Analizi
            </DialogTitle>
            <DialogDescription className="text-slate-500 font-medium italic">
              {selectedApp?.name} için profil uygunluğu ve içerik kalitesi
              notlarını ekleyin.
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Takipçi Kitlesi
                </p>
                <p className="text-lg font-bold text-slate-900">
                  {formatNumber(selectedApp?.followers || 0)}
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col justify-center">
                <a
                  href={selectedApp?.social_link}
                  target="_blank"
                  className="flex items-center justify-between text-blue-700 font-bold text-sm hover:underline"
                >
                  Sosyal Medya Profili <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black text-slate-700 uppercase tracking-tighter ml-1">
                Değerlendirme Notu
              </label>
              <Textarea
                placeholder="Örn: İçerik estetiği projemize %100 uyumlu, etkileşim oranları stabil..."
                className="min-h-[140px] rounded-2xl border-slate-200 focus:ring-slate-900 resize-none p-4"
                value={evaluationNote}
                onChange={(e) => setEvaluationNote(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="flex gap-3 mt-4">
            <CanvaButton
              variant="ghost"
              className="flex-1 font-bold text-slate-500"
              onClick={() => setSelectedApp(null)}
            >
              Vazgeç
            </CanvaButton>
            <CanvaButton
              variant="primary"
              className="flex-1 bg-slate-900 text-white font-bold"
              onClick={() => {
                // Not kaydetme servisi buraya bağlanacak
                setSelectedApp(null);
                setEvaluationNote('');
              }}
            >
              <Send className="mr-2 h-4 w-4" />
              Notu Kaydet ve Kapat
            </CanvaButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
