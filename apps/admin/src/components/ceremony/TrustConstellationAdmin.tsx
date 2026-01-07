'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { getClient } from '@/lib/supabase';

interface TrustDistribution {
  range: string;
  count: number;
}

export function TrustConstellationAdmin() {
  const { data: distribution } = useQuery({
    queryKey: ['trust-distribution'],
    queryFn: async (): Promise<TrustDistribution[]> => {
      const supabase = getClient();
      const { data } = await supabase.rpc('get_trust_score_distribution');
      return data || [];
    },
  });

  const milestoneStats = [
    {
      id: 'email',
      label: 'Email Dogrulama',
      percentage: 95,
      color: 'bg-blue-500',
    },
    {
      id: 'phone',
      label: 'Telefon Dogrulama',
      percentage: 78,
      color: 'bg-green-500',
    },
    { id: 'id', label: 'Kimlik Onayi', percentage: 45, color: 'bg-amber-500' },
    {
      id: 'bank',
      label: 'Banka Baglantisi',
      percentage: 32,
      color: 'bg-purple-500',
    },
    {
      id: 'firstGift',
      label: 'Ilk Hediye',
      percentage: 28,
      color: 'bg-pink-500',
    },
    {
      id: 'firstProof',
      label: 'Ilk Kanit',
      percentage: 22,
      color: 'bg-teal-500',
    },
  ];

  const tiers = [
    { range: '0-30', label: 'Yeni', color: 'bg-red-500' },
    { range: '31-60', label: 'Gelisen', color: 'bg-amber-500' },
    { range: '61-85', label: 'Guvenilir', color: 'bg-emerald-500' },
    { range: '86-100', label: 'Platinum', color: 'bg-yellow-400' },
  ];

  const totalCount = distribution?.reduce((a, b) => a + b.count, 0) || 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Trust Score Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Trust Score Dagilimi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tiers.map((tier) => {
              const count =
                distribution?.find((d) => d.range === tier.range)?.count || 0;
              const percentage =
                totalCount > 0 ? (count / totalCount) * 100 : 0;

              return (
                <div key={tier.range}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>
                      {tier.label} ({tier.range})
                    </span>
                    <span className="font-medium">{count} kullanici</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${tier.color} transition-all`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Milestone Completion Rates */}
      <Card>
        <CardHeader>
          <CardTitle>Milestone Tamamlama Oranlari</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {milestoneStats.map((milestone) => (
              <div key={milestone.id}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{milestone.label}</span>
                  <span className="font-medium">{milestone.percentage}%</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${milestone.color} transition-all`}
                    style={{ width: `${milestone.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Constellation Visual Preview */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Constellation Onizleme</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <div className="relative w-64 h-64">
            {/* SVG Constellation visualization */}
            <svg viewBox="0 0 200 200" className="w-full h-full">
              {/* Connection lines */}
              <line
                x1="100"
                y1="20"
                x2="50"
                y2="70"
                stroke="#E5E7EB"
                strokeWidth="1"
              />
              <line
                x1="100"
                y1="20"
                x2="150"
                y2="70"
                stroke="#E5E7EB"
                strokeWidth="1"
              />
              <line
                x1="50"
                y1="70"
                x2="100"
                y2="100"
                stroke="#E5E7EB"
                strokeWidth="1"
              />
              <line
                x1="150"
                y1="70"
                x2="100"
                y2="100"
                stroke="#E5E7EB"
                strokeWidth="1"
              />
              <line
                x1="100"
                y1="100"
                x2="60"
                y2="150"
                stroke="#E5E7EB"
                strokeWidth="1"
              />
              <line
                x1="100"
                y1="100"
                x2="100"
                y2="150"
                stroke="#E5E7EB"
                strokeWidth="1"
              />
              <line
                x1="100"
                y1="100"
                x2="140"
                y2="150"
                stroke="#E5E7EB"
                strokeWidth="1"
              />
              {/* Stars */}
              <circle cx="100" cy="20" r="8" fill="#3B82F6" /> {/* Email */}
              <circle cx="50" cy="70" r="8" fill="#10B981" /> {/* Phone */}
              <circle cx="150" cy="70" r="8" fill="#F59E0B" /> {/* ID */}
              <circle cx="100" cy="100" r="10" fill="#8B5CF6" /> {/* Bank */}
              <circle cx="60" cy="150" r="6" fill="#EC4899" /> {/* Gift */}
              <circle cx="100" cy="150" r="6" fill="#14B8A6" /> {/* Proof */}
              <circle cx="140" cy="150" r="6" fill="#6B7280" />{' '}
              {/* Unverified */}
            </svg>

            {/* Labels */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 text-xs text-blue-500">
              Email
            </div>
            <div className="absolute top-16 left-4 text-xs text-emerald-500">
              Phone
            </div>
            <div className="absolute top-16 right-4 text-xs text-amber-500">
              ID
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
