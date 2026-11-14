export interface PlanetData {
  id: string;
  name: string;
  description: string;
  radius: string;
  distanceFromSun: string;
  orbitalSpeed: string;
  textureUrl?: string;
  color?: string;
  moons: number;
  atmosphere: string;
  funFact: string;
  size: number;
  orbitRadius: number;
  orbitSpeedScale: number;
  resourceUrl?: string;
  type: 'star' | 'planet' | 'moon';
}

export const celestialBodies: Record<string, PlanetData> = {
  sun: {
    id: 'sun',
    name: 'Sun',
    description: 'The Sun is a yellow dwarf star at the center of our solar system. It contains 99.8% of the mass in the entire solar system.',
    radius: '432,690 miles (696,340 km)',
    distanceFromSun: '0 miles (0 km)',
    orbitalSpeed: '0',
    color: '#FDB813',
    moons: 0,
    atmosphere: 'Hydrogen, Helium',
    funFact: 'One million Earths could fit inside the Sun!',
    size: 5,
    orbitRadius: 0,
    orbitSpeedScale: 0,
    type: 'star',
    resourceUrl: ''
  },
  mercury: {
    id: 'mercury',
    name: 'Mercury',
    description: 'Mercury is the smallest planet in our solar system and the closest to the Sun. It is only slightly larger than Earth\'s Moon.',
    radius: '1,516 miles (2,440 km)',
    distanceFromSun: '36 million miles (58 million km)',
    orbitalSpeed: '29 miles/sec (47 km/sec)',
    color: '#8c8c94',
    moons: 0,
    atmosphere: 'Thin exosphere',
    funFact: 'A year on Mercury takes just 88 Earth days, but a single day lasts 59 Earth days!',
    size: 0.8,
    orbitRadius: 8,
    orbitSpeedScale: 4.1,
    type: 'planet',
    resourceUrl: ''
  },
  venus: {
    id: 'venus',
    name: 'Venus',
    description: 'Venus is the second planet from the Sun and Earth\'s closest planetary neighbor. It\'s the hottest planet in our solar system.',
    radius: '3,760 miles (6,051 km)',
    distanceFromSun: '67 million miles (108 million km)',
    orbitalSpeed: '21.7 miles/sec (35 km/sec)',
    color: '#e3bb76',
    moons: 0,
    atmosphere: 'Thick, toxic (carbon dioxide)',
    funFact: 'Venus spins backward compared to most other planets. This means the sun rises in the west and sets in the east.',
    size: 1.5,
    orbitRadius: 12,
    orbitSpeedScale: 1.6,
    type: 'planet',
    resourceUrl: ''
  },
  earth: {
    id: 'earth',
    name: 'Earth',
    description: 'Earth is the third planet from the Sun and the only known world with liquid water and life.',
    radius: '3,959 miles (6,371 km)',
    distanceFromSun: '93 million miles (150 million km)',
    orbitalSpeed: '18.5 miles/sec (29.8 km/sec)',
    textureUrl: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg',
    color: '#2b82c9',
    moons: 1,
    atmosphere: '78% Nitrogen, 21% Oxygen',
    funFact: 'Earth is the only planet not named after a Greek or Roman deity!',
    size: 1.6,
    orbitRadius: 16,
    orbitSpeedScale: 1,
    type: 'planet',
    resourceUrl: ''
  },
  moon: {
    id: 'moon',
    name: 'Moon',
    description: 'The Moon is Earth\'s only natural satellite. It is the fifth largest satellite in the Solar System.',
    radius: '1,079 miles (1,737 km)',
    distanceFromSun: '93 million miles (150 million km)',
    orbitalSpeed: '0.6 miles/sec (1 km/sec)',
    textureUrl: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/moon_1024.jpg',
    color: '#c2c2c2',
    moons: 0,
    atmosphere: 'Very thin exosphere',
    funFact: 'We always see the same side of the moon because it rotates at the exact same rate it orbits Earth.',
    size: 0.5,
    orbitRadius: 2.5, // relative to earth
    orbitSpeedScale: 5,
    type: 'moon',
    resourceUrl: ''
  },
  mars: {
    id: 'mars',
    name: 'Mars',
    description: 'Mars is the fourth planet from the Sun, a dusty, cold, desert world with a very thin atmosphere.',
    radius: '2,106 miles (3,389 km)',
    distanceFromSun: '142 million miles (228 million km)',
    orbitalSpeed: '14.9 miles/sec (24.1 km/sec)',
    color: '#c1440e',
    moons: 2,
    atmosphere: 'Carbon dioxide, Nitrogen, Argon',
    funFact: 'Mars is home to the tallest mountain in the solar system, Olympus Mons, which is 3 times taller than Mt. Everest!',
    size: 1.2,
    orbitRadius: 22,
    orbitSpeedScale: 0.5,
    type: 'planet',
    resourceUrl: ''
  },
  jupiter: {
    id: 'jupiter',
    name: 'Jupiter',
    description: 'Jupiter is the fifth planet from the Sun and the largest in the solar system. It is a gas giant.',
    radius: '43,440 miles (69,911 km)',
    distanceFromSun: '483 million miles (778 million km)',
    orbitalSpeed: '8.1 miles/sec (13.1 km/sec)',
    color: '#d39c7e',
    moons: 79,
    atmosphere: 'Hydrogen, Helium',
    funFact: 'Jupiter\'s Great Red Spot is a giant storm that is about twice the size of Earth and has raged for over a century.',
    size: 3.5,
    orbitRadius: 30,
    orbitSpeedScale: 0.1,
    type: 'planet',
    resourceUrl: ''
  },
  saturn: {
    id: 'saturn',
    name: 'Saturn',
    description: 'Saturn is the sixth planet from the Sun and the second-largest planet in our solar system.',
    radius: '36,183 miles (58,232 km)',
    distanceFromSun: '886 million miles (1.4 billion km)',
    orbitalSpeed: '6.0 miles/sec (9.7 km/sec)',
    color: '#ead6b8',
    moons: 82,
    atmosphere: 'Hydrogen, Helium',
    funFact: 'Saturn is the only planet in our solar system that is less dense than water. It could float in a giant bathtub!',
    size: 3,
    orbitRadius: 40,
    orbitSpeedScale: 0.03,
    type: 'planet',
    resourceUrl: ''
  },
  uranus: {
    id: 'uranus',
    name: 'Uranus',
    description: 'Uranus is the seventh planet from the Sun. It is an ice giant.',
    radius: '15,759 miles (25,362 km)',
    distanceFromSun: '1.8 billion miles (2.9 billion km)',
    orbitalSpeed: '4.2 miles/sec (6.8 km/sec)',
    color: '#4b70dd',
    moons: 27,
    atmosphere: 'Hydrogen, Helium, Methane',
    funFact: 'Uranus rotates on its side, meaning its equator is nearly at a right angle to its orbit!',
    size: 2.2,
    orbitRadius: 50,  
    orbitSpeedScale: 0.01,
    type: 'planet',
    resourceUrl: ''
  },
  neptune: {
    id: 'neptune',
    name: 'Neptune',
    description: 'Neptune is the eighth and most distant major planet orbiting our Sun. It is dark, cold and whipped by supersonic winds.',
    radius: '15,299 miles (24,622 km)',
    distanceFromSun: '2.8 billion miles (4.5 billion km)',
    orbitalSpeed: '3.3 miles/sec (5.4 km/sec)',
    color: '#274687',
    moons: 14,
    atmosphere: 'Hydrogen, Helium, Methane',
    funFact: 'Neptune was the first planet located through mathematical calculations rather than through regular observations of the sky.',
    size: 2.1,
    orbitRadius: 60,
    orbitSpeedScale: 0.005,
    type: 'planet',
    resourceUrl: ''
  }
};
