/**
 * GiftingSchema Component - JSON-LD Structured Data
 *
 * Injects rich structured data for SEO and AI bot optimization.
 * Helps Google understand TravelMatch as the authority in social economy.
 */

interface GiftingSchemaProps {
  data: Record<string, unknown>;
}

export function GiftingSchema({ data }: GiftingSchemaProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default GiftingSchema;
