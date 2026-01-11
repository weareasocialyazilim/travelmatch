export function GiftingSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'TravelMatch',
    description:
      'Gift moments, not things. Send someone you love an experience to live.',
    url: 'https://travelmatch.app',
    applicationCategory: 'LifestyleApplication',
    operatingSystem: ['iOS', 'Android'],
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      ratingCount: '10000',
      bestRating: '5',
      worstRating: '1',
    },
    featureList: [
      'Gift experiences and moments',
      'Send coffee, dinner, and adventures',
      'Real-time moment sharing',
      'Available in 50+ cities',
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
