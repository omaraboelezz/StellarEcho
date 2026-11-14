// src/data/landmarks.ts
//
// Every landmark = one piece of historic space exploration equipment placed on its
// verified celestial body (`bodyId` matching `src/data/planets.ts`) at its historical
// landing or operational coordinates, using the 3D models in `/public/models/`.

export type EquipmentKind =
  | 'rover'
  | 'lander'
  | 'helicopter'
  | 'orbiter'
  | 'telescope'
  | 'wreck'
  | 'probe';

export interface Shot {
  at: number;
  dist: number;
  el: number;
  az: number;
  lift: number;
  fov: number;
}

export interface LandmarkStory {
  mission: string; // 1. What it was and what its mission was
  why: string; // 2. Why it was sent to this location
  events: string; // 3. What happened during the mission
  fate: string; // 4. Why it was abandoned / lost / stopped
  science: string; // 5. Discoveries and contributions
  facts: string[]; // 6. Interesting facts for students
}

export interface Landmark {
  id: string;
  bodyId: string;
  name: string;
  missionName: string;
  agency: string;
  years: string;
  landingDate: string;
  landingSite: string;
  shortDescription: string;
  status: string;
  lat: number;
  lon: number; // -180..180 (east positive)
  /** Narration file. Put it in /public/audio/narration/ or import it and pass the URL. */
  audioUrl: string;
  /** Used for the camera timeline when the audio file is missing or can't play. Seconds. */
  fallbackDuration: number;
  kind: EquipmentKind;
  /** .glb in /public/models/. Normalized ~1 unit across, Y-up, origin at the base (min.y = 0). */
  modelUrl?: string;
  /** Equipment length as a fraction of the planet radius (exaggerated so it is visible). */
  modelScale: number;
  color?: string;
  story: LandmarkStory;
  /** Override the default camera choreography. */
  shots?: Shot[];
  /** Override when each chapter caption appears (6 values, fractions of the narration). */
  chapterAt?: number[];
}

/** Default choreography: orbital approach -> descent -> low fly-over -> ground-level orbit -> close-up -> pull-back. */
export const DEFAULT_SHOTS: Shot[] = [
  { at: 0.0, dist: 7.0, el: 15, az: 0, lift: 0.0, fov: 45 },
  { at: 0.12, dist: 2.2, el: 40, az: -40, lift: 0.02, fov: 42 },
  { at: 0.3, dist: 0.35, el: 62, az: 20, lift: 0.01, fov: 38 },
  { at: 0.5, dist: 0.12, el: 80, az: 120, lift: 0.004, fov: 35 },
  { at: 0.7, dist: 0.09, el: 72, az: 220, lift: 0.004, fov: 32 },
  { at: 0.88, dist: 0.3, el: 50, az: 300, lift: 0.02, fov: 40 },
  { at: 1.0, dist: 3.5, el: 20, az: 340, lift: 0.0, fov: 45 },
];

export interface Chapter {
  at: number;
  title: string;
  caption: string;
}

export function getChapters(l: Landmark): Chapter[] {
  const at = l.chapterAt ?? [0, 0.14, 0.32, 0.5, 0.68, 0.84];
  const s = l.story;
  return [
    { at: at[0], title: 'The mission', caption: s.mission },
    { at: at[1], title: 'Why here?', caption: s.why },
    { at: at[2], title: 'What happened', caption: s.events },
    { at: at[3], title: 'The end', caption: s.fate },
    { at: at[4], title: 'What it taught us', caption: s.science },
    { at: at[5], title: 'Did you know?', caption: s.facts[0] ?? '' },
  ];
}

