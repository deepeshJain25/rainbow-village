// Structured data for the centre. Phone, street address, hours, geo, price range and sameAs links
// are added once the centre confirms them, and the site URL once the domain is live.
import site from './site.json';

export const childCare = {
  '@context': 'https://schema.org',
  '@type': 'ChildCare',
  name: site.tradingName,
  legalName: site.legalName,
  email: site.email,
  foundingDate: '2007',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Harris Park',
    addressRegion: 'NSW',
    postalCode: '2150',
    addressCountry: 'AU',
  },
};
