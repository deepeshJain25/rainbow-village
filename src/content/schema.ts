// Structured data for the centre, from its Google Business Profile. Price range and sameAs links
// are added once the centre confirms them, and the site URL once the domain is live.
import site from './site.json';

export const childCare = {
  '@context': 'https://schema.org',
  '@type': 'ChildCare',
  name: site.tradingName,
  legalName: site.legalName,
  email: site.email,
  telephone: '+61 2 9637 4433',
  foundingDate: '2007',
  hasMap: site.mapUrl,
  address: {
    '@type': 'PostalAddress',
    streetAddress: '42 Weston St',
    addressLocality: 'Harris Park',
    addressRegion: 'NSW',
    postalCode: '2150',
    addressCountry: 'AU',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: -33.8227801,
    longitude: 151.0169257,
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '07:00',
      closes: '18:00',
    },
  ],
};
