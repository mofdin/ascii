type Map = string[][]

type Biom = {
  text: string
  enemy: boolean
}

type Biomes = {
  [key: string]: Biom
}

export const map: Map = [
  // x = 0, x = 1, x = 2, x = 3, x = 4, x = 5, x = 6
  ['plains', 'plains', 'plains', 'plains', 'forest', 'mountain', 'cave'], // y = 0
  ['forest', 'forest', 'forest', 'forest', 'forest', 'hills', 'mountain'], // y = 1
  ['forest', 'fields', 'bridge', 'plains', 'hills', 'forest', 'hills'], // y = 2
  ['plains', 'shop', 'town', 'major', 'plains', 'hills', 'mountain'], // y = 3
  ['plains', 'fields', 'fields', 'plains', 'hills', 'mountain', 'mountain'], // y = 4
]

export const biom: Biomes = {
  plains: {
    text: 'PLAINS',
    enemy: true,
  },
  forest: {
    text: 'WOODS',
    enemy: true,
  },
  fields: {
    text: 'FIELDS',
    enemy: false,
  },
  bridge: {
    text: 'BRIDGE',
    enemy: true,
  },
  town: {
    text: 'TOWN CENTER',
    enemy: false,
  },
  shop: {
    text: 'SHOP',
    enemy: false,
  },
  major: {
    text: 'MAJOR',
    enemy: false,
  },
  cave: {
    text: 'CAVE',
    enemy: false,
  },
  mountain: {
    text: 'MOUNTAIN',
    enemy: true,
  },
  hills: {
    text: 'HILLS',
    enemy: true,
  },
}