export const landmarks: Landmark[] = [
  // ───────────────────────── THE MOON ─────────────────────────
  // Strictly the 4 verified lunar equipment categories:
  // 1. Apollo Lunar Modules
  // 2. Lunar Roving Vehicles (LRVs)
  // 3. ALSEP Scientific Packages
  // 4. Surveyor Landers
  {
    id: 'apollo11',
    bodyId: 'moon',
    name: 'Apollo Lunar Modules (Apollo 11 Eagle)',
    missionName: 'NASA Apollo 11–17 Lunar Module Descent Stages',
    agency: 'NASA',
    years: '1969 – 1972',
    landingDate: 'July 20, 1969 (Apollo 11 Touchdown)',
    landingSite: 'Mare Tranquillitatis / Sea of Tranquility (0.67°N, 23.47°E)',
    shortDescription:
      'Historic touchdown site where Neil Armstrong and Buzz Aldrin became the first humans to walk on the Moon. The Eagle descent stage and five other Apollo Lunar Module descent stages remain permanently on the lunar surface.',
    status: 'Historic descent stages resting on the Moon',
    lat: 0.67,
    lon: 23.47,
    audioUrl: '/audio/apollo11.mp3',
    fallbackDuration: 90,
    kind: 'lander',
    modelUrl: '/models/lunar_lander_3d_model.glb',
    modelScale: 0.048,
    color: '#d4af37',
    story: {
      mission:
        'Apollo 11 carried the first humans to land on another world. The Lunar Module Eagle took Neil Armstrong and Buzz Aldrin to the surface, followed by five more successful Apollo Lunar Module landings through 1972.',
      why: 'The Sea of Tranquility is a smooth, flat basalt plain chosen so the first crewed lunar landing would be as safe as possible.',
      events:
        'Eagle touched down on 20 July 1969. The astronauts spent about two and a half hours outside, collecting around 21.5 kilograms of rock and setting up scientific experiments.',
      fate: 'To lift off with the lunar samples, the crew launched in the upper ascent stage and left the lower descent stage of Eagle, tools, a flag, and a commemorative plaque behind at Tranquility Base.',
      science:
        'Returned Apollo rocks revealed the Moon\u2019s age and volcanic history, and a laser retroreflector left on the surface is still used today to measure the Earth\u2013Moon distance.',
      facts: [
        'Measurements with the Apollo laser reflectors show the Moon is drifting away from Earth by about 3.8 centimetres each year.',
        'Armstrong\u2019s boot prints and the six Apollo descent stages can last for millions of years because the Moon has no wind or rain to erase them.',
      ],
    },
  },
  {
    id: 'lrv',
    bodyId: 'moon',
    name: 'Lunar Roving Vehicles (LRVs)',
    missionName: 'NASA Apollo 15, 16 & 17 Crewed Electric Lunar Rovers',
    agency: 'NASA / Boeing / GM',
    years: '1971 – 1972',
    landingDate: 'July 30, 1971 (Apollo 15 LRV-1 First Drive)',
    landingSite: 'Hadley–Apennine, Descartes Highlands & Taurus–Littrow (26.13°N, 3.63°E)',
    shortDescription:
      'Battery-powered, four-wheel-drive electric vehicles folded inside the Apollo Lunar Module that enabled astronauts on Apollo 15, 16, and 17 to explore tens of kilometres across the lunar highlands and rilles.',
    status: 'Three rovers parked permanently on the Moon',
    lat: 26.13,
    lon: 3.63,
    audioUrl: '/audio/narration/lrv.mp3',
    fallbackDuration: 85,
    kind: 'rover',
    modelUrl: '/models/lunar rover 3d model.glb',
    modelScale: 0.045,
    color: '#e2e8f0',
    story: {
      mission:
        'The Lunar Roving Vehicle (LRV)—affectionately nicknamed the "Moon Buggy"—was a lightweight electric vehicle built so Apollo astronauts could travel far beyond walking distance from their lander.',
      why: 'First deployed at Hadley–Apennine on Apollo 15, the LRV allowed astronauts to climb mountain foothills, inspect the deep Hadley Rille canyon, and sample diverse geological units.',
      events:
        'Three LRVs were driven on the Moon during Apollo 15 (27.8 km), Apollo 16 (26.6 km), and Apollo 17 (35.9 km), powered by two non-rechargeable silver-zinc batteries and riding on woven piano-wire mesh wheels.',
      fate: 'At the end of each mission, astronauts parked the LRV a short distance from the Lunar Module so its remotely controlled television camera could broadcast the liftoff back to Earth. All three rovers remain on the Moon.',
      science:
        'By vastly expanding the astronauts\u2019 exploration radius, the LRVs enabled the discovery of the ancient "Genesis Rock" on Apollo 15 and volcanic orange glass soil at Shorty Crater on Apollo 17.',
      facts: [
        'Each Lunar Roving Vehicle weighed only 210 kilograms on Earth (about 35 kilograms in lunar gravity) yet could carry more than twice its own weight in astronauts, gear, and moon rocks.',
        'Eugene Cernan set the official lunar land-speed record of 18 km/h (11.2 mph) driving the Apollo 17 LRV across the Taurus–Littrow valley.',
      ],
    },
  },
  {
    id: 'alsep',
    bodyId: 'moon',
    name: 'ALSEP Scientific Packages',
    missionName: 'NASA Apollo Lunar Surface Experiments Package (Apollo 12–17)',
    agency: 'NASA',
    years: '1969 – 1977',
    landingDate: 'November 19, 1969 (Apollo 12 First Full ALSEP Station)',
    landingSite: 'Fra Mauro Highlands & Oceanus Procellarum (3.65°S, 17.47°W)',
    shortDescription:
      'Nuclear-powered geophysical observatory stations deployed by Apollo astronauts on the Moon to continuously measure moonquakes, heat flow, solar wind, and the lunar exosphere for nearly eight years.',
    status: 'Decommissioned September 30, 1977; instruments remain on surface',
    lat: -3.65,
    lon: -17.47,
    audioUrl: '/audio/narration/alsep.mp3',
    fallbackDuration: 85,
    kind: 'probe',
    modelUrl: '/models/satellite 3d model.glb',
    modelScale: 0.042,
    color: '#60a5fa',
    story: {
      mission:
        'The Apollo Lunar Surface Experiments Package (ALSEP) was a network of autonomous scientific stations deployed by astronauts on Apollo 12, 14, 15, 16, and 17 (following the early EASEP package on Apollo 11) to monitor the Moon long after the crews returned home.',
      why: 'Placed across diverse regions—from Oceanus Procellarum and Fra Mauro to Hadley–Apennine and Taurus–Littrow—the stations formed a seismic and geophysical network spanning the Moon\u2019s near side.',
      events:
        'Each station was powered by a SNAP-27 radioisotope thermoelectric generator (RTG) that produced 70 watts of electricity continuously through scorching lunar days and freezing two-week lunar nights.',
      fate: 'Every surviving ALSEP station continued transmitting telemetry to Earth until 30 September 1977, when NASA shut down the receiving network due to budget constraints. The hardware still sits at each Apollo site.',
      science:
        'ALSEP seismometers recorded more than 13,000 seismic events—including deep moonquakes, shallow tectonic tremors, and meteorite impacts—revealing the thickness of the lunar crust and the structure of the Moon\u2019s mantle and core.',
      facts: [
        'To calibrate the ALSEP seismometers, NASA deliberately crashed spent Saturn V third-stage boosters (S-IVB) and Lunar Module ascent stages into the Moon, making the Moon "ring like a bell" for hours.',
        'While the active radio transmitters were turned off in 1977, the passive laser retroreflector arrays deployed alongside the Apollo stations are still used by observatories today.',
      ],
    },
  },
  {
    id: 'surveyor',
    bodyId: 'moon',
    name: 'Surveyor Landers (Surveyor 1–7)',
    missionName: 'NASA Surveyor Robotic Lunar Soft-Lander Program',
    agency: 'NASA / JPL / Hughes',
    years: '1966 – 1968',
    landingDate: 'June 2, 1966 (Surveyor 1 Touchdown)',
    landingSite: 'Flamsteed Ring, Oceanus Procellarum (2.47°S, 43.34°W)',
    shortDescription:
      'America’s first soft-landers on the Moon. Five Surveyor spacecraft successfully touched down between 1966 and 1968, proving the lunar regolith was firm enough to support the Apollo Lunar Module.',
    status: 'Five intact landers resting on the lunar surface',
    lat: -2.47,
    lon: -43.34,
    audioUrl: '/audio/narration/surveyor.mp3',
    fallbackDuration: 85,
    kind: 'lander',
    modelUrl: '/models/mars rover 3d model.glb',
    modelScale: 0.042,
    color: '#93c5fd',
    story: {
      mission:
        'The NASA Surveyor program sent seven robotic spacecraft to the Moon between 1966 and 1968 to master radar-guided soft landings and test whether the lunar surface could safely support the weight of Apollo astronauts and their lander.',
      why: 'Surveyor 1 targeted Oceanus Procellarum, while later missions landed across candidate Apollo equatorial sites and rugged highland terrain near Tycho crater to sample diverse lunar environments.',
      events:
        'Surveyor 1 achieved America\u2019s first soft landing on another world on 2 June 1966 and transmitted over 11,000 photographs. Surveyors 3, 5, 6, and 7 followed with robotic soil scoops, alpha-scattering chemical analysers, and even a short rocket hop across the surface by Surveyor 6.',
      fate: 'All five successful Surveyor landers (Surveyors 1, 3, 5, 6, and 7) remain on the Moon. In November 1969, Apollo 12 astronauts Pete Conrad and Alan Bean landed just 163 metres from Surveyor 3 and walked over to inspect it in person.',
      science:
        'Surveyor proved that the Moon was not covered in deep, treacherous dust that would swallow a spacecraft, directly clearing the way for Apollo 11, and confirmed that lunar maria are composed of basaltic volcanic rock.',
      facts: [
        'Apollo 12 astronauts detached Surveyor 3\u2019s television camera and soil scoop after 31 months on the Moon and brought them back to Earth to study how space exposure affects hardware.',
        'Surveyor 6 became the first spacecraft ever to launch off the lunar surface when controllers fired its vernier engines for 2.5 seconds to hop 2.4 metres west.',
      ],
    },
  },

  // ───────────────────────── MARS ─────────────────────────
  // Strictly the verified Mars surface equipment:
  // 1. Sojourner Rover
  // 2. Spirit Rover (MER-A)
  // 3. Opportunity Rover (MER-B)
  // 4. Viking 1 & 2 Landers
  // 5. Phoenix & InSight Landers
  // 6. Ingenuity Mars Helicopter
  {
    id: 'sojourner',
    bodyId: 'mars',
    name: 'Sojourner Rover',
    missionName: 'NASA Mars Pathfinder – Microrover Sojourner',
    agency: 'NASA / JPL',
    years: '1997',
    landingDate: 'July 4, 1997',
    landingSite: 'Ares Vallis, Chryse Planitia (19.13°N, 33.22°W)',
    shortDescription:
      'The first wheeled rover ever to operate on Mars. Delivered by the Mars Pathfinder lander inside a cocoon of giant airbags, Sojourner explored Ares Vallis for 83 sols and analyzed rocks with its Alpha Proton X-Ray Spectrometer.',
    status: 'Mission complete after base station battery failure (September 1997)',
    lat: 19.13,
    lon: -33.22,
    audioUrl: '/audio/narration/sojourner.mp3',
    fallbackDuration: 85,
    kind: 'rover',
    modelUrl: '/models/space rover 3d model.glb',
    modelScale: 0.038,
    color: '#f59e0b',
    story: {
      mission:
        'Sojourner was a 10.6-kilogram six-wheeled solar-powered microrover carried aboard NASA\u2019s Mars Pathfinder lander to prove that low-cost airbag landings and mobile robotic rovers could work on Mars.',
      why: 'It touched down in Ares Vallis, an ancient catastrophic outflow channel where medieval-scale floods once washed a "grab bag" of diverse Martian rocks down into a single flat plain.',
      events:
        'Landing on 4 July 1997, Sojourner rolled down the petals of the Carl Sagan Memorial Station and spent 83 Martian days (almost 12 times its planned 7-day mission) driving ~100 metres and examining rocks nicknamed Barnacle Bill, Yogi, and Scooby-Doo.',
      fate: 'Sojourner communicated with Earth through the Pathfinder lander base station. On 27 September 1997, the lander\u2019s rechargeable battery failed after repeated freezing Martian nights, leaving Sojourner without its radio relay.',
      science:
        'Sojourner\u2019s Alpha Proton X-Ray Spectrometer revealed silica-rich volcanic rocks resembling terrestrial andesites and rounded conglomerate pebbles shaped by ancient rushing liquid water.',
      facts: [
        'Named after American civil-rights pioneer Sojourner Truth (meaning "traveler"), the little rover introduced the six-wheel "rocker-bogie" suspension later used on Spirit, Opportunity, Curiosity, and Perseverance.',
        'Mars Pathfinder and Sojourner returned 16,500 lander images, 550 rover images, and 8.5 million measurements of atmospheric pressure, temperature, and wind.',
      ],
    },
  },
  {
    id: 'spirit',
    bodyId: 'mars',
    name: 'Spirit Rover (MER-A)',
    missionName: 'NASA Mars Exploration Rover – Spirit',
    agency: 'NASA',
    years: '2004 – 2010',
    landingDate: 'January 4, 2004',
    landingSite: 'Gusev Crater (14.57°S, 175.47°E)',
    shortDescription:
      'A robotic geologist that landed in Gusev Crater to search for evidence of ancient liquid water. Planned for 90 days, Spirit operated for over 6 years and discovered silica deposits from ancient hot springs.',
    status: 'Stuck in sand at Troy, then silent (2010)',
    lat: -14.57,
    lon: 175.47,
    audioUrl: '/audio/narration/spirit.mp3',
    fallbackDuration: 90,
    kind: 'rover',
    modelUrl: '/models/mars_spirit_rover.glb',
    modelScale: 0.042,
    color: '#ffb347',
    story: {
      mission:
        'Spirit was one of two NASA Mars Exploration Rovers, a robot geologist built to look for signs that Mars once had liquid water.',
      why: 'It landed in Gusev crater on 4 January 2004, a basin scientists suspected was once an ancient lake bed.',
      events:
        'Designed for 90 days, Spirit worked for more than six years and drove about 7.7 kilometres, climbing the Columbia Hills.',
      fate: 'In 2009 it broke through crusty soil into soft sand at a place called Troy and could not escape. Its last message came in March 2010, and NASA ended recovery efforts in May 2011.',
      science:
        'Spirit found silica-rich deposits that point to ancient hot springs or steam vents, an environment that could have supported microbial life.',
      facts: [
        'Spirit kept working as a stationary science station after it got stuck, and its wheel-dragging trenches exposed bright soil that revealed those silica deposits.',
        'Its twin, Opportunity, landed on the opposite side of Mars three weeks later.',
      ],
    },
  },
  {
    id: 'opportunity',
    bodyId: 'mars',
    name: 'Opportunity Rover (MER-B)',
    missionName: 'NASA Mars Exploration Rover – Opportunity',
    agency: 'NASA',
    years: '2004 – 2018',
    landingDate: 'January 25, 2004',
    landingSite: 'Meridiani Planum (1.95°S, 5.53°W)',
    shortDescription:
      'Spirit’s twin solar-powered Mars rover that explored Meridiani Planum for nearly 15 years, driving 45.16 km and proving through hematite "blueberries" that liquid water once soaked the Martian surface.',
    status: 'Lost in a global dust storm (June 2018)',
    lat: -1.95,
    lon: -5.53,
    audioUrl: '/audio/narration/opportunity.mp3',
    fallbackDuration: 90,
    kind: 'rover',
    modelUrl: '/models/mars_spirit_rover.glb',
    modelScale: 0.042,
    color: '#ffb347',
    story: {
      mission:
        'Opportunity was Spirit\u2019s twin, a solar-powered rover sent to read the story of water in the rocks of Mars.',
      why: 'It landed on 25 January 2004 on Meridiani Planum, where orbiters had detected hematite, a mineral that often forms in water.',
      events:
        'Planned for 90 days, it ran for nearly 14 years and drove about 45 kilometres, more than a marathon, finishing at Perseverance Valley.',
      fate: 'In June 2018 a planet-wide dust storm blocked the sunlight that powered it. Its last signal arrived on 10 June 2018, and NASA declared the mission complete in February 2019.',
      science:
        'Opportunity proved that liquid water once soaked this region, and found tiny hematite spheres nicknamed blueberries and sulfate-rich rocks formed in salty, acidic water.',
      facts: [
        'Its final transmission was later poetically paraphrased as a message that its battery was low and it was getting dark.',
        'Opportunity lasted roughly fifty times longer than its planned mission.',
      ],
    },
  },
  {
    id: 'viking',
    bodyId: 'mars',
    name: 'Viking 1 & 2 Landers',
    missionName: 'NASA Viking Program – Twin Mars Surface Landers',
    agency: 'NASA',
    years: '1976 – 1982',
    landingDate: 'July 20, 1976 (Viking 1) & September 3, 1976 (Viking 2)',
    landingSite: 'Chryse Planitia (22.27°N, 47.95°W) & Utopia Planitia (47.64°N, 134.29°E)',
    shortDescription:
      'History’s first spacecraft to land safely and complete an extended mission on Mars. Powered by radioisotope thermoelectric generators, Viking 1 and 2 returned the first clear panoramas of the Martian surface and conducted the first biological soil experiments.',
    status: 'Inactive on surface (Viking 2 until 1980; Viking 1 until November 1982)',
    lat: 22.27,
    lon: -47.95,
    audioUrl: '/audio/narration/viking.mp3',
    fallbackDuration: 85,
    kind: 'lander',
    modelUrl: '/models/viking_1_lander.glb',
    modelScale: 0.04,
    color: '#f97316',
    story: {
      mission:
        'Viking 1 and Viking 2 were twin NASA missions—each pairing an orbiter with a nuclear-powered three-legged surface lander—built to capture high-resolution images of Mars, monitor its weather, and test the soil for signs of microbial metabolism.',
      why: 'Viking 1 touched down on the rolling volcanic plains of Chryse Planitia ("Plains of Gold"), while Viking 2 landed farther north in Utopia Planitia where trace water-ice frost coated the ground in winter.',
      events:
        'On 20 July 1976—exactly seven years after Apollo 11 landed on the Moon—Viking 1 achieved the first fully successful Mars landing. Both landers used robotic scoop arms to feed Martian soil into three miniature biology laboratories and a gas chromatograph mass spectrometer.',
      fate: 'Viking 2 operated on the surface until April 1980 when its batteries failed. Viking 1 kept transmitting weather and engineering telemetry for more than six years until an faulty command accidentally overwrote its antenna-pointing software in November 1982.',
      science:
        'The Viking landers measured the exact chemical composition of the Martian atmosphere and iron-rich clay soil—later allowing scientists on Earth to prove that SNC meteorites actually came from Mars—and recorded decades-spanning baseline climate cycles.',
      facts: [
        'Viking 1 held the record for the longest continuous surface operation on Mars (2,245 sols / over 6 Earth years) until the Opportunity rover surpassed it in May 2010.',
        'Viking 1 was officially renamed the Thomas Mutch Memorial Station, and its Chryse Planitia landing site has since been photographed from orbit by Mars Reconnaissance Orbiter.',
      ],
    },
  },
  {
    id: 'phoenix_insight',
    bodyId: 'mars',
    name: 'Phoenix & InSight Landers',
    missionName: 'NASA Mars Polar Lander Phoenix (2008) & Interior Exploration Lander InSight (2018)',
    agency: 'NASA / JPL',
    years: '2008 (Phoenix) & 2018 – 2022 (InSight)',
    landingDate: 'May 25, 2008 (Phoenix) & November 26, 2018 (InSight)',
    landingSite: 'Elysium Planitia (4.50°N, 135.62°E) & Vastitas Borealis (68.22°N, 125.75°W)',
    shortDescription:
      'Twin stationary Mars landers built from a shared spacecraft heritage: Phoenix dug directly into shallow water ice in the Martian arctic, while InSight placed the first ultra-sensitive seismometer on Mars to map its crust, mantle, and liquid core.',
    status: 'Retired on surface after solar power depletion (Phoenix 2008; InSight Dec 2022)',
    lat: 4.5,
    lon: 135.62,
    audioUrl: '/audio/narration/phoenix_insight.mp3',
    fallbackDuration: 85,
    kind: 'lander',
    modelUrl: '/models/mars lander 3d model.glb',
    modelScale: 0.04,
    color: '#fb923c',
    story: {
      mission:
        'Built on the same three-legged solar-powered lander platform, Phoenix and InSight were stationary geophysical and geochemical laboratories designed to look beneath the Martian surface—Phoenix in the icy north polar plains and InSight near the equator.',
      why: 'Phoenix landed at 68°N in Vastitas Borealis ("Green Valley") where shallow subsurface water ice lay within reach of a robotic scoop, while InSight landed on the flat, quiet lava plains of Elysium Planitia to listen for faint marsquakes.',
      events:
        'In 2008 Phoenix excavated bright chunks of subsurface water ice that sublimated over four days, confirming underground ice first detected from orbit. A decade later, InSight used its robotic arm to place the dome-shielded SEIS seismometer directly onto the Martian ground and operated for over four years.',
      fate: 'Phoenix lost solar power in November 2008 as the dark Martian arctic winter set in. InSight operated for 1,440 sols until thick Martian dust coated its circular solar arrays, sending its final transmission on 15 December 2022.',
      science:
        'Phoenix discovered shallow water ice, alkaline soil nutrients, perchlorate salts, and snow falling from Martian clouds. InSight detected more than 1,300 marsquakes and meteoroid impacts, measuring for the first time the thickness of Mars\u2019s crust and the size of its molten liquid iron-alloy core.',
      facts: [
        'InSight detected seismic waves from meteoroid impacts that excavated fresh craters exposing bright blocks of underground water ice closer to the Martian equator than ever seen before.',
        'Phoenix\u2019s Wet Chemistry Lab showed that Martian arctic soil has a mildly alkaline pH of 7.7 and contains minerals like magnesium, sodium, potassium, and chloride.',
      ],
    },
  },
  {
    id: 'ingenuity',
    bodyId: 'mars',
    name: 'Ingenuity Mars Helicopter',
    missionName: 'NASA Mars 2020 – Ingenuity Rotorcraft',
    agency: 'NASA / JPL',
    years: '2021 – 2024',
    landingDate: 'February 18, 2021 (First Flight: April 19, 2021)',
    landingSite: 'Valinor Hills / Jezero Crater Final Resting Site (18.44°N, 77.45°E)',
    shortDescription:
      'The first aircraft in history to achieve powered, controlled flight on another planet. Deployed by the Perseverance rover in Jezero Crater, Ingenuity completed 72 flights before coming to rest at Valinor Hills.',
    status: 'Resting at Valinor Hills after blade damage on Flight 72',
    lat: 18.44,
    lon: 77.45,
    audioUrl: '/audio/narration/ingenuity.mp3',
    fallbackDuration: 85,
    kind: 'helicopter',
    modelUrl: '/models/mars helicopter 3d model.glb',
    modelScale: 0.04,
    color: '#fde047',
    story: {
      mission:
        'Ingenuity was a 1.8-kilogram solar-powered coaxial helicopter sent to Mars with the Perseverance rover to test whether powered flight was possible in an atmosphere only 1% as dense as Earth\u2019s.',
      why: 'It was deployed in Jezero Crater, an ancient river delta flat enough for an airfield—named Wright Brothers Field—while surrounded by rocky terrain where aerial scouting would shine.',
      events:
        'On 19 April 2021 Ingenuity made the first powered flight on another world. Designed for just 5 test flights over 30 days, it graduated into an operational aerial scout and flew 72 times over nearly three years.',
      fate: 'On 18 January 2024, during a steep landing in featureless sand ripples at "Valinor Hills" on Flight 72, its carbon-fibre rotor blades struck the ground and were damaged, ending its flying career while leaving its avionics and radio alive at its final resting site.',
      science:
        'Ingenuity proved aerial exploration works on Mars, scouting craters, ancient river channels and boulder fields ahead of Perseverance and paving the way for future Mars rotorcraft.',
      facts: [
        'Ingenuity carried a postage-stamp-sized piece of fabric from the wing of the Wright brothers\u2019 1903 Wright Flyer.',
        'Its twin counter-rotating blades had to spin at roughly 2,400 RPM—about five times faster than a helicopter on Earth—to generate lift in the thin Martian air.',
      ],
    },
  },

  // ───────────────────────── EARTH ─────────────────────────
  {
    id: 'hubble',
    bodyId: 'earth',
    name: 'Hubble Space Telescope',
    missionName: 'NASA / ESA Hubble Space Telescope (STS-31)',
    agency: 'NASA / ESA',
    years: '1990 – Present',
    landingDate: 'Deployed April 25, 1990',
    landingSite: 'Kennedy Space Center Orbital Track (28.5°N, 80.6°W)',
    shortDescription:
      'Deployed by Space Shuttle Discovery in April 1990, the Hubble Space Telescope has revolutionized humanity’s understanding of the cosmos from above Earth’s distorting atmosphere.',
    status: 'Active in Low Earth Orbit',
    lat: 28.5,
    lon: -80.6,
    audioUrl: '/audio/narration/hubble.mp3',
    fallbackDuration: 85,
    kind: 'telescope',
    modelUrl: '/models/space telescope 3d model.glb',
    modelScale: 0.042,
    color: '#93c5fd',
    story: {
      mission:
        'The Hubble Space Telescope is a 2.4-metre optical and ultraviolet observatory built by NASA and ESA to peer deep into the universe without the blurring of Earth\u2019s atmosphere.',
      why: 'Launched from Kennedy Space Center into a 28.5-degree inclination orbit roughly 540 kilometres above Earth, it orbits the globe every 95 minutes while remaining reachable by Space Shuttle servicing crews.',
      events:
        'Shortly after deployment in April 1990, engineers discovered a tiny flaw in its primary mirror. In December 1993 astronauts on STS-61 installed corrective optics, transforming Hubble into humanity\u2019s sharpest eye on the universe.',
      fate: 'Across five Space Shuttle servicing missions through 2009, astronauts upgraded its cameras and gyroscopes. Hubble continues operating today alongside the James Webb Space Telescope.',
      science:
        'Hubble pinned down the age of the universe at 13.8 billion years, helped discover that cosmic expansion is accelerating, imaged the Hubble Ultra Deep Field, and analysed exoplanet atmospheres.',
      facts: [
        'The flaw in Hubble\u2019s mirror was just 2.2 micrometres—about one-fiftieth the thickness of a human hair.',
        'Hubble has made more than 1.6 million scientific observations since 1990.',
      ],
    },
  },

  // ───────────────────────── VENUS ─────────────────────────
  {
    id: 'venera13',
    bodyId: 'venus',
    name: 'Venera 13 Surface Lander',
    missionName: 'USSR Venera 13 Venus Lander',
    agency: 'USSR',
    years: '1982',
    landingDate: 'March 1, 1982',
    landingSite: 'Phoebe Regio (7.5°S, 303°E / 57°W)',
    shortDescription:
      'A heavily armored Soviet titanium pressure-vessel lander that touched down in Phoebe Regio, surviving 460 °C heat and 90-bar pressure for 127 minutes to send back the first color panoramas of Venus.',
    status: 'Destroyed by the surface',
    lat: -7.5,
    lon: -57,
    audioUrl: '/audio/narration/venera13.mp3',
    fallbackDuration: 80,
    kind: 'probe',
    modelUrl: '/models/mars lander 3d model.glb',
    modelScale: 0.038,
    color: '#c9a66b',
    story: {
      mission:
        'Venera 13 was a Soviet lander built to survive the surface of Venus long enough to photograph it and analyse the soil.',
      why: 'Venus is Earth\u2019s closest planetary neighbour, but its thick clouds hide the ground, so the only way to see it was to land.',
      events:
        'It touched down on 1 March 1982, drilled into the soil and sent the first colour panoramas of the surface, while a flyby craft relayed the data to Earth.',
      fate: 'The surface is about 460 degrees Celsius with a crushing pressure around ninety times that of Earth. After 127 minutes, far longer than planned, the lander stopped working.',
      science:
        'It measured the soil as basalt-like volcanic rock and returned the first colour images of the Venusian landscape.',
      facts: [
        'Engineers designed it to last under an hour. It survived for about two.',
        'Venus is hotter than Mercury, even though Mercury is closer to the Sun, because its thick atmosphere traps heat.',
      ],
    },
  },

  // ───────────────────────── MERCURY ─────────────────────────
  {
    id: 'messenger',
    bodyId: 'mercury',
    name: 'MESSENGER Orbiter Impact Site',
    missionName: 'NASA MESSENGER Mercury Orbiter',
    agency: 'NASA',
    years: '2004 – 2015',
    landingDate: 'March 18, 2011 (Surface Impact: April 30, 2015)',
    landingSite: 'Shakespeare Quadrangle, near Janáček Crater (54.4°N, 149.9°W)',
    shortDescription:
      'The first spacecraft ever to orbit Mercury. Over four years in orbit it mapped 100% of the planet and proved water ice exists in shadowed polar craters before impacting the surface when propellant ran out.',
    status: 'Deliberately crashed',
    lat: 54.4,
    lon: -149.9,
    audioUrl: '/audio/narration/messenger.mp3',
    fallbackDuration: 80,
    kind: 'orbiter',
    modelUrl: '/models/satellite 3d model.glb',
    modelScale: 0.045,
    color: '#9aa3ad',
    story: {
      mission:
        'MESSENGER was a NASA spacecraft, and the first ever to orbit Mercury, mapping the whole planet and studying its surface and magnetic field.',
      why: 'Mercury is the closest planet to the Sun and one of the least explored. Only an orbiter could map it completely.',
      events:
        'After a six-and-a-half-year journey it entered orbit in March 2011 and worked for four years, long past its planned year.',
      fate: 'It ran out of fuel to keep its orbit. On 30 April 2015 it crashed into Mercury at several kilometres per second, ending the mission.',
      science:
        'MESSENGER found water ice in permanently shadowed craters near the poles, even though Mercury is so close to the Sun.',
      facts: [
        'Mercury\u2019s magnetic field is off-centre, something MESSENGER measured directly.',
        'The impact is believed to have carved a new crater roughly sixteen metres wide.',
      ],
    },
  },

  // ───────────────────────── SATURN ─────────────────────────
  {
    id: 'cassini',
    bodyId: 'saturn',
    name: 'Cassini–Huygens Spacecraft',
    missionName: 'NASA / ESA / ASI Cassini–Huygens Grand Finale',
    agency: 'NASA / ESA / ASI',
    years: '1997 – 2017',
    landingDate: 'July 1, 2004 (Grand Finale Entry: September 15, 2017)',
    landingSite: 'Saturn Equatorial Atmosphere (9.4°S, 53.0°W)',
    shortDescription:
      'Flagship orbiter that spent 13 years exploring Saturn, its rings, and its moons—discovering water-ice geysers on Enceladus and landing Huygens on Titan—before diving between the rings into Saturn’s atmosphere.',
    status: 'Vaporized in Saturn’s atmosphere during Grand Finale',
    lat: -9.4,
    lon: -53.0,
    audioUrl: '/audio/narration/cassini.mp3',
    fallbackDuration: 85,
    kind: 'orbiter',
    modelUrl: '/models/space satellite 3d model.glb',
    modelScale: 0.036,
    color: '#fcd34d',
    story: {
      mission:
        'Cassini–Huygens was a landmark joint mission by NASA, ESA and the Italian Space Agency to study Saturn, its complex ring system, and its family of icy moons.',
      why: 'Saturn and its moons—especially haze-shrouded Titan and ice-covered Enceladus—hold clues to how giant planetary systems form and whether ocean worlds can host habitable environments.',
      events:
        'Entering Saturn orbit on 1 July 2004, Cassini deployed the European Huygens lander onto Titan in January 2005 and discovered towering plumes of water vapour and organic molecules erupting from Enceladus\u2019s south pole.',
      fate: 'With propellant nearly exhausted in 2017, mission controllers flew 22 daring "Grand Finale" orbits between Saturn and its innermost rings before plunging Cassini into Saturn on 15 September 2017 so it could never contaminate Enceladus or Titan.',
      science:
        'Cassini revealed liquid methane seas on Titan, a global subsurface saltwater ocean with hydrothermal activity inside Enceladus, and measured the mass and youthful age of Saturn\u2019s rings.',
      facts: [
        'Huygens remains the farthest landing from Earth any human-made spacecraft has ever achieved.',
        'Cassini transmitted scientific telemetry directly from inside Saturn\u2019s upper atmosphere until its final seconds.',
      ],
    },
  },
];

