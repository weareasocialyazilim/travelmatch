'use client';

import { useState } from 'react';
import {
  Building2,
  Users,
  DollarSign,
  TrendingUp,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Mail,
  Phone,
  Globe,
  CheckCircle,
  Clock,
  XCircle,
  Star,
  MapPin,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Mock partner data
const partnerStats = {
  total: 45,
  active: 38,
  pending: 5,
  total_revenue: 456780,
  avg_commission: 12.5,
};

const partners = [
  {
    id: '1',
    name: 'Hilton Hotels',
    logo: 'https://api.dicebear.com/7.x/initials/svg?seed=HH',
    type: 'hotel',
    tier: 'platinum',
    status: 'active',
    contact: 'partnership@hilton.com',
    phone: '+90 212 XXX XX XX',
    website: 'hilton.com',
    location: 'İstanbul, Türkiye',
    revenue: 125000,
    bookings: 456,
    commission: 15,
    rating: 4.8,
    since: '2023-06',
  },
  {
    id: '2',
    name: 'Turkish Airlines',
    logo: 'https://api.dicebear.com/7.x/initials/svg?seed=TK',
    type: 'airline',
    tier: 'gold',
    status: 'active',
    contact: 'b2b@thy.com',
    phone: '+90 212 XXX XX XX',
    website: 'turkishairlines.com',
    location: 'İstanbul, Türkiye',
    revenue: 89000,
    bookings: 234,
    commission: 10,
    rating: 4.6,
    since: '2023-09',
  },
  {
    id: '3',
    name: 'Booking.com',
    logo: 'https://api.dicebear.com/7.x/initials/svg?seed=BC',
    type: 'ota',
    tier: 'platinum',
    status: 'active',
    contact: 'affiliate@booking.com',
    phone: '+31 XXX XXX XXX',
    website: 'booking.com',
    location: 'Amsterdam, Hollanda',
    revenue: 178000,
    bookings: 892,
    commission: 12,
    rating: 4.7,
    since: '2023-03',
  },
  {
    id: '4',
    name: 'GetYourGuide',
    logo: 'https://api.dicebear.com/7.x/initials/svg?seed=GYG',
    type: 'experience',
    tier: 'silver',
    status: 'active',
    contact: 'partners@gyg.com',
    phone: '+49 XXX XXX XXX',
    website: 'getyourguide.com',
    location: 'Berlin, Almanya',
    revenue: 45000,
    bookings: 567,
    commission: 8,
    rating: 4.5,
    since: '2024-01',
  },
  {
    id: '5',
    name: 'Yeni Otel Zinciri',
    logo: 'https://api.dicebear.com/7.x/initials/svg?seed=YO',
    type: 'hotel',
    tier: 'bronze',
    status: 'pending',
    contact: 'info@yeniotel.com',
    phone: '+90 XXX XXX XX XX',
    website: 'yeniotel.com',
    location: 'Antalya, Türkiye',
    revenue: 0,
    bookings: 0,
    commission: 10,
    rating: 0,
    since: '2024-12',
  },
];

const partnerTiers = {
  platinum: { color: 'bg-purple-500', label: 'Platinum', minRevenue: 100000 },
  gold: { color: 'bg-yellow-500', label: 'Gold', minRevenue: 50000 },
  silver: { color: 'bg-gray-400', label: 'Silver', minRevenue: 20000 },
  bronze: { color: 'bg-amber-700', label: 'Bronze', minRevenue: 0 },
};

export default function PartnersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Aktif</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">Onay Bekliyor</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Pasif</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTierBadge = (tier: string) => {
    const config = partnerTiers[tier as keyof typeof partnerTiers];
    return <Badge className={`${config.color} text-white`}>{config.label}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const types: Record<string, string> = {
      hotel: 'Otel',
      airline: 'Havayolu',
      ota: 'OTA',
      experience: 'Deneyim',
      transfer: 'Transfer',
    };
    return <Badge variant="outline">{types[type] || type}</Badge>;
  };

  const filteredPartners = partners.filter((partner) => {
    if (typeFilter !== 'all' && partner.type !== typeFilter) return false;
    if (searchQuery && !partner.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Partner Portal</h1>
          <p className="text-muted-foreground">B2B iş ortaklıkları yönetimi</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Partner
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Toplam Partner</p>
                <p className="text-2xl font-bold">{partnerStats.total}</p>
              </div>
              <Building2 className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aktif</p>
                <p className="text-2xl font-bold text-green-600">{partnerStats.active}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Bekleyen</p>
                <p className="text-2xl font-bold text-yellow-600">{partnerStats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Toplam Gelir</p>
                <p className="text-2xl font-bold">
                  ₺{partnerStats.total_revenue.toLocaleString('tr-TR')}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ort. Komisyon</p>
                <p className="text-2xl font-bold">%{partnerStats.avg_commission}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">Tümü</TabsTrigger>
            <TabsTrigger value="active">Aktif</TabsTrigger>
            <TabsTrigger value="pending">Bekleyen</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Partner ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Tür" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Türler</SelectItem>
                <SelectItem value="hotel">Otel</SelectItem>
                <SelectItem value="airline">Havayolu</SelectItem>
                <SelectItem value="ota">OTA</SelectItem>
                <SelectItem value="experience">Deneyim</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {filteredPartners.map((partner) => (
              <Card key={partner.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-14 w-14">
                        <AvatarImage src={partner.logo} />
                        <AvatarFallback>{partner.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-lg">{partner.name}</h3>
                          {partner.rating > 0 && (
                            <span className="flex items-center gap-1 text-sm">
                              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                              {partner.rating}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {getStatusBadge(partner.status)}
                          {getTierBadge(partner.tier)}
                          {getTypeBadge(partner.type)}
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          Detaylar
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Düzenle
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FileText className="mr-2 h-4 w-4" />
                          Sözleşme
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="mr-2 h-4 w-4" />
                          E-posta Gönder
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Contact Info */}
                  <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {partner.location}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Globe className="h-4 w-4" />
                      {partner.website}
                    </div>
                  </div>

                  {/* Stats */}
                  {partner.status === 'active' && (
                    <div className="mt-4 grid grid-cols-3 gap-4 border-t pt-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold">
                          ₺{(partner.revenue / 1000).toFixed(0)}K
                        </p>
                        <p className="text-xs text-muted-foreground">Gelir</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">{partner.bookings}</p>
                        <p className="text-xs text-muted-foreground">Rezervasyon</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">%{partner.commission}</p>
                        <p className="text-xs text-muted-foreground">Komisyon</p>
                      </div>
                    </div>
                  )}

                  {partner.status === 'pending' && (
                    <div className="mt-4 flex gap-2 border-t pt-4">
                      <Button size="sm" className="flex-1">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Onayla
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <XCircle className="mr-2 h-4 w-4" />
                        Reddet
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="active">
          <p className="text-muted-foreground">Aktif partnerler burada listelenecek.</p>
        </TabsContent>
        <TabsContent value="pending">
          <p className="text-muted-foreground">Onay bekleyen partnerler burada listelenecek.</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
