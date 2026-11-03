// Structured data for the centre. The site URL is added at launch, once the domain is live.
import site from './site.json';

export const childCare = {
  '@context': 'https://schema.org',
  '@type': 'ChildCare',
  name: site.legalName,
  telephone: '+61296374433',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '42 Weston Street',
    addressLocality: 'Harris Park',
    addressRegion: 'NSW',
    postalCode: '2150',
    addressCountry: 'AU',
  },
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    opens: '07:00',
    closes: '18:00',
  },
};
