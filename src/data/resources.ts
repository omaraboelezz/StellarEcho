
export type ResourceType =
  | "Article"
  | "Video"
  | "Research"
  | "Explore";

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
  mars: [
    {
      id: 1,
      title: "Discover Mars",
      description:
        "Explore the Red Planet, its atmosphere, surface, and fascinating discoveries.",
      type: "Article",
      source: "NASA",
      image: "https://images-assets.nasa.gov/image/PIA04591/PIA04591~orig.jpg",
      url: "https://science.nasa.gov/mars/",
    },
    {
      id: 2,
      title: "Explore Mars in 3D",
      description:
        "Explore the Martian surface through interactive maps and terrain.",
      type: "Explore",
      source: "NASA Trek",
      image: "https://images-assets.nasa.gov/image/PIA00407/PIA00407~orig.jpg",
      url: "https://trek.nasa.gov/mars/",
    },
    {
      id: 3,
      title: "Mars Missions",
      description:
        "Discover the robotic missions that explore and investigate Mars.",
      type: "Video",
      source: "NASA",
      image: "https://images-assets.nasa.gov/image/PIA26344/PIA26344~orig.jpg",
      url: "https://science.nasa.gov/mars/missions/",
    },
    {
      id: 4,
      title: "Planetary Science",
      description:
        "Explore scientific research, discoveries, and planetary datasets.",
      type: "Research",
      source: "NASA",
      image: "https://images-assets.nasa.gov/image/PIA02376/PIA02376~orig.jpg",
      url: "https://science.nasa.gov/planetary-science/",
    },
  ],

  moon: [
    {
      id: 1,
      title: "Explore Earth's Moon",
      description:
        "Learn about the Moon's formation, surface, and geological history.",
      type: "Article",
      source: "NASA",
      image: "https://images-assets.nasa.gov/image/PIA00405/PIA00405~orig.jpg",
      url: "https://science.nasa.gov/moon/",
    },
    {
      id: 2,
      title: "Moon Trek",
      description:
        "Explore lunar terrain, craters, and landing sites interactively.",
      type: "Explore",
      source: "NASA",
      image: "https://images-assets.nasa.gov/image/PIA13517/PIA13517~orig.jpg",
      url: "https://trek.nasa.gov/moon/",
    },
    {
      id: 3,
      title: "Apollo Missions",
      description:
        "Discover the historic missions that took humans to the Moon.",
      type: "Video",
      source: "NASA",
      image: "https://images-assets.nasa.gov/image/AS11-40-5878/AS11-40-5878~orig.jpg",
      url: "https://www.nasa.gov/the-apollo-program/",
    },
  ],

  mercury: [
    {
      id: 1,
      title: "Discover Mercury",
      description: "Explore the smallest planet in our Solar System.",
      type: "Article",
      source: "NASA",
      image: "https://images-assets.nasa.gov/image/PIA15162/PIA15162~orig.jpg",
      url: "https://science.nasa.gov/mercury/",
    },
  ],

  venus: [
    {
      id: 1,
      title: "Discover Venus",
      description: "Learn about the hottest planet in our Solar System.",
      type: "Article",
      source: "NASA",
      image: "https://images-assets.nasa.gov/image/PIA00271/PIA00271~orig.jpg",
      url: "https://science.nasa.gov/venus/",
    },
  ],

  earth: [
    {
      id: 1,
      title: "Our Home Planet",
      description: "Explore Earth's atmosphere, oceans, and ecosystems.",
      type: "Article",
      source: "NASA",
      image: "https://images-assets.nasa.gov/image/PIA18033/PIA18033~orig.jpg",
      url: "https://science.nasa.gov/earth/",
    },
  ],

  jupiter: [
    {
      id: 1,
      title: "Discover Jupiter",
      description: "Explore the giant planet and its mysterious atmosphere.",
      type: "Article",
      source: "NASA",
      image: "https://images-assets.nasa.gov/image/PIA02873/PIA02873~orig.jpg",
      url: "https://science.nasa.gov/jupiter/",
    },
  ],

  saturn: [
    {
      id: 1,
      title: "Discover Saturn",
      description: "Explore Saturn's spectacular rings and moons.",
      type: "Article",
      source: "NASA",
      image: "https://images-assets.nasa.gov/image/PIA01482/PIA01482~orig.jpg",
      url: "https://science.nasa.gov/saturn/",
    },
  ],

  uranus: [
    {
      id: 1,
      title: "Discover Uranus",
      description: "Learn about the mysterious ice giant.",
      type: "Article",
      source: "NASA",
      image: "https://images-assets.nasa.gov/image/PIA18182/PIA18182~orig.jpg",
      url: "https://science.nasa.gov/uranus/",
    },
  ],

  neptune: [
    {
      id: 1,
      title: "Discover Neptune",
      description: "Explore the distant blue ice giant.",
      type: "Article",
      source: "NASA",
      image: "https://images-assets.nasa.gov/image/PIA01492/PIA01492~orig.jpg",
      url: "https://science.nasa.gov/neptune/",
    },
  ],
};
