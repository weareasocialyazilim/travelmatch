'use client';

interface TrustRingProps {
  score: number;
  size?: number;
  showLabel?: boolean;
}

export function TrustRing({ score, size = 160, showLabel = true }: TrustRingProps) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  // Determine tier based on score
  const tier =
    score >= 90
      ? 'platinum'
      : score >= 70
        ? 'gold'
        : score >= 50
          ? 'silver'
          : 'bronze';

  const tierColors = {
    platinum: { from: '#E5E7EB', to: '#9CA3AF' },
    gold: { from: '#F59E0B', to: '#D97706' },
    silver: { from: '#9CA3AF', to: '#6B7280' },
    bronze: { from: '#92400E', to: '#78350F' },
  };

  const gradientId = `trustGrad-${tier}-${size}`;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="absolute inset-0 -rotate-90" width={size} height={size}>
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={tierColors[tier].from} />
            <stop offset="100%" stopColor={tierColors[tier].to} />
          </linearGradient>
        </defs>

        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={6}
          className="text-white/20"
        />

        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          className="transition-all duration-1000 ease-out"
        />
      </svg>

      {/* Center content */}
      {showLabel && (
        <div className="absolute inset-4 rounded-full bg-white/10 backdrop-blur-sm flex flex-col items-center justify-center">
          <span className="text-5xl font-extrabold tabular-nums">{score}</span>
          <span className="text-sm text-white/60 uppercase tracking-wide">
            {tier}
          </span>
        </div>
      )}
    </div>
  );
}
