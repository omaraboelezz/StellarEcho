export type ResourceType =
  | 'Scientific Articles'
  | 'Space Missions'
  | 'Research & Discoveries'
  | 'Images & Media'
  | 'Educational Materials'
  | '3D & Interactive';

export const RESOURCE_CATEGORIES: readonly ResourceType[] = [
  'Scientific Articles',
  'Space Missions',
  'Research & Discoveries',
  'Images & Media',
  'Educational Materials',
  '3D & Interactive',
] as const;

export interface PlanetResource {
  id: number;
  title: string;
  description: string;
  type: ResourceType;
  source: string;
  image: string;
  url: string;
}

export const planetResources: Record<string, PlanetResource[]> = {
  mercury: [
    {
      id: 1,
      title: 'Mercury: Planetary Overview & Science',
      description:
        'Explore NASA’s comprehensive scientific profile of Mercury, the smallest and innermost planet of the Solar System, including its iron-rich core, cratered crust, and extreme thermal environment.',
      type: 'Scientific Articles',
      source: 'NASA Science',
      image: 'https://images-assets.nasa.gov/image/PIA15162/PIA15162~orig.jpg',
      url: 'https://science.nasa.gov/mercury/',
    },
    {
      id: 2,
      title: 'MESSENGER Orbital Mission to Mercury',
      description:
        'Discover how NASA’s MESSENGER spacecraft became the first probe to orbit Mercury (2011–2015), mapping 100% of the surface and confirming water ice in permanently shadowed polar craters.',
      type: 'Space Missions',
      source: 'NASA / JHUAPL',
      image: 'https://images-assets.nasa.gov/image/PIA19421/PIA19421~orig.jpg',
      url: 'https://science.nasa.gov/mission/messenger/',
    },
    {
      id: 3,
      title: 'BepiColombo Joint Mercury Mission',
      description:
        'Follow Europe and Japan’s dual-spacecraft BepiColombo mission as it journeys to Mercury to investigate the planet’s offset magnetic field, interior structure, and exosphere.',
      type: 'Space Missions',
      source: 'ESA / JAXA',
      image: 'https://images-assets.nasa.gov/image/PIA13830/PIA13830~orig.jpg',
      url: 'https://www.esa.int/missions/about-us/directorates/science/bepicolombo/bepicolombo',
    },
    {
      id: 4,
      title: 'Mercury Planetary Fact Sheet & Orbital Telemetry',
      description:
        'Examine authoritative physical, orbital, and magnetospheric parameters compiled by NASA’s Space Science Data Coordinated Archive, comparing Mercury directly with Earth.',
      type: 'Research & Discoveries',
      source: 'NASA GSFC / NSSDCA',
      image: 'https://images-assets.nasa.gov/image/PIA16853/PIA16853~orig.jpg',
      url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/mercuryfact.html',
    },
    {
      id: 5,
      title: 'MESSENGER Science Operations & Geochemical Archive',
      description:
        'Access scientific papers, geological maps, spectrometer datasets, and discovery highlights from the Johns Hopkins Applied Physics Laboratory MESSENGER science team.',
      type: 'Research & Discoveries',
      source: 'JHUAPL / NASA',
      image: 'https://images-assets.nasa.gov/image/PIA19420/PIA19420~orig.jpg',
      url: 'https://messenger.jhuapl.edu/',
    },
    {
      id: 6,
      title: 'NASA / JPL Mercury Photojournal Archive',
      description:
        'Browse high-resolution calibrated mosaics, false-color mineralogical maps, and close-up images of Caloris Basin and lobate scarps captured by Mariner 10 and MESSENGER.',
      type: 'Images & Media',
      source: 'NASA / JPL Photojournal',
      image: 'https://images-assets.nasa.gov/image/PIA11364/PIA11364~orig.jpg',
      url: 'https://science.nasa.gov/photojournal/galleries/pj-mercury/',
    },
    {
      id: 7,
      title: 'Mercury Facts & Spin-Orbit Resonance Guide',
      description:
        'Learn key facts about Mercury’s 3:2 spin-orbit resonance, why a solar day on Mercury lasts 176 Earth days, and how its thin exosphere interacts with the solar wind.',
      type: 'Educational Materials',
      source: 'NASA Science',
      image: 'https://images-assets.nasa.gov/image/PIA14729/PIA14729~orig.jpg',
      url: 'https://science.nasa.gov/mercury/facts/',
    },
    {
      id: 8,
      title: 'NASA Mercury Trek — Interactive 3D Globe & Map Portal',
      description:
        'Explore Mercury’s surface in 2D and 3D using NASA’s interactive planetary GIS portal—measure crater depths, inspect elevation profiles, and overlay MESSENGER instrument layers.',
      type: '3D & Interactive',
      source: 'NASA / JPL Trek',
      image: 'https://images-assets.nasa.gov/image/PIA19216/PIA19216~orig.jpg',
      url: 'https://trek.nasa.gov/mercury/',
    },
  ],

  venus: [
    {
      id: 1,
      title: 'Venus: Earth’s Superheated Twin',
      description:
        'Explore the geology and atmospheric dynamics of Venus, where a dense carbon dioxide atmosphere and sulfuric acid clouds drive a runaway greenhouse effect reaching 465 °C.',
      type: 'Scientific Articles',
      source: 'NASA Science',
      image: 'https://images-assets.nasa.gov/image/PIA00271/PIA00271~orig.jpg',
      url: 'https://science.nasa.gov/venus/',
    },
    {
      id: 2,
      title: 'VERITAS Venus Radar Mapping Mission',
      description:
        'Learn how NASA’s upcoming VERITAS orbiter will use high-resolution synthetic aperture radar and near-infrared spectroscopy to reveal active volcanism and tectonics on Venus.',
      type: 'Space Missions',
      source: 'NASA / JPL',
      image: 'https://images-assets.nasa.gov/image/PIA00104/PIA00104~orig.jpg',
      url: 'https://science.nasa.gov/mission/veritas/',
    },
    {
      id: 3,
      title: 'ESA Venus Express Atmospheric & Plasma Mission',
      description:
        'Review findings from the European Space Agency’s eight-year Venus Express mission, including evidence of recent volcanic hotspots, polar vortices, and super-rotating winds.',
      type: 'Space Missions',
      source: 'ESA',
      image: 'https://images-assets.nasa.gov/image/PIA00270/PIA00270~orig.jpg',
      url: 'https://www.esa.int/missions/about-us/directorates/science/venus-express/venus-express',
    },
    {
      id: 4,
      title: 'Venus Facts: Retrograde Rotation & Atmospheric Science',
      description:
        'Examine detailed scientific data on Venus’s retrograde rotation, crushing 92-bar surface pressure, coronae volcanic structures, and how its evolution diverged from Earth’s.',
      type: 'Research & Discoveries',
      source: 'NASA Science',
      image: 'https://images-assets.nasa.gov/image/PIA00103/PIA00103~orig.jpg',
      url: 'https://science.nasa.gov/venus/venus-facts/',
    },
    {
      id: 5,
      title: 'NASA / JPL Venus Radar & Surface Photojournal',
      description:
        'View global radar mosaics from the Magellan orbiter, 3D perspective views of Maxwell Montes and Maat Mons, and cloud-top ultraviolet imagery of Venus.',
      type: 'Images & Media',
      source: 'NASA / JPL Photojournal',
      image: 'https://images-assets.nasa.gov/image/PIA00159/PIA00159~orig.jpg',
      url: 'https://science.nasa.gov/photojournal/galleries/pj-venus/',
    },
    {
      id: 6,
      title: 'All About Venus — Student & Educator Guide',
      description:
        'An accessible educational guide explaining why the Sun rises in the west on Venus, how radar sees through thick clouds, and why Venus is the brightest planet in Earth’s night sky.',
      type: 'Educational Materials',
      source: 'NASA Space Place',
      image: 'https://images-assets.nasa.gov/image/PIA00477/PIA00477~orig.jpg',
      url: 'https://spaceplace.nasa.gov/all-about-venus/en/',
    },
    {
      id: 7,
      title: 'Eyes on the Solar System — Interactive 3D Venus Explorer',
      description:
        'Fly alongside past and future Venus spacecraft and inspect a real-time 3D globe of Venus inside NASA JPL’s interactive Eyes on the Solar System visualization.',
      type: '3D & Interactive',
      source: 'NASA / JPL Eyes',
      image: 'https://images-assets.nasa.gov/image/PIA00254/PIA00254~orig.jpg',
      url: 'https://eyes.nasa.gov/apps/solar-system/#/venus',
    },
  ],

  earth: [
    {
      id: 1,
      title: 'Earth Science & Planetary Systems Overview',
      description:
        'Explore how NASA’s fleet of Earth-observing satellites monitors our home planet’s interconnected atmosphere, oceans, cryosphere, biosphere, and solid Earth processes.',
      type: 'Scientific Articles',
      source: 'NASA Science',
      image: 'https://images-assets.nasa.gov/image/PIA18033/PIA18033~orig.jpg',
      url: 'https://science.nasa.gov/earth/',
    },
    {
      id: 2,
      title: 'Landsat Earth Observation Program',
      description:
        'Discover the longest continuous space-based record of Earth’s land surfaces—tracking glaciers, forests, urban growth, and water resources since 1972.',
      type: 'Space Missions',
      source: 'NASA / USGS',
      image:
        'https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e001589/GSFC_20171208_Archive_e001589~orig.jpg',
      url: 'https://science.nasa.gov/mission/landsat/',
    },
    {
      id: 3,
      title: 'ESA Earth Observation Programmes (Copernicus & Earth Explorers)',
      description:
        'Learn how the European Space Agency’s Sentinel and Earth Explorer satellite constellations measure global sea level, atmospheric chemistry, ice sheets, and gravity.',
      type: 'Space Missions',
      source: 'ESA',
      image: 'https://images-assets.nasa.gov/image/iss068e055726/iss068e055726~orig.jpg',
      url: 'https://www.esa.int/directorates/about-us/directorates/earth-observation-programmes',
    },
    {
      id: 4,
      title: 'NASA Climate Change & Global Vital Signs',
      description:
        'Track real-time planetary vital signs—carbon dioxide levels, global temperature anomalies, Arctic sea ice extent, and sea-level rise—backed by peer-reviewed satellite telemetry.',
      type: 'Research & Discoveries',
      source: 'NASA Science',
      image: 'https://images-assets.nasa.gov/image/PIA00122/PIA00122~orig.jpg',
      url: 'https://science.nasa.gov/climate-change/',
    },
    {
      id: 5,
      title: 'Earth Planetary Fact Sheet & Geophysical Reference',
      description:
        'Reference verified geophysical constants for Earth—including mass, moment of inertia, dipole magnetic field strength, atmospheric composition, and orbital mechanics.',
      type: 'Research & Discoveries',
      source: 'NASA GSFC / NSSDCA',
      image: 'https://images-assets.nasa.gov/image/AS17-148-22727/AS17-148-22727~orig.jpg',
      url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html',
    },
    {
      id: 6,
      title: 'NASA Earth Observatory — Daily Satellite Imagery & Stories',
      description:
        'Explore daily high-resolution satellite photographs, natural hazard maps, and data visualizations showing volcanic eruptions, auroras, ocean phytoplankton, and weather systems.',
      type: 'Images & Media',
      source: 'NASA Earth Observatory',
      image: 'https://images-assets.nasa.gov/image/iss043e086375/iss043e086375~orig.jpg',
      url: 'https://science.nasa.gov/earth/earth-observatory/',
    },
    {
      id: 7,
      title: 'Facts About Earth — Structure, Atmosphere & Habitability',
      description:
        'Learn what makes Earth uniquely habitable in our Solar System—from plate tectonics and liquid water oceans to the protective magnetosphere and ozone layer.',
      type: 'Educational Materials',
      source: 'NASA Science',
      image: 'https://images-assets.nasa.gov/image/AS08-14-2383/AS08-14-2383~orig.jpg',
      url: 'https://science.nasa.gov/earth/facts/',
    },
    {
      id: 8,
      title: 'NASA Eyes on the Earth — Live 3D Satellite & Climate Globe',
      description:
        'Fly alongside NASA’s Earth-observing satellites in real time in 3D and overlay live global datasets including air temperature, carbon monoxide, sea surface height, and soil moisture.',
      type: '3D & Interactive',
      source: 'NASA / JPL Eyes',
      image: 'https://images-assets.nasa.gov/image/PIA18033/PIA18033~orig.jpg',
      url: 'https://eyes.nasa.gov/apps/earth/',
    },
  ],

  mars: [
    {
      id: 1,
      title: 'Mars: The Red Planet — Geology, Climate & Astrobiology',
      description:
        'Explore NASA’s flagship scientific portal on Mars, covering ancient river valleys, Olympus Mons, Valles Marineris, polar ice caps, and the search for past microbial life.',
      type: 'Scientific Articles',
      source: 'NASA Science',
      image: 'https://images-assets.nasa.gov/image/PIA04591/PIA04591~orig.jpg',
      url: 'https://science.nasa.gov/mars/',
    },
    {
      id: 2,
      title: 'Mars 2020 Perseverance Rover & Ingenuity Helicopter',
      description:
        'Follow Perseverance as it explores an ancient river delta in Jezero Crater, drills and caches titanium rock-core tubes for future sample return, and tests oxygen production on Mars.',
      type: 'Space Missions',
      source: 'NASA / JPL',
      image: 'https://images-assets.nasa.gov/image/PIA24428/PIA24428~orig.jpg',
      url: 'https://science.nasa.gov/mission/mars-2020-perseverance/',
    },
    {
      id: 3,
      title: 'Mars Science Laboratory — Curiosity Rover at Gale Crater',
      description:
        'Discover how the nuclear-powered Curiosity rover proved that ancient Gale Crater hosted persistent freshwater lakes with the chemical ingredients required for microbial life.',
      type: 'Space Missions',
      source: 'NASA / JPL',
      image: 'https://images-assets.nasa.gov/image/PIA19808/PIA19808~orig.jpg',
      url: 'https://science.nasa.gov/mission/msl-curiosity/',
    },
    {
      id: 4,
      title: 'ESA Mars Express Orbital Reconnaissance Mission',
      description:
        'Learn how Europe’s longest-operating Mars orbiter maps subsurface water ice using radar, images Martian volcanoes in 3D stereo, and investigates atmospheric escape.',
      type: 'Space Missions',
      source: 'ESA',
      image: 'https://images-assets.nasa.gov/image/PIA00407/PIA00407~orig.jpg',
      url: 'https://www.esa.int/missions/about-us/directorates/science/mars-express',
    },
    {
      id: 5,
      title: 'Mars Planetary Fact Sheet & Comparative Telemetry',
      description:
        'Examine authoritative telemetry on Mars’s orbital eccentricity, surface gravity (3.71 m/s²), thin CO₂ atmosphere, seasonal pressure variations, and moons Phobos and Deimos.',
      type: 'Research & Discoveries',
      source: 'NASA GSFC / NSSDCA',
      image: 'https://images-assets.nasa.gov/image/PIA02376/PIA02376~orig.jpg',
      url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/marsfact.html',
    },
    {
      id: 6,
      title: 'HiRISE High-Resolution Martian Surface Imagery Catalog',
      description:
        'Browse thousands of sub-meter-resolution photographs taken by the Mars Reconnaissance Orbiter’s HiRISE camera—revealing sand dunes, avalanche plumes, and rover hardware on Mars.',
      type: 'Images & Media',
      source: 'NASA MRO / UArizona',
      image: 'https://images-assets.nasa.gov/image/PIA26344/PIA26344~orig.jpg',
      url: 'https://www.uahirise.org/',
    },
    {
      id: 7,
      title: 'Mars Facts, Moons & Student Exploration Guide',
      description:
        'An educational breakdown of Martian sols (24 hours, 37 minutes), planet-encircling dust storms, iron-oxide regolith, and why Mars is the primary target for human exploration.',
      type: 'Educational Materials',
      source: 'NASA Science',
      image: 'https://images-assets.nasa.gov/image/PIA17944/PIA17944~orig.jpg',
      url: 'https://science.nasa.gov/mars/facts/',
    },
    {
      id: 8,
      title: 'NASA Mars Trek — Interactive 3D Terrain & Landing Site Explorer',
      description:
        'Pan, zoom, and fly in 3D across the entire Martian globe—inspect Viking, Pathfinder, Spirit, Opportunity, Curiosity, InSight, and Perseverance landing sites with laser altimetry layers.',
      type: '3D & Interactive',
      source: 'NASA / JPL Trek',
      image: 'https://images-assets.nasa.gov/image/PIA00407/PIA00407~orig.jpg',
      url: 'https://trek.nasa.gov/mars/',
    },
  ],

  jupiter: [
    {
      id: 1,
      title: 'Jupiter: King of the Planets — Atmosphere, Magnetosphere & Moons',
      description:
        'Explore the largest planet in our Solar System, from its turbulent ammonia cloud bands and centuries-old Great Red Spot to its intense radiation belts and 95 known moons.',
      type: 'Scientific Articles',
      source: 'NASA Science',
      image: 'https://images-assets.nasa.gov/image/PIA02873/PIA02873~orig.jpg',
      url: 'https://science.nasa.gov/jupiter/',
    },
    {
      id: 2,
      title: 'Juno Mission at Jupiter — Deep Interior & Polar Cyclones',
      description:
        'Discover how NASA’s solar-powered Juno orbiter peers beneath Jupiter’s clouds to map its gravity field, dilute core, deep jet streams, and geometric clusters of polar cyclones.',
      type: 'Space Missions',
      source: 'NASA / JPL',
      image: 'https://images-assets.nasa.gov/image/PIA21974/PIA21974~orig.jpg',
      url: 'https://science.nasa.gov/mission/juno/',
    },
    {
      id: 3,
      title: 'Europa Clipper — Investigating an Ocean World',
      description:
        'Learn how NASA’s Europa Clipper spacecraft conducts dozens of close flybys of Jupiter’s icy moon Europa to measure its subsurface saltwater ocean and assess its habitability.',
      type: 'Space Missions',
      source: 'NASA / JPL',
      image: 'https://images-assets.nasa.gov/image/PIA19048/PIA19048~orig.jpg',
      url: 'https://science.nasa.gov/mission/europa-clipper/',
    },
    {
      id: 4,
      title: 'ESA JUICE — Jupiter Icy Moons Explorer',
      description:
        'Follow the European Space Agency’s flagship mission to the Jovian system as it studies Ganymede, Callisto, and Europa before becoming the first spacecraft to orbit an icy moon.',
      type: 'Space Missions',
      source: 'ESA',
      image: 'https://images-assets.nasa.gov/image/PIA01299/PIA01299~orig.jpg',
      url: 'https://www.esa.int/missions/about-us/directorates/science/juice',
    },
    {
      id: 5,
      title: 'Jupiter Planetary Fact Sheet & Magnetospheric Telemetry',
      description:
        'Review comprehensive physical and orbital measurements for Jupiter, its faint ring system, and the Galilean satellites (Io, Europa, Ganymede, and Callisto).',
      type: 'Research & Discoveries',
      source: 'NASA GSFC / NSSDCA',
      image: 'https://images-assets.nasa.gov/image/PIA00343/PIA00343~orig.jpg',
      url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/jupiterfact.html',
    },
    {
      id: 6,
      title: 'JunoCam Raw & Citizen-Processed Imagery Archive',
      description:
        'Explore breathtaking close-up images of Jupiter’s swirling cloud tops, Io’s volcanoes, and Europa’s fractured ice shell captured during Juno’s low-altitude perijove passes.',
      type: 'Images & Media',
      source: 'NASA / SwRI JunoCam',
      image: 'https://images-assets.nasa.gov/image/PIA22946/PIA22946~orig.jpg',
      url: 'https://www.missionjuno.swri.edu/junocam/',
    },
    {
      id: 7,
      title: 'Jupiter Facts & Galilean Moons Educational Guide',
      description:
        'Learn why Jupiter has the shortest day of any planet (under 10 hours), how liquid metallic hydrogen generates its massive magnetic field, and what Galileo discovered in 1610.',
      type: 'Educational Materials',
      source: 'NASA Science',
      image: 'https://images-assets.nasa.gov/image/PIA21775/PIA21775~orig.jpg',
      url: 'https://science.nasa.gov/jupiter/jupiter-facts/',
    },
    {
      id: 8,
      title: 'Eyes on the Solar System — Interactive 3D Jovian System',
      description:
        'Explore Jupiter, its radiation belts, the orbits of Io, Europa, Ganymede, and Callisto, and live trajectories of Juno and Europa Clipper in interactive 3D.',
      type: '3D & Interactive',
      source: 'NASA / JPL Eyes',
      image: 'https://images-assets.nasa.gov/image/PIA02879/PIA02879~orig.jpg',
      url: 'https://eyes.nasa.gov/apps/solar-system/#/jupiter',
    },
  ],

  saturn: [
    {
      id: 1,
      title: 'Saturn: The Ringed Jewel of the Solar System',
      description:
        'Explore Saturn’s internal structure, north polar hexagon jet stream, low bulk density, and complex system of icy rings and more than 140 moons.',
      type: 'Scientific Articles',
      source: 'NASA Science',
      image: 'https://images-assets.nasa.gov/image/PIA01482/PIA01482~orig.jpg',
      url: 'https://science.nasa.gov/saturn/',
    },
    {
      id: 2,
      title: 'Cassini-Huygens Flagship Mission to Saturn & Titan',
      description:
        'Relive the 13-year orbital tour of Saturn by the Cassini spacecraft and the historic landing of ESA’s Huygens probe on the methane-rich surface of Titan.',
      type: 'Space Missions',
      source: 'NASA / JPL / ESA',
      image: 'https://images-assets.nasa.gov/image/PIA17172/PIA17172~orig.jpg',
      url: 'https://science.nasa.gov/mission/cassini/',
    },
    {
      id: 3,
      title: 'Dragonfly Rotorcraft Lander Mission to Titan',
      description:
        'Discover how NASA’s nuclear-powered eight-bladed rotorcraft will fly across multiple landing sites on Saturn’s moon Titan to study prebiotic chemistry and habitability.',
      type: 'Space Missions',
      source: 'NASA / JHUAPL',
      image: 'https://images-assets.nasa.gov/image/PIA20016/PIA20016~orig.jpg',
      url: 'https://science.nasa.gov/mission/dragonfly/',
    },
    {
      id: 4,
      title: 'Enceladus Hydrothermal Plumes & Subsurface Ocean',
      description:
        'Learn how Cassini discovered towering geysers of water vapor, organic molecules, and molecular hydrogen erupting from the south polar "tiger stripes" of Saturn’s moon Enceladus.',
      type: 'Research & Discoveries',
      source: 'NASA Science',
      image: 'https://images-assets.nasa.gov/image/PIA19061/PIA19061~orig.jpg',
      url: 'https://science.nasa.gov/saturn/moons/enceladus/',
    },
    {
      id: 5,
      title: 'Saturn Planetary Fact Sheet & Ring System Parameters',
      description:
        'Access detailed orbital and physical parameters for Saturn, the D, C, B, A, F, G, and E rings, and major moons including Titan, Enceladus, Rhea, Iapetus, Dione, Tethys, and Mimas.',
      type: 'Research & Discoveries',
      source: 'NASA GSFC / NSSDCA',
      image: 'https://images-assets.nasa.gov/image/PIA08329/PIA08329~orig.jpg',
      url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/saturnfact.html',
    },
    {
      id: 6,
      title: 'NASA / JPL Saturn & Cassini Photojournal Gallery',
      description:
        'Explore iconic high-resolution imagery from Voyager and Cassini, including backlit ring mosaics, "The Day the Earth Smiled," propeller moonlets, and Saturn’s polar aurorae.',
      type: 'Images & Media',
      source: 'NASA / JPL Photojournal',
      image: 'https://images-assets.nasa.gov/image/PIA17172/PIA17172~orig.jpg',
      url: 'https://science.nasa.gov/photojournal/galleries/pj-saturn/',
    },
    {
      id: 7,
      title: 'Saturn Facts & Ring Dynamics Guide',
      description:
        'Understand how shepherd moons sculpt Saturn’s rings, why Saturn’s mean density is lower than liquid water, and how its 26.7-degree axial tilt produces 29-year seasonal cycles.',
      type: 'Educational Materials',
      source: 'NASA Science',
      image: 'https://images-assets.nasa.gov/image/PIA12567/PIA12567~orig.jpg',
      url: 'https://science.nasa.gov/saturn/facts/',
    },
    {
      id: 8,
      title: 'Eyes on the Solar System — Interactive 3D Saturn & Rings',
      description:
        'Navigate through Saturn’s main rings, trace Cassini’s Grand Finale orbits, and inspect Titan and Enceladus in interactive 3D inside NASA JPL’s Eyes on the Solar System.',
      type: '3D & Interactive',
      source: 'NASA / JPL Eyes',
      image: 'https://images-assets.nasa.gov/image/PIA08329/PIA08329~orig.jpg',
      url: 'https://eyes.nasa.gov/apps/solar-system/#/saturn',
    },
  ],

  uranus: [
    {
      id: 1,
      title: 'Uranus: The Sideways Ice Giant',
      description:
        'Explore the seventh planet from the Sun—an ice giant whose mantle of water, ammonia, and methane ices and extreme 97.77-degree axial tilt create 21-year-long polar seasons.',
      type: 'Scientific Articles',
      source: 'NASA Science',
      image: 'https://images-assets.nasa.gov/image/PIA18182/PIA18182~orig.jpg',
      url: 'https://science.nasa.gov/uranus/',
    },
    {
      id: 2,
      title: 'Voyager 2 Historic Flyby of the Uranian System',
      description:
        'Learn how NASA’s Voyager 2 spacecraft executed the only close-up reconnaissance of Uranus in January 1986, discovering 10 new moons, two new rings, and a tilted magnetic field.',
      type: 'Space Missions',
      source: 'NASA / JPL',
      image: 'https://images-assets.nasa.gov/image/PIA00032/PIA00032~orig.jpg',
      url: 'https://science.nasa.gov/mission/voyager/voyager-2/',
    },
    {
      id: 3,
      title: 'Moons of Uranus — Miranda, Ariel, Umbriel, Titania & Oberon',
      description:
        'Investigate the 28 known moons of Uranus, named after characters from Shakespeare and Alexander Pope—including Miranda’s 20-km-high Verona Rupes cliffs and potential subsurface oceans.',
      type: 'Research & Discoveries',
      source: 'NASA Science',
      image: 'https://images-assets.nasa.gov/image/PIA00040/PIA00040~orig.jpg',
      url: 'https://science.nasa.gov/uranus/moons/',
    },
    {
      id: 4,
      title: 'Uranus Planetary Fact Sheet & Ring/Satellite Telemetry',
      description:
        'Examine authoritative physical, atmospheric, magnetospheric, and ring system data for Uranus compiled by NASA Goddard Space Flight Center.',
      type: 'Research & Discoveries',
      source: 'NASA GSFC / NSSDCA',
      image: 'https://images-assets.nasa.gov/image/PIA17306/PIA17306~orig.jpg',
      url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/uranusfact.html',
    },
    {
      id: 5,
      title: 'Uranus Facts & Discovery History',
      description:
        'Discover how William Herschel identified Uranus in 1781—the first planet found with a telescope—and why methane gas gives its upper atmosphere a serene cyan-blue hue.',
      type: 'Educational Materials',
      source: 'NASA Science',
      image: 'https://images-assets.nasa.gov/image/PIA18182/PIA18182~orig.jpg',
      url: 'https://science.nasa.gov/uranus/facts/',
    },
    {
      id: 6,
      title: 'Eyes on the Solar System — Interactive 3D Uranus Explorer',
      description:
        'Inspect Uranus’s 13 faint rings, its sideways rotation axis, and the orbital planes of Miranda, Ariel, Umbriel, Titania, and Oberon in interactive 3D.',
      type: '3D & Interactive',
      source: 'NASA / JPL Eyes',
      image: 'https://images-assets.nasa.gov/image/PIA01280/PIA01280~orig.jpg',
      url: 'https://eyes.nasa.gov/apps/solar-system/#/uranus',
    },
  ],

  neptune: [
    {
      id: 1,
      title: 'Neptune: The Supersonic Wind & Ice Giant',
      description:
        'Explore the eighth and farthest known major planet in our Solar System, orbiting 30 times farther from the Sun than Earth and whipped by supersonic winds exceeding 2,000 km/h.',
      type: 'Scientific Articles',
      source: 'NASA Science',
      image: 'https://images-assets.nasa.gov/image/PIA01492/PIA01492~orig.jpg',
      url: 'https://science.nasa.gov/neptune/',
    },
    {
      id: 2,
      title: 'Voyager 2 Interstellar Mission & 1989 Neptune Encounter',
      description:
        'Review Voyager 2’s August 1989 flyby within 4,950 km of Neptune’s north pole, which revealed the Great Dark Spot, six new moons, four complete rings, and active geysers on Triton.',
      type: 'Space Missions',
      source: 'NASA / JPL',
      image: 'https://images-assets.nasa.gov/image/PIA00046/PIA00046~orig.jpg',
      url: 'https://voyager.jpl.nasa.gov/',
    },
    {
      id: 3,
      title: 'Triton: Neptune’s Captured Kuiper Belt Moon & Nitrogen Geysers',
      description:
        'Discover why Neptune’s largest moon Triton orbits backward (retrograde), exhibits cantaloupe-like cryovolcanic terrain, and erupts dark plumes of nitrogen gas 8 km above its icy crust.',
      type: 'Research & Discoveries',
      source: 'NASA Science',
      image: 'https://images-assets.nasa.gov/image/PIA00317/PIA00317~orig.jpg',
      url: 'https://science.nasa.gov/neptune/moons/triton/',
    },
    {
      id: 4,
      title: 'Neptune Planetary Fact Sheet & Ring Arcs Data',
      description:
        'Reference verified orbital elements, internal heat balance, magnetic field offset, ring parameters (Galle, Le Verrier, Lassell, Arago, and Adams), and satellite data for Neptune.',
      type: 'Research & Discoveries',
      source: 'NASA GSFC / NSSDCA',
      image: 'https://images-assets.nasa.gov/image/PIA02245/PIA02245~orig.jpg',
      url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/neptunefact.html',
    },
    {
      id: 5,
      title: 'Neptune Facts & Mathematical Prediction Story',
      description:
        'Learn how Urbain Le Verrier and John Couch Adams predicted Neptune’s existence using mathematics in 1846 before it was seen through a telescope, and how Neptune completed its first 165-year orbit in 2011.',
      type: 'Educational Materials',
      source: 'NASA Science',
      image: 'https://images-assets.nasa.gov/image/PIA01492/PIA01492~orig.jpg',
      url: 'https://science.nasa.gov/neptune/neptune-facts/',
    },
    {
      id: 6,
      title: 'Eyes on the Solar System — Interactive 3D Neptune & Triton',
      description:
        'Explore Neptune, its clumpy Adams ring arcs, Triton’s inclined retrograde orbit, and Voyager 2’s gravity-assist trajectory in interactive 3D.',
      type: '3D & Interactive',
      source: 'NASA / JPL Eyes',
      image: 'https://images-assets.nasa.gov/image/PIA00046/PIA00046~orig.jpg',
      url: 'https://eyes.nasa.gov/apps/solar-system/#/neptune',
    },
  ],

  moon: [
    {
      id: 1,
      title: 'Earth’s Moon: Formation, Geology & Exploration',
      description:
        'Explore Earth’s natural satellite—from the giant impact hypothesis and volcanic basaltic maria to permanently shadowed polar craters holding water ice.',
      type: 'Scientific Articles',
      source: 'NASA Science',
      image: 'https://images-assets.nasa.gov/image/PIA00405/PIA00405~orig.jpg',
      url: 'https://science.nasa.gov/moon/',
    },
    {
      id: 2,
      title: 'The Apollo Program — Historic Human Lunar Landings',
      description:
        'Discover how six Apollo missions (Apollo 11, 12, 14, 15, 16, and 17) landed 12 astronauts on the Moon between 1969 and 1972, returning 382 kg of lunar rocks and regolith.',
      type: 'Space Missions',
      source: 'NASA History',
      image: 'https://images-assets.nasa.gov/image/AS11-40-5878/AS11-40-5878~orig.jpg',
      url: 'https://www.nasa.gov/the-apollo-program/',
    },
    {
      id: 3,
      title: 'Lunar Reconnaissance Orbiter (LRO) Mission',
      description:
        'Learn how NASA’s Lunar Reconnaissance Orbiter has mapped the Moon in meter-scale 3D resolution since 2009, imaging Apollo descent stages, rover tracks, and polar ice deposits.',
      type: 'Space Missions',
      source: 'NASA GSFC',
      image: 'https://images-assets.nasa.gov/image/PIA13517/PIA13517~orig.jpg',
      url: 'https://science.nasa.gov/mission/lro/',
    },
    {
      id: 4,
      title: 'NASA Artemis Program — Returning Humans to the Moon',
      description:
        'Follow NASA’s Artemis campaign to establish sustainable human exploration around the lunar south pole as a stepping stone for future crewed missions to Mars.',
      type: 'Space Missions',
      source: 'NASA',
      image: 'https://images-assets.nasa.gov/image/NHQ202211160002/NHQ202211160002~orig.jpg',
      url: 'https://www.nasa.gov/humans-in-space/artemis/',
    },
    {
      id: 5,
      title: 'Moon Planetary Fact Sheet & Orbital Parameters',
      description:
        'Examine authoritative lunar physical constants, synchronous tidal locking data, orbital recession rate (3.8 cm/year), and crust/mantle seismic parameters.',
      type: 'Research & Discoveries',
      source: 'NASA GSFC / NSSDCA',
      image: 'https://images-assets.nasa.gov/image/AS11-44-6551/AS11-44-6551~orig.jpg',
      url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html',
    },
    {
      id: 6,
      title: 'Moon Facts — Phases, Eclipses & Tides Guide',
      description:
        'Learn how the Moon stabilizes Earth’s axial tilt, drives ocean tides, and produces solar and lunar eclipses across its 29.5-day synodic cycle.',
      type: 'Educational Materials',
      source: 'NASA Science',
      image: 'https://images-assets.nasa.gov/image/PIA00405/PIA00405~orig.jpg',
      url: 'https://science.nasa.gov/moon/facts/',
    },
    {
      id: 7,
      title: 'NASA Moon Trek — Interactive 3D Lunar Atlas',
      description:
        'Explore the entire lunar surface interactively in 2D and 3D—inspect Apollo, Surveyor, and Luna landing sites, elevation maps, and mineralogical overlays.',
      type: '3D & Interactive',
      source: 'NASA / JPL Trek',
      image: 'https://images-assets.nasa.gov/image/PIA13517/PIA13517~orig.jpg',
      url: 'https://trek.nasa.gov/moon/',
    },
  ],

  sun: [
    {
      id: 1,
      title: 'The Sun: Heliophysics, Solar Activity & Space Weather',
      description:
        'Explore the G-type main-sequence star at the heart of our Solar System, whose nuclear fusion core, magnetic dynamo, solar flares, and coronal mass ejections shape the heliosphere.',
      type: 'Scientific Articles',
      source: 'NASA Science',
      image:
        'https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e001435/GSFC_20171208_Archive_e001435~orig.jpg',
      url: 'https://science.nasa.gov/sun/',
    },
    {
      id: 2,
      title: 'Parker Solar Probe — Touching the Sun’s Corona',
      description:
        'Follow the fastest human-made spacecraft in history as it dives directly through the Sun’s outer atmosphere behind a carbon-composite heat shield to solve the coronal heating mystery.',
      type: 'Space Missions',
      source: 'NASA / JHUAPL',
      image: 'https://images-assets.nasa.gov/image/PIA22506/PIA22506~orig.jpg',
      url: 'https://science.nasa.gov/mission/parker-solar-probe/',
    },
    {
      id: 3,
      title: 'ESA / NASA Solar Orbiter — Imaging the Sun’s Poles',
      description:
        'Discover how Solar Orbiter combines close-up remote-sensing telescopes and in-situ plasma instruments to capture the first high-latitude views of the Sun’s polar magnetic fields.',
      type: 'Space Missions',
      source: 'ESA / NASA',
      image: 'https://images-assets.nasa.gov/image/PIA23863/PIA23863~orig.jpg',
      url: 'https://www.esa.int/missions/about-us/directorates/science/solar-orbiter',
    },
    {
      id: 4,
      title: 'Sun Fact Sheet — Solar Interior, Photosphere & Corona Data',
      description:
        'Reference verified solar astrophysics parameters—including luminosity, core temperature (15.7 million K), photospheric composition, sunspot cycles, and solar wind velocity.',
      type: 'Research & Discoveries',
      source: 'NASA GSFC / NSSDCA',
      image: 'https://images-assets.nasa.gov/image/PIA17669/PIA17669~orig.jpg',
      url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/sunfact.html',
    },
    {
      id: 5,
      title: 'NASA Solar Dynamics Observatory (SDO) Live Extreme-UV Imagery',
      description:
        'View near-real-time multi-wavelength extreme ultraviolet images and magnetograms of the Sun showing coronal loops, solar flares, and active sunspot regions.',
      type: 'Images & Media',
      source: 'NASA GSFC SDO',
      image:
        'https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e000393/GSFC_20171208_Archive_e000393~orig.jpg',
      url: 'https://sdo.gsfc.nasa.gov/',
    },
    {
      id: 6,
      title: 'Sun Facts — Structure, 11-Year Solar Cycle & Heliosphere',
      description:
        'Learn how the Sun contains 99.86% of the Solar System’s mass, how energy travels from the radiative zone to the convection zone, and how solar storms trigger auroras on Earth.',
      type: 'Educational Materials',
      source: 'NASA Science',
      image: 'https://images-assets.nasa.gov/image/PIA03149/PIA03149~orig.jpg',
      url: 'https://science.nasa.gov/sun/facts/',
    },
    {
      id: 7,
      title: 'Eyes on the Solar System — Interactive 3D Sun & Heliophysics',
      description:
        'Explore the Sun in interactive 3D and track the live orbits of Parker Solar Probe, Solar Orbiter, and SOHO across the inner Solar System.',
      type: '3D & Interactive',
      source: 'NASA / JPL Eyes',
      image:
        'https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e001435/GSFC_20171208_Archive_e001435~orig.jpg',
      url: 'https://eyes.nasa.gov/apps/solar-system/#/sun',
    },
  ],
};