// ───────────────────────── DEEP-SPACE, ASTEROID & HELIOCENTRIC MISSIONS ─────────────────────────
// Strictly separated from Moon (`moon`) and Mars (`mars`) surface landmarks.
// These spacecraft operate or rest on minor bodies (Ceres, 433 Eros), in heliocentric orbit,
// or in interstellar space — NEVER on the Moon or Mars.
export const deepSpaceMissions: Landmark[] = [
  {
    id: 'dawn',
    bodyId: 'ceres',
    name: 'Dawn Spacecraft',
    missionName: 'NASA Dawn Ion-Propulsion Mission to Vesta & Ceres',
    agency: 'NASA / JPL',
    years: '2007 – 2018',
    landingDate: 'March 6, 2015 (Ceres Orbital Insertion)',
    landingSite: 'Unpowered Orbit Around Dwarf Planet Ceres (Main Asteroid Belt)',
    shortDescription:
      'The first spacecraft ever to orbit two extraterrestrial destinations—protoplanet Vesta and dwarf planet Ceres in the Main Asteroid Belt—now in a permanent, stable unpowered quarantine orbit around Ceres.',
    status: 'In unpowered orbit around Ceres (since November 2018)',
    lat: 0,
    lon: 0,
    audioUrl: '/audio/narration/dawn.mp3',
    fallbackDuration: 85,
    kind: 'orbiter',
    modelUrl: '/models/space satellite 3d model.glb',
    modelScale: 0.04,
    color: '#38bdf8',
    story: {
      mission:
        'Dawn was a NASA Discovery mission propelled by three xenon ion thrusters, launched to study the two most massive bodies in the Main Asteroid Belt: rocky protoplanet 4 Vesta and icy dwarf planet 1 Ceres.',
      why: 'Vesta and Ceres are intact building blocks left over from the dawn of the Solar System 4.6 billion years ago, straddling the boundary between rocky inner worlds and icy outer worlds.',
      events:
        'Dawn orbited Vesta from July 2011 to September 2012 before using its ultra-efficient ion engines to spiral outward and enter orbit around Ceres on 6 March 2015—becoming the first spacecraft ever to orbit a dwarf planet.',
      fate: 'When its hydrazine attitude-control propellant ran out on 31 October 2018, NASA placed Dawn in a stable, unpowered orbit around Ceres rather than crashing it, protecting Ceres\u2019s subsurface brine reservoirs from contamination.',
      science:
        'Dawn revealed that Ceres\u2019s famous bright spots in Occator Crater are sodium-carbonate salt deposits left by briny water rising from a deep subsurface reservoir, proving Ceres is a geologically active ocean world relic.',
      facts: [
        'Dawn remains the only spacecraft in history to enter orbit around two separate extraterrestrial bodies beyond the Earth–Moon system.',
        'Its planetary protection orbit is designed to keep Dawn safely circling Ceres without impacting for at least several decades.',
      ],
    },
  },
  {
    id: 'near_shoemaker',
    bodyId: 'eros',
    name: 'NEAR Shoemaker',
    missionName: 'NASA Near Earth Asteroid Rendezvous – Shoemaker',
    agency: 'NASA / JHUAPL',
    years: '1996 – 2001',
    landingDate: 'February 12, 2001 (Touchdown on Asteroid 433 Eros)',
    landingSite: 'Himeros Saddle, Asteroid 433 Eros (35°S, 279°W)',
    shortDescription:
      'The first spacecraft ever to orbit and touch down on an asteroid. After orbiting near-Earth asteroid 433 Eros for a full year, NEAR Shoemaker gently descended to rest on its boulder-strewn surface.',
    status: 'Resting on the surface of asteroid 433 Eros',
    lat: -35.0,
    lon: -81.0,
    audioUrl: '/audio/narration/near_shoemaker.mp3',
    fallbackDuration: 80,
    kind: 'probe',
    modelUrl: '/models/satellite 3d model.glb',
    modelScale: 0.04,
    color: '#a78bfa',
    story: {
      mission:
        'NEAR Shoemaker (renamed in honour of planetary geologist Eugene Shoemaker) was built for NASA by the Johns Hopkins Applied Physics Laboratory to conduct the first close-up orbital study of a near-Earth asteroid.',
      why: 'Asteroid 433 Eros is a 34-kilometre-long S-type stony asteroid whose primitive composition preserves unaltered clues from the formation of the inner Solar System.',
      events:
        'Entering orbit around Eros on Valentine\u2019s Day (14 February 2000), NEAR mapped the peanut-shaped asteroid for a year. Although never designed as a lander, engineers executed a series of braking burns on 12 February 2001 and touched down at just 1.5 to 1.8 metres per second.',
      fate: 'Remarkably, NEAR Shoemaker survived the gentle touchdown intact and continued transmitting gamma-ray spectrometer measurements directly from the surface of Eros until its mission concluded on 28 February 2001, where it rests today.',
      science:
        'NEAR discovered that Eros is a consolidated, fractured rock body rather than a loose rubble pile, mapped bizarre flat "ponds" of electrostatically levitated dust in craters, and confirmed its elemental match to ordinary chondrite meteorites.',
      facts: [
        'Because Eros has tiny gravity—only about 1/2,000th of Earth\u2019s—NEAR Shoemaker weighed less than half a kilogram when it settled onto the asteroid\u2019s surface.',
        'It returned more than 160,000 images of Eros, with final descent frames resolving surface pebbles just centimetres across.',
      ],
    },
  },
  {
    id: 'pioneer',
    bodyId: 'interstellar',
    name: 'Pioneer 10 & 11',
    missionName: 'NASA Pioneer 10 & Pioneer 11 Outer Solar System & Interstellar Probes',
    agency: 'NASA / Ames',
    years: '1972 – 2003 (Now in Interstellar Trajectories)',
    landingDate: 'Launched March 2, 1972 (Pioneer 10) & April 5, 1973 (Pioneer 11)',
    landingSite: 'Outbound Heliocentric Escape Trajectories into Interstellar Space',
    shortDescription:
      'Pathfinding deep-space probes that became the first spacecraft to cross the Asteroid Belt, fly past Jupiter (Pioneer 10 & 11) and Saturn (Pioneer 11), and achieve escape velocity out of the Solar System into interstellar space.',
    status: 'Traveling outward through interstellar space (last signal Jan 2003)',
    lat: 0,
    lon: 0,
    audioUrl: '/audio/narration/pioneer.mp3',
    fallbackDuration: 85,
    kind: 'probe',
    modelUrl: '/models/pioneer 10 spacecraft 3d model.glb',
    modelScale: 0.042,
    color: '#fbbf24',
    story: {
      mission:
        'Pioneer 10 and Pioneer 11 were NASA\u2019s trailblazing outer-planet scouts, built to test whether spacecraft could safely survive the Asteroid Belt and Jupiter\u2019s intense radiation belts ahead of the Voyager missions.',
      why: 'Using gravity-assist flybys of Jupiter (December 1973 for Pioneer 10; December 1974 for Pioneer 11) and Saturn (September 1979 for Pioneer 11), both probes were accelerated past solar escape velocity onto outbound interstellar trajectories.',
      events:
        'Pioneer 10 returned the first close-up images of Jupiter and its Galilean moons, while Pioneer 11 discovered Saturn\u2019s narrow F ring and a new moon before heading out toward the constellation Scutum.',
      fate: 'As their SNAP-19 radioisotope thermoelectric generators slowly decayed over decades, Pioneer 11\u2019s last telemetry arrived in November 1995 and Pioneer 10\u2019s final faint signal was received on 23 January 2003 from 12.2 billion kilometres away. Both continue coasting silently through interstellar space.',
      science:
        'The twin Pioneers mapped the heliosphere, cosmic rays, and the vast magnetospheres of Jupiter and Saturn, proving outer-planet flyby navigation and paving the way for Voyagers 1 and 2, Galileo, Cassini, and New Horizons.',
      facts: [
        'Both Pioneer 10 and Pioneer 11 carry gold-anodized aluminum plaques designed by Carl Sagan and Frank Drake, depicting human figures and a pulsar map showing Earth\u2019s location in the Milky Way.',
        'Pioneer 10 is heading in the general direction of the red giant star Aldebaran in Taurus, a journey that will take roughly two million years.',
      ],
    },
  },
  {
    id: 'kepler',
    bodyId: 'heliocentric',
    name: 'Kepler Space Telescope',
    missionName: 'NASA Kepler & K2 Exoplanet Discovery Space Observatory',
    agency: 'NASA / Ames / JPL',
    years: '2009 – 2018',
    landingDate: 'Launched March 7, 2009 (Retired October 30, 2018)',
    landingSite: 'Earth-Trailing Heliocentric Orbit Around the Sun (372.5-Day Period)',
    shortDescription:
      'NASA’s revolutionary planet-hunting space telescope that monitored over 530,000 stars from an Earth-trailing heliocentric orbit, discovering more than 2,600 confirmed exoplanets and proving that planets outnumber stars in our galaxy.',
    status: 'Passivated in a safe Earth-trailing heliocentric orbit (October 2018)',
    lat: 0,
    lon: 0,
    audioUrl: '/audio/narration/kepler.mp3',
    fallbackDuration: 85,
    kind: 'telescope',
    modelUrl: '/models/space telescope 3d model.glb',
    modelScale: 0.042,
    color: '#67e8f9',
    story: {
      mission:
        'The Kepler Space Telescope was a 0.95-metre space photometer built by NASA to answer one of humanity\u2019s oldest questions: how common are Earth-sized planets orbiting in the habitable zones of other stars?',
      why: 'Instead of orbiting Earth—where the planet\u2019s bulk, glare, and thermal radiation would interrupt observations—Kepler was placed into an Earth-trailing heliocentric orbit around the Sun so it could stare uninterrupted at a single star field in Cygnus and Lyra.',
      events:
        'Over four years in its primary mission, Kepler measured microscopic dips in starlight caused by transiting exoplanets. After two reaction wheels failed in 2013, engineers ingeniously used the gentle pressure of sunlight to balance the telescope for its extended "K2" mission.',
      fate: 'After nine and a half years in deep space and having exhausted its hydrazine thrusters, NASA sent a final "goodnight" command on 15 November 2018. Kepler remains in its safe, permanent heliocentric orbit trailing slowly behind Earth.',
      science:
        'Kepler discovered more than 2,660 confirmed exoplanets—including rocky worlds in their stars\u2019 habitable zones like Kepler-186f and Kepler-452b—and proved statistically that our Milky Way galaxy holds more planets than stars.',
      facts: [
        'Kepler\u2019s 95-megapixel focal plane array was the largest camera ever launched into space at the time, capable of detecting a brightness drop as tiny as 100 parts per million—like a flea crawling across a car headlight.',
        'The final command that shut down Kepler\u2019s transmitter was sent on 15 November 2018, the exact 388th anniversary of astronomer Johannes Kepler\u2019s death in 1630.',
      ],
    },
  },
];

export function getLandmarksForBody(bodyId: string): Landmark[] {
  return landmarks.filter((l) => l.bodyId === bodyId);
}

export function getLandmark(landmarkId: string): Landmark | undefined {
  return (
    landmarks.find((landmark) => landmark.id === landmarkId) ??
    deepSpaceMissions.find((mission) => mission.id === landmarkId)
  );
}
