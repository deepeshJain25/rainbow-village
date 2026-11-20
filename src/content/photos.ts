// The centre's photos, by file name in src/assets/photos. Every photo there was re-saved at web size with its
// metadata (location, date, device) removed. Photos that show children only go in once a parent has consented.
import type { ImageMetadata } from 'astro';

const files = import.meta.glob<ImageMetadata>('../assets/photos/*.jpg', { eager: true, import: 'default' });

export const photos: Record<string, ImageMetadata> = Object.fromEntries(
  Object.entries(files).map(([file, image]) => [file.split('/').pop()!.replace(/\.jpg$/, ''), image]),
);

// alt text for each photo: what is in it, for people who can't see it
export const alts: Record<string, string> = {
  'preschool-room': 'The preschool room, with tables, a mat area and children’s art along the walls',
  'preschool-tables': 'A preschool table set for an activity, beside shelves of toys',
  'toddlers-room': 'The toddlers room, with a flower-puzzle table and toy shelves',
  'toddlers-our-family-wall': 'The "Our Family" wall in the toddlers room, beside a play kitchen',
  'toddlers-tv-corner': 'A corner of the toddlers room with toy shelves and the "Our Family" wall',
  'toddlers-tea-party': 'A small blue table set for a pretend tea party',
  'toddlers-soft-toys': 'A long shelf of soft toys under the toddlers room windows',
  'toddlers-art-wall': 'The Kids Art Wall, covered in children’s paintings',
  'toddlers-art-door': 'Children’s tree paintings and an alphabet chart by the toddlers room door',
  'toddlers-activity-tables': 'Toddler tables set out with activities, beside a play kitchen',
  'toddlers-book-corner': 'A cosy book corner with a beanbag and picture books',
  'toddlers-building-blocks': 'Building blocks laid out on a toddler table',
  'toddlers-sunflower-corner': 'A sunflower on the wall above shelves of toys by the window',
  'babies-room': 'The babies room, with soft floor cushions, a small table and doors to the yard',
  'babies-quiet-corner': 'A quiet corner in the babies room with a soft mat, puppets and books',
  'babies-puppets': 'Puppets, cushions and books on a soft mat in the babies room',
  'babies-rug': 'A round rug with a bird and crocodile picture in the babies room',
  'babies-sleep-room': 'Two cots in the babies sleep room, with ducks painted on the wall',
  'babies-cots': 'Cots by the window in the babies sleep room',
  'babies-play-kitchen': 'A wooden play kitchen and washing machine, with art on the wall above',
  'outdoor-sandpit': 'The shaded sandpit, with buckets and spades',
  'outdoor-climbing-frame': 'A climbing frame and balance beams in the outdoor play area',
  'outdoor-playhouse-slide': 'A playhouse with two slides in the outdoor play area',
  'outdoor-cubby': 'A blue cubby house in the outdoor play area',
  'entrance-street-library': 'The little street library and Rainbow Village sign at the front gate',
  'entrance-sign': 'The Rainbow Village sign at the front gate',
  'rainbow-wall': 'A rainbow-striped wall above a table with small blue chairs',
  'art-work-wall': 'A wall of children’s art work',
};
