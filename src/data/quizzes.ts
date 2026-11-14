// src/data/quizzes.ts
//
// Educational mission quizzes for every equipment landmark in `src/data/landmarks.ts`.
// Every question, option, and explanation is derived strictly from the mission timeline
// chapters (`mission`, `why`, `events`, `fate`, `science`, and `facts`) shown to the student.

export interface QuizQuestion {
  id: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanation: string;
}

export interface LandmarkQuiz {
  landmarkId: string;
  title: string;
  description: string;
  xpReward: number;
  questions: QuizQuestion[];
}

export const landmarkQuizzes: Record<string, LandmarkQuiz> = {
  spirit: {
    landmarkId: 'spirit',
    title: 'Test Your Mission Knowledge: Spirit Rover',
    description:
      'Review what you discovered along the Spirit Rover timeline — from its landing in Gusev crater to its scientific discoveries in the Columbia Hills.',
    xpReward: 100,
    questions: [
      {
        id: 'spirit-q1',
        question: 'What was the primary scientific mission of NASA’s Spirit rover?',
        options: [
          'To act as a robot geologist looking for signs that Mars once had liquid water',
          'To drill into the Martian polar ice caps in search of frozen methane',
          'To return Martian rock samples directly back to Earth on a rocket',
          'To measure the thickness of Mars’s global magnetic field from orbit',
        ],
        correctIndex: 0,
        explanation:
          'Spirit was one of two NASA Mars Exploration Rovers built as a robot geologist to look for signs that Mars once had liquid water.',
      },
      {
        id: 'spirit-q2',
        question: 'Why did scientists choose Gusev crater as Spirit’s landing site on 4 January 2004?',
        options: [
          'It was the highest volcanic peak on Mars',
          'Scientists suspected the basin was once an ancient lake bed',
          'Orbiters had spotted active geysers erupting from its floor',
          'It was the only region on Mars free of sand and dust',
        ],
        correctIndex: 1,
        explanation:
          'Spirit landed in Gusev crater because scientists suspected the basin was once an ancient lake bed.',
      },
      {
        id: 'spirit-q3',
        question: 'Although designed for a 90-day mission, how long did Spirit actually operate and how far did it drive?',
        options: [
          'About 6 months and 1.2 kilometres',
          'More than six years and about 7.7 kilometres, climbing the Columbia Hills',
          'Nearly 14 years and 45 kilometres across Meridiani Planum',
          'Exactly 90 days before its parachute failed',
        ],
        correctIndex: 1,
        explanation:
          'Designed for 90 days, Spirit worked for more than six years and drove about 7.7 kilometres, climbing the Columbia Hills.',
      },
      {
        id: 'spirit-q4',
        question: 'What ultimately ended Spirit’s mobility in 2009?',
        options: [
          'It broke through crusty soil into soft sand at a place called Troy and could not escape',
          'Its solar panels failed to open completely upon landing',
          'A software error shut its engines off several kilometres above the ground',
          'It ran out of fuel and deliberately crashed into a crater',
        ],
        correctIndex: 0,
        explanation:
          'In 2009 Spirit broke through crusty soil into soft sand at a place called Troy and could not escape, sending its last message in March 2010.',
      },
      {
        id: 'spirit-q5',
        question: 'What key geological evidence did Spirit’s wheel-dragging trenches expose?',
        options: [
          'Water ice in permanently shadowed polar craters',
          'Silica-rich deposits pointing to ancient hot springs or steam vents that could have supported microbial life',
          'Basalt-like volcanic rock under crushing 90-bar atmospheric pressure',
          'A laser reflector used to measure the Earth–Mars distance',
        ],
        correctIndex: 1,
        explanation:
          'Spirit’s wheel-dragging trenches exposed bright soil containing silica-rich deposits that point to ancient hot springs or steam vents — an environment that could have supported microbial life.',
      },
    ],
  },

  opportunity: {
    landmarkId: 'opportunity',
    title: 'Test Your Mission Knowledge: Opportunity Rover',
    description:
      'Challenge your understanding of Opportunity’s nearly 14-year journey across Meridiani Planum and the story of water it uncovered on Mars.',
    xpReward: 100,
    questions: [
      {
        id: 'opportunity-q1',
        question: 'Why was Meridiani Planum selected as Opportunity’s landing site on 25 January 2004?',
        options: [
          'Orbiters had detected hematite, a mineral that often forms in water',
          'It contained permanently shadowed craters filled with water ice',
          'It was a smooth lunar lava plain known as Mare Imbrium',
          'Scientists wanted to test a radioactive heater during the two-week night',
        ],
        correctIndex: 0,
        explanation:
          'Opportunity landed on Meridiani Planum because orbiters had detected hematite, a mineral that often forms in water.',
      },
      {
        id: 'opportunity-q2',
        question: 'Planned for 90 days, how long did Opportunity operate and how far did it drive before finishing at Perseverance Valley?',
        options: [
          'About eleven months and roughly 10 kilometres',
          'More than six years and about 7.7 kilometres',
          'Nearly 14 years and about 45 kilometres — more than a marathon',
          'Four years in orbit before running out of fuel',
        ],
        correctIndex: 2,
        explanation:
          'Planned for 90 days, Opportunity ran for nearly 14 years (roughly fifty times longer than planned) and drove about 45 kilometres, finishing at Perseverance Valley.',
      },
      {
        id: 'opportunity-q3',
        question: 'What caused Opportunity to fall silent in June 2018?',
        options: [
          'It broke through crusty soil into soft sand at Troy',
          'A planet-wide dust storm blocked the sunlight that powered its solar panels',
          'Its solar petals only partly opened and blocked its own antenna',
          'Extreme 460 °C heat and crushing atmospheric pressure destroyed its electronics',
        ],
        correctIndex: 1,
        explanation:
          'In June 2018 a planet-wide dust storm blocked the sunlight that powered the solar-powered rover; its last signal arrived on 10 June 2018.',
      },
      {
        id: 'opportunity-q4',
        question: 'What nickname did scientists give to the tiny hematite spheres Opportunity discovered on Mars?',
        options: [
          'Pearls',
          'Blueberries',
          'Marbles',
          'Cinders',
        ],
        correctIndex: 1,
        explanation:
          'Opportunity found tiny hematite spheres nicknamed "blueberries" along with sulfate-rich rocks formed in salty, acidic water.',
      },
      {
        id: 'opportunity-q5',
        question: 'How was Opportunity’s final transmission in 2018 later poetically paraphrased?',
        options: [
          'That its battery was low and it was getting dark',
          'That the Eagle had landed in the Sea of Tranquility',
          'That its parachute had been released early above the ground',
          'That it had found silica deposits in ancient steam vents',
        ],
        correctIndex: 0,
        explanation:
          'Opportunity’s final transmission during the global dust storm was later poetically paraphrased as a message that its battery was low and it was getting dark.',
      },
    ],
  },

  beagle2: {
    landmarkId: 'beagle2',
    title: 'Test Your Mission Knowledge: Beagle 2',
    description:
      'See how well you know the story of the British Beagle 2 lander — from its 2003 Christmas Day landing to its rediscovery from orbit.',
    xpReward: 100,
    questions: [
      {
        id: 'beagle2-q1',
        question: 'Which spacecraft carried the British Beagle 2 lander to Mars, and what was Beagle 2 built to search for?',
        options: [
          'Carried by ESA’s Mars Express to search for chemical signs of life',
          'Carried by Apollo 11 to collect 21 kilograms of rock',
          'Carried by a Soviet flyby craft to photograph Venus in colour',
          'Carried by ExoMars to test a descent radar sensor',
        ],
        correctIndex: 0,
        explanation:
          'Beagle 2 was a small British lander carried to Mars by ESA’s Mars Express, built to search for chemical signs of life.',
      },
      {
        id: 'beagle2-q2',
        question: 'Why was Isidis Planitia chosen as Beagle 2’s landing zone?',
        options: [
          'It is the deepest volcanic canyon on Mars',
          'It is a permanently shadowed crater near the north pole',
          'It is a flat sedimentary basin that may have been shaped by water, making it a safe and promising place to dig for clues',
          'It is a smooth lunar basalt plain free of boulders',
        ],
        correctIndex: 2,
        explanation:
          'Isidis Planitia is a flat sedimentary basin that may have been shaped by water, making it a safe and promising place to dig for clues.',
      },
      {
        id: 'beagle2-q3',
        question: 'When was Beagle 2 due to land on Mars, and how long was it missing before being spotted from orbit?',
        options: [
          '4 January 2004; it was missing for six years',
          '16 October 2016; it was found three days later',
          '20 July 1969; it was never lost',
          'Christmas Day 2003; it was missing for eleven years until 2015',
        ],
        correctIndex: 3,
        explanation:
          'Beagle 2 separated from Mars Express in December 2003 and was due to land on Christmas Day, remaining missing for eleven years until 2015.',
      },
      {
        id: 'beagle2-q4',
        question: 'What did NASA’s orbiter reveal in 2015 about what happened to Beagle 2?',
        options: [
          'It had burned up completely in the upper Martian atmosphere',
          'It had landed safely, but its solar panels had only partly opened and blocked its own antenna',
          'It had fallen into a deep volcanic vent in the Columbia Hills',
          'Its parachute had released several kilometres above the ground',
        ],
        correctIndex: 1,
        explanation:
          'In 2015 NASA’s orbiter spotted Beagle 2 intact on the surface: it had landed safely, but its solar panels had only partly opened and blocked its own antenna.',
      },
      {
        id: 'beagle2-q5',
        question: 'Which unique cultural items were carried aboard Beagle 2?',
        options: [
          'A laser reflector still used to measure the Earth–Moon distance',
          'A radioactive polonium heater designed for the two-week night',
          'A calibration target decorated by artist Damien Hirst and a call sign composed by the band Blur',
          'Colour panorama cameras built to withstand 460 °C heat',
        ],
        correctIndex: 2,
        explanation:
          'Beagle 2 carried a calibration target decorated by artist Damien Hirst and a call sign composed by the band Blur.',
      },
    ],
  },

  schiaparelli: {
    landmarkId: 'schiaparelli',
    title: 'Test Your Mission Knowledge: Schiaparelli Lander',
    description:
      'Test your understanding of ESA’s 2016 Schiaparelli test lander, what happened during its descent, and how its data helped future missions.',
    xpReward: 100,
    questions: [
      {
        id: 'schiaparelli-q1',
        question: 'What was the main purpose of ESA’s Schiaparelli lander in 2016?',
        options: [
          'To prove that Europe could land on Mars, ahead of the ExoMars rover',
          'To rove 45 kilometres across Meridiani Planum using solar power',
          'To map Mercury’s off-centre magnetic field from orbit',
          'To drill into the basaltic surface of Venus',
        ],
        correctIndex: 0,
        explanation:
          'Schiaparelli was a European test lander designed to prove that Europe could land on Mars ahead of the ExoMars rover.',
      },
      {
        id: 'schiaparelli-q2',
        question: 'Why was Meridiani Planum chosen for Schiaparelli’s landing attempt?',
        options: [
          'It is wide, flat, and low, making it one of the safest landing zones on Mars for a first attempt',
          'It has steep mountain slopes ideal for testing climbing wheels',
          'It is permanently shadowed from sunlight',
          'It is an active volcanic caldera',
        ],
        correctIndex: 0,
        explanation:
          'Meridiani Planum is wide, flat, and low, which makes it one of the safest landing zones on Mars for a first attempt.',
      },
      {
        id: 'schiaparelli-q3',
        question: 'What specific malfunction caused Schiaparelli to crash on 19 October 2016?',
        options: [
          'Its heat shield failed to separate during atmospheric entry',
          'A sensor briefly gave bad data, leading the computer to believe it was already on the ground and shut off the parachute and engines early',
          'A global dust storm blocked its solar arrays after landing',
          'Its wheels broke through crusty soil into soft sand',
        ],
        correctIndex: 1,
        explanation:
          'A sensor briefly gave bad data, causing the computer to believe it was already on the ground; it released the parachute early and shut the engines off while still several kilometres up.',
      },
      {
        id: 'schiaparelli-q4',
        question: 'How did the Schiaparelli mission still contribute to European Mars exploration?',
        options: [
          'Data gathered during descent was thoroughly analysed and used to fix the landing system for the later ExoMars rover mission',
          'It operated as a stationary weather station for six years',
          'It returned 21 kilograms of soil samples to Earth',
          'It discovered tiny hematite spheres nicknamed blueberries',
        ],
        correctIndex: 0,
        explanation:
          'The failure was thoroughly analysed, and the telemetry gathered during descent was used to fix the landing system for the later ExoMars rover mission.',
      },
      {
        id: 'schiaparelli-q5',
        question: 'What did orbiter images show at Schiaparelli’s landing site after the impact?',
        options: [
          'An intact lander with partially opened solar petals',
          'A dark impact scar and the white parachute lying a short distance away',
          'Bright silica-rich trenches dug by dragging wheels',
          'A 16-metre crater near Mercury’s north pole',
        ],
        correctIndex: 1,
        explanation:
          'Orbiter images showed a dark impact scar and the white parachute lying a short distance away.',
      },
    ],
  },

  apollo11: {
    landmarkId: 'apollo11',
    title: 'Test Your Mission Knowledge: Tranquility Base (Apollo 11)',
    description:
      'Test what you learned about humanity’s first landing on another world at Tranquility Base on 20 July 1969.',
    xpReward: 100,
    questions: [
      {
        id: 'apollo11-q1',
        question: 'Which lunar module carried Neil Armstrong and Buzz Aldrin to the Moon’s surface on 20 July 1969?',
        options: [
          'Eagle',
          'Beagle 2',
          'Lunokhod 1',
          'Messenger',
        ],
        correctIndex: 0,
        explanation:
          'Apollo 11’s lunar module Eagle took Neil Armstrong and Buzz Aldrin to the surface at the Sea of Tranquility on 20 July 1969.',
      },
      {
        id: 'apollo11-q2',
        question: 'Why was the Sea of Tranquility chosen for the Apollo 11 landing?',
        options: [
          'It contains permanently shadowed polar craters filled with water ice',
          'It is a smooth, flat plain chosen so the first landing would be as safe as possible',
          'It is the tallest mountain range on the Moon',
          'It was where Lunokhod 1 had already landed a year earlier',
        ],
        correctIndex: 1,
        explanation:
          'The Sea of Tranquility is a smooth, flat plain, chosen so the first human landing would be as safe as possible.',
      },
      {
        id: 'apollo11-q3',
        question: 'Approximately how much lunar rock did the Apollo 11 astronauts collect during their two and a half hours outside?',
        options: [
          'Around 200 kilograms',
          'Less than 1 kilogram',
          'Around 21 kilograms',
          'Around 460 kilograms',
        ],
        correctIndex: 2,
        explanation:
          'The astronauts spent about two and a half hours outside, collecting around 21 kilograms of rock and setting up experiments.',
      },
      {
        id: 'apollo11-q4',
        question: 'What ongoing scientific measurement is still made today using equipment left behind at Tranquility Base?',
        options: [
          'A seismometer powered by solar panels still broadcasts daily voice recordings',
          'A drill continues to analyze basaltic soil under 90 atmospheres of pressure',
          'An antenna relays telemetry from Mars orbiters',
          'A laser reflector left on the surface is still used to measure the Earth–Moon distance, showing the Moon drifts away by about 3.8 cm per year',
        ],
        correctIndex: 3,
        explanation:
          'A laser reflector left on the lunar surface is still used to measure the Earth–Moon distance, revealing that the Moon drifts away from Earth by about 3.8 centimetres each year.',
      },
      {
        id: 'apollo11-q5',
        question: 'Why can Armstrong’s boot prints at Tranquility Base last for millions of years?',
        options: [
          'Because the lunar soil immediately melted into solid glass',
          'Because the Moon has no wind or rain to erase them',
          'Because a protective dome was placed over the landing site',
          'Because the Sea of Tranquility is covered in liquid water',
        ],
        correctIndex: 1,
        explanation:
          'Armstrong’s boot prints can last for millions of years because the Moon has no wind or rain to erase them.',
      },
    ],
  },

  lunokhod1: {
    landmarkId: 'lunokhod1',
    title: 'Test Your Mission Knowledge: Lunokhod 1',
    description:
      'Review the story of Lunokhod 1 — the first remote-controlled robotic rover on another world.',
    xpReward: 100,
    questions: [
      {
        id: 'lunokhod1-q1',
        question: 'What historic milestone did the Soviet Union’s Lunokhod 1 achieve in 1970?',
        options: [
          'It was the first remote-controlled robotic rover on another world, driven by a team of operators on Earth',
          'It carried the first human astronauts to Mare Imbrium',
          'It was the first spacecraft to orbit Mercury',
          'It returned the first colour panoramas from the surface of Venus',
        ],
        correctIndex: 0,
        explanation:
          'Lunokhod 1 was the first remote-controlled robotic rover on another world, driven by a team of operators on Earth.',
      },
      {
        id: 'lunokhod1-q2',
        question: 'Planned to last three months, how long did Lunokhod 1 actually operate on Mare Imbrium?',
        options: [
          'Only 127 minutes before extreme heat ended the mission',
          'About eleven months, covering roughly ten kilometres and sending back more than twenty thousand images',
          'Nearly 14 years and 45 kilometres',
          'Three days before a sensor error shut off its engines',
        ],
        correctIndex: 1,
        explanation:
          'Planned to last three months, Lunokhod 1 operated for about eleven months, covering roughly ten kilometres and sending back more than twenty thousand images.',
      },
      {
        id: 'lunokhod1-q3',
        question: 'How did Lunokhod 1 survive the freezing two-week lunar night, and why did it eventually fall silent in September 1971?',
        options: [
          'It used wind turbines that stopped spinning during a dust storm',
          'Its solar panels failed to open upon landing',
          'It relied on a radioactive heater to survive the lunar night, and fell silent when that heat source ran out',
          'It ran out of rocket fuel and crashed into a crater',
        ],
        correctIndex: 2,
        explanation:
          'Lunokhod 1 relied on a radioactive heater to survive the freezing two-week lunar night; in September 1971 that heat source ran out and the rover fell silent.',
      },
      {
        id: 'lunokhod1-q4',
        question: 'How was Lunokhod 1 rediscovered nearly forty years after it went quiet?',
        options: [
          'Astronauts walked to Mare Imbrium and repaired its antenna',
          'It began transmitting radio signals again on Christmas Day',
          'Mars Express detected its call sign from orbit',
          'In 2010 NASA’s Lunar Reconnaissance Orbiter photographed it, and scientists bounced a laser off its reflector',
        ],
        correctIndex: 3,
        explanation:
          'In 2010 NASA’s Lunar Reconnaissance Orbiter photographed Lunokhod 1 on the surface, and scientists successfully bounced a laser off its reflector forty years after it went quiet.',
      },
      {
        id: 'lunokhod1-q5',
        question: 'What challenge did the human drivers on Earth face while steering Lunokhod 1 across the Moon?',
        options: [
          'Thick sulfuric-acid clouds completely hid the lunar surface from view',
          'They had to cope with a signal delay of over a second in each direction',
          'The Moon rotates faster than once per hour',
          'The rover had no cameras and could only navigate by magnetic compass',
        ],
        correctIndex: 1,
        explanation:
          'Drivers on Earth had to cope with a radio signal delay of over a second in each direction while steering the rover.',
      },
    ],
  },

  venera13: {
    landmarkId: 'venera13',
    title: 'Test Your Mission Knowledge: Venera 13',
    description:
      'Test your knowledge of the Soviet Venera 13 lander and its 127-minute survival on the scorching surface of Venus.',
    xpReward: 100,
    questions: [
      {
        id: 'venera13-q1',
        question: 'Why was landing a spacecraft like Venera 13 the only way to see the ground of Venus in 1982?',
        options: [
          'Because Venus is the farthest planet from Earth in the Solar System',
          'Because Venus’s thick clouds completely hide the ground from standard cameras in space',
          'Because Venus has no atmosphere to reflect sunlight',
          'Because Venus always keeps its dark side facing the Sun',
        ],
        correctIndex: 1,
        explanation:
          'Venus is Earth’s closest planetary neighbour, but its thick clouds hide the ground, so the only way to see the surface was to land.',
      },
      {
        id: 'venera13-q2',
        question: 'What extreme conditions did Venera 13 face on the surface of Venus?',
        options: [
          'Freezing −180 °C temperatures in a near-vacuum exosphere',
          'Global sandstorms with zero atmospheric pressure',
          'About 460 °C temperature with a crushing pressure around ninety times that of Earth',
          'Liquid water oceans covering the entire landing basin',
        ],
        correctIndex: 2,
        explanation:
          'The surface of Venus is about 460 degrees Celsius with a crushing atmospheric pressure around ninety times that of Earth.',
      },
      {
        id: 'venera13-q3',
        question: 'Designed to last under an hour, how long did Venera 13 actually survive on the surface of Venus?',
        options: [
          '127 minutes (more than two hours)',
          'Eleven months',
          'More than six years',
          'Four years',
        ],
        correctIndex: 0,
        explanation:
          'Engineers designed Venera 13 to last under an hour, but it survived for 127 minutes — more than two hours — before the extreme environment stopped it.',
      },
      {
        id: 'venera13-q4',
        question: 'What scientific firsts did Venera 13 achieve during its mission on 1 March 1982?',
        options: [
          'It discovered water ice in permanently shadowed polar craters',
          'It left a laser reflector used to measure the Earth–Venus distance',
          'It uncovered tiny hematite spheres nicknamed blueberries',
          'It drilled into the soil, measured basalt-like volcanic rock, and sent the first colour panoramas of the Venusian surface',
        ],
        correctIndex: 3,
        explanation:
          'Venera 13 drilled into the soil, measured it as basalt-like volcanic rock, and returned the first colour panoramic images of the Venusian landscape.',
      },
      {
        id: 'venera13-q5',
        question: 'Why is Venus hotter than Mercury, even though Mercury is closer to the Sun?',
        options: [
          'Because Venus orbits inside the Sun’s corona',
          'Because Venus’s thick atmosphere traps heat',
          'Because Venus has ten times more moons than Mercury',
          'Because Mercury is completely covered in oceans',
        ],
        correctIndex: 1,
        explanation:
          'Venus is hotter than Mercury, despite being farther from the Sun, because its thick carbon-dioxide atmosphere traps heat.',
      },
    ],
  },

  messenger: {
    landmarkId: 'messenger',
    title: 'Test Your Mission Knowledge: MESSENGER Orbiter',
    description:
      'Review what you learned about NASA’s MESSENGER spacecraft — the first mission ever to orbit Mercury.',
    xpReward: 100,
    questions: [
      {
        id: 'messenger-q1',
        question: 'What historic achievement did NASA’s MESSENGER spacecraft accomplish in March 2011?',
        options: [
          'It became the first spacecraft ever to orbit Mercury, mapping the whole planet',
          'It became the first rover to drive across Mercury’s equator',
          'It returned 21 kilograms of Mercury soil back to Earth',
          'It landed a parachute probe in Meridiani Planum',
        ],
        correctIndex: 0,
        explanation:
          'After a six-and-a-half-year journey, MESSENGER entered orbit in March 2011 as the first spacecraft ever to orbit Mercury.',
      },
      {
        id: 'messenger-q2',
        question: 'How long did MESSENGER operate in orbit around Mercury compared to its planned one-year primary mission?',
        options: [
          'It worked for only 127 minutes',
          'It worked for four years in orbit, long past its planned single year',
          'It worked for nearly 14 years on the surface',
          'It lost contact before entering orbit',
        ],
        correctIndex: 1,
        explanation:
          'After entering orbit in March 2011, MESSENGER worked for four years — four times longer than its planned one-year orbital mission.',
      },
      {
        id: 'messenger-q3',
        question: 'How did the MESSENGER mission end on 30 April 2015?',
        options: [
          'It got stuck in soft sand at a place called Troy',
          'A global dust storm blocked its solar panels',
          'It ran out of fuel to keep its orbit and crashed into Mercury at several kilometres per second',
          'It returned safely to Earth and landed in the ocean',
        ],
        correctIndex: 2,
        explanation:
          'When MESSENGER ran out of propellant to maintain its orbit, it crashed into Mercury at several kilometres per second on 30 April 2015, carving a new crater roughly 16 metres wide.',
      },
      {
        id: 'messenger-q4',
        question: 'What surprising discovery did MESSENGER make near Mercury’s poles despite the planet’s closeness to the Sun?',
        options: [
          'Liquid methane lakes on the sunlit plains',
          'Thick sulfuric-acid clouds hiding the surface',
          'Living microbial mats in hot springs',
          'Water ice in permanently shadowed craters near the poles',
        ],
        correctIndex: 3,
        explanation:
          'MESSENGER found water ice preserved inside permanently shadowed craters near Mercury’s poles, even though Mercury is the closest planet to the Sun.',
      },
      {
        id: 'messenger-q5',
        question: 'What unusual property of Mercury’s magnetic field did MESSENGER measure directly?',
        options: [
          'Mercury has no magnetic field of any kind',
          'Mercury’s magnetic field is off-centre',
          'Mercury’s magnetic field reverses direction every 24 hours',
          'Mercury’s magnetic field is stronger than the Sun’s',
        ],
        correctIndex: 1,
        explanation:
          'MESSENGER measured directly that Mercury’s magnetic field is significantly off-centre relative to the planet.',
      },
    ],
  },

  ingenuity: {
    landmarkId: 'ingenuity',
    title: 'Test Your Mission Knowledge: Ingenuity Mars Helicopter',
    description:
      'Review the historic flights of NASA’s Ingenuity rotorcraft in Jezero Crater on Mars.',
    xpReward: 100,
    questions: [
      {
        id: 'ingenuity-q1',
        question: 'What historic aviation milestone did NASA’s Ingenuity achieve on 19 April 2021?',
        options: [
          'The first powered, controlled flight of an aircraft on another planet',
          'The first supersonic parachute deployment on Venus',
          'The first human-piloted flight in lunar orbit',
          'The first sample return launch from Mars to Earth',
        ],
        correctIndex: 0,
        explanation:
          'On 19 April 2021 in Jezero Crater, Ingenuity achieved the first powered, controlled flight on another planet.',
      },
      {
        id: 'ingenuity-q2',
        question: 'Why did Ingenuity’s coaxial rotor blades have to spin at roughly 2,400 RPM?',
        options: [
          'To drill into Martian basalt rock',
          'Because the Martian atmosphere is only about 1% as dense as Earth’s atmosphere',
          'To generate enough heat to melt polar water ice',
          'Because Mars has ten times stronger gravity than Earth',
        ],
        correctIndex: 1,
        explanation:
          'Mars’s atmosphere is only about 1% as dense as Earth’s, requiring Ingenuity’s lightweight carbon-fibre blades to spin around 2,400 RPM to generate lift.',
      },
      {
        id: 'ingenuity-q3',
        question: 'Originally designed for 5 flights over 30 days, how many flights did Ingenuity actually complete?',
        options: [
          'Only 1 flight',
          '12 flights',
          '72 flights over nearly three years',
          '500 flights across the entire planet',
        ],
        correctIndex: 2,
        explanation:
          'Planned as a 5-flight technology demonstration, Ingenuity completed 72 flights over nearly three years as an aerial scout for Perseverance.',
      },
      {
        id: 'ingenuity-q4',
        question: 'What ended Ingenuity’s flying career on 18 January 2024 during Flight 72?',
        options: [
          'It fell into an active lava tube',
          'Rotor blade damage during a landing in featureless sand ripples',
          'It was struck by a micrometeorite in orbit',
          'Its radio transmitter melted in extreme heat',
        ],
        correctIndex: 1,
        explanation:
          'During a landing on featureless sand ripples on Flight 72, Ingenuity’s rotor blades struck the surface and suffered damage, ending its flying career.',
      },
      {
        id: 'ingenuity-q5',
        question: 'What historic aviation artifact did Ingenuity carry aboard to Mars?',
        options: [
          'A piece of fabric from the wing of the 1903 Wright Flyer',
          'Neil Armstrong’s lunar boots',
          'The backup lens from the Hubble Space Telescope',
          'A golden phonograph record',
        ],
        correctIndex: 0,
        explanation:
          'Ingenuity carried a small swatch of fabric from the wing of the Wright brothers’ 1903 Wright Flyer, and its first airfield on Mars was named Wright Brothers Field.',
      },
    ],
  },

  hubble: {
    landmarkId: 'hubble',
    title: 'Test Your Mission Knowledge: Hubble Space Telescope',
    description:
      'Test your knowledge of the NASA/ESA Hubble Space Telescope and its discoveries from Low Earth Orbit.',
    xpReward: 100,
    questions: [
      {
        id: 'hubble-q1',
        question: 'Why does the Hubble Space Telescope orbit roughly 540 km above Earth instead of operating on the ground?',
        options: [
          'To observe the universe in optical and ultraviolet light without the blurring and absorption of Earth’s atmosphere',
          'To stay close enough to touch the Moon during lunar eclipses',
          'Because glass mirrors only reflect light in zero gravity',
          'To collect solar wind particles inside Earth’s core',
        ],
        correctIndex: 0,
        explanation:
          'Orbiting above Earth’s distorting atmosphere gives Hubble crystal-clear optical, ultraviolet, and near-infrared views of deep space.',
      },
      {
        id: 'hubble-q2',
        question: 'What problem was discovered shortly after Hubble’s deployment in April 1990, and how was it solved?',
        options: [
          'Its solar panels were missing; a robotic rover brought replacements',
          'A 2.2-micrometre flaw in its primary mirror was corrected by astronauts installing corrective optics on STS-61 in 1993',
          'It was launched toward Venus by mistake and had to fly back',
          'Its radio antenna was blocked by a parachute',
        ],
        correctIndex: 1,
        explanation:
          'Hubble’s primary mirror had a tiny spherical aberration of 2.2 micrometres; astronauts on Space Shuttle mission STS-61 in December 1993 installed corrective optics.',
      },
      {
        id: 'hubble-q3',
        question: 'How many Space Shuttle servicing missions visited Hubble to upgrade its instruments and gyroscopes?',
        options: [
          'None — it could never be reached once launched',
          'One servicing mission',
          'Five Space Shuttle servicing missions between 1993 and 2009',
          'Twenty Apollo missions',
        ],
        correctIndex: 2,
        explanation:
          'Astronauts conducted five Space Shuttle servicing missions between 1993 and 2009, repeatedly upgrading Hubble into an ever more capable observatory.',
      },
      {
        id: 'hubble-q4',
        question: 'Which major cosmological discovery did Hubble observations help establish?',
        options: [
          'Pinning down the age of the universe at 13.8 billion years and showing cosmic expansion is accelerating',
          'Proving that the Sun orbits Earth every 24 hours',
          'Discovering basalt soil on the surface of Venus',
          'Finding hematite blueberries in Meridiani Planum',
        ],
        correctIndex: 0,
        explanation:
          'Hubble measurements helped determine the universe’s age (13.8 billion years) and contributed to the discovery that the expansion of the universe is accelerating.',
      },
      {
        id: 'hubble-q5',
        question: 'How long does it take the Hubble Space Telescope to complete one orbit around Earth?',
        options: [
          'About 95 minutes',
          '365 Earth days',
          '28 Earth days',
          '59 Earth days',
        ],
        correctIndex: 0,
        explanation:
          'Traveling at about 27,000 km/h in Low Earth Orbit, Hubble completes a full orbit around Earth roughly every 95 minutes.',
      },
    ],
  },

  cassini: {
    landmarkId: 'cassini',
    title: 'Test Your Mission Knowledge: Cassini–Huygens',
    description:
      'Review the 13-year exploration of Saturn, Titan, and Enceladus by the Cassini–Huygens spacecraft.',
    xpReward: 100,
    questions: [
      {
        id: 'cassini-q1',
        question: 'Which space agencies collaborated on the Cassini–Huygens mission to Saturn?',
        options: [
          'NASA, ESA (European Space Agency), and ASI (Italian Space Agency)',
          'Only the Soviet space programme in 1970',
          'UK Space Agency and Mars Express',
          'Apollo 11 crew in 1969',
        ],
        correctIndex: 0,
        explanation:
          'Cassini–Huygens was a landmark international collaboration between NASA, the European Space Agency (ESA), and the Italian Space Agency (ASI).',
      },
      {
        id: 'cassini-q2',
        question: 'What historic landing did the European Huygens probe achieve in January 2005?',
        options: [
          'It landed on Saturn’s giant moon Titan — the farthest landing from Earth any spacecraft has achieved',
          'It landed in Gusev Crater on Mars',
          'It touched down in the Sea of Tranquility on the Moon',
          'It impacted the north pole of Mercury',
        ],
        correctIndex: 0,
        explanation:
          'Carried to Saturn by Cassini, the Huygens probe parachuted onto the surface of Titan in January 2005 — the farthest landing from Earth in spaceflight history.',
      },
      {
        id: 'cassini-q3',
        question: 'What remarkable discovery did Cassini make at Saturn’s icy moon Enceladus?',
        options: [
          'Towering plumes of water vapour, ice, and organic molecules erupting from a global subsurface saltwater ocean',
          'A dry basalt desert with no water',
          'Temperatures of 460 °C at the surface',
          'An off-centre magnetic field with no moons',
        ],
        correctIndex: 0,
        explanation:
          'Cassini discovered active cryo-volcanic geysers at Enceladus’s south pole fed by a global subsurface saltwater ocean with hydrothermal activity.',
      },
      {
        id: 'cassini-q4',
        question: 'Why did mission controllers intentionally plunge Cassini into Saturn’s atmosphere on 15 September 2017?',
        options: [
          'Because its parachute opened early during launch',
          'To protect potentially habitable ocean moons like Enceladus and Titan from accidental biological contamination once fuel ran low',
          'To test a wheeled rover on Saturn’s solid surface',
          'Because a global dust storm blocked its solar panels',
        ],
        correctIndex: 1,
        explanation:
          'With propellant nearly depleted, controllers flew 22 Grand Finale orbits and plunged Cassini into Saturn so it could never crash into and contaminate Enceladus or Titan.',
      },
      {
        id: 'cassini-q5',
        question: 'What did Cassini discover on the surface of Saturn’s largest moon, Titan?',
        options: [
          'Liquid methane and ethane seas, lakes, and river channels under a thick nitrogen atmosphere',
          'Craters filled with boiling molten iron',
          'The Apollo 11 laser retroreflector',
          'Silica hot-spring deposits in Columbia Hills',
        ],
        correctIndex: 0,
        explanation:
          'Cassini’s radar and Huygens’s descent revealed that Titan has a dense nitrogen atmosphere and surface seas, lakes, and rivers of liquid methane and ethane.',
      },
    ],
  },

  curiosity: {
    landmarkId: 'curiosity',
    title: 'Test Your Mission Knowledge: Curiosity Rover',
    description:
      'Review the discoveries of NASA’s nuclear-powered Curiosity rover in Gale Crater and Mount Sharp.',
    xpReward: 100,
    questions: [
      {
        id: 'curiosity-q1',
        question: 'What was the primary scientific goal of NASA’s Curiosity rover mission?',
        options: [
          'To determine whether Mars ever offered environmental conditions capable of supporting microbial life',
          'To return astronauts from the Sea of Tranquility',
          'To dive into Saturn’s rings at the end of its mission',
          'To map Venus’s surface beneath sulfuric-acid clouds',
        ],
        correctIndex: 0,
        explanation:
          'Curiosity (Mars Science Laboratory) was designed to determine whether Mars ever had ancient habitable environments capable of supporting microbial life.',
      },
      {
        id: 'curiosity-q2',
        question: 'How was the 899 kg Curiosity rover lowered safely onto the floor of Gale Crater on 6 August 2012?',
        options: [
          'By bouncing inside giant inflatable airbags',
          'By a rocket-powered Sky Crane descent stage using nylon tethers',
          'By splashing down in a liquid methane lake',
          'By astronauts guiding it manually from lunar orbit',
        ],
        correctIndex: 1,
        explanation:
          'Because Curiosity was too heavy for airbags, NASA pioneered the rocket-powered Sky Crane maneuver to lower the rover onto its wheels on nylon bridles.',
      },
      {
        id: 'curiosity-q3',
        question: 'Why did scientists choose Gale Crater and its central peak, Mount Sharp, for Curiosity?',
        options: [
          'Its 5.5 km layered sedimentary mountain preserves a timeline of Mars’s transition from a wet world to an arid desert',
          'It is the closest point on Mars to the Sun',
          'It has a dense nitrogen atmosphere like Earth',
          'It was where Lunokhod 1 landed in 1970',
        ],
        correctIndex: 0,
        explanation:
          'Mount Sharp’s sedimentary rock layers record millions of years of Martian environmental history, from ancient lakes to dry sulfate-rich eras.',
      },
      {
        id: 'curiosity-q4',
        question: 'What power source allows Curiosity to operate day and night regardless of Martian dust storms?',
        options: [
          'A wind turbine mast',
          'A Multi-Mission Radioisotope Thermoelectric Generator (MMRTG) nuclear battery',
          'Foldable solar petals designed by Damien Hirst',
          'Liquid hydrogen fuel cells refueled from orbit',
        ],
        correctIndex: 1,
        explanation:
          'Curiosity is powered by an MMRTG radioisotope thermoelectric generator, giving it dependable heat and electricity through dust storms and Martian winters.',
      },
      {
        id: 'curiosity-q5',
        question: 'What did Curiosity’s drill samples at Yellowknife Bay confirm?',
        options: [
          'An ancient freshwater lake bed containing key chemical ingredients for life (C, H, O, N, P, S)',
          'That Mars’s surface is 460 °C with 90-bar pressure',
          'That Mars has no carbon or hydrogen of any kind',
          'That Gale Crater is made of pure metallic iron',
        ],
        correctIndex: 0,
        explanation:
          'Mudstone samples drilled at Yellowknife Bay contained clay minerals and key biogenic elements (carbon, hydrogen, oxygen, sulfur, nitrogen, and phosphorus) from an ancient freshwater lake.',
      },
    ],
  },

  perseverance: {
    landmarkId: 'perseverance',
    title: 'Test Your Mission Knowledge: Perseverance Rover',
    description:
      'Test your understanding of NASA’s Mars 2020 Perseverance rover, Jezero Crater’s ancient river delta, and Mars sample caching.',
    xpReward: 100,
    questions: [
      {
        id: 'perseverance-q1',
        question: 'Why was Jezero Crater chosen as the landing site for NASA’s Perseverance rover?',
        options: [
          'It contains a well-preserved ancient river delta and lake bed where microbial biosignatures could be preserved',
          'It is the hottest volcanic plain on Venus',
          'It is a permanently shadowed crater on Mercury',
          'It was the landing site of Apollo 11 in 1969',
        ],
        correctIndex: 0,
        explanation:
          'Jezero Crater was flooded by water 3.5 billion years ago and features a classic river delta whose fine clay sediments are ideal for preserving ancient organic molecules.',
      },
      {
        id: 'perseverance-q2',
        question: 'What historic technology demonstration did Perseverance carry to Mars attached to its belly?',
        options: [
          'The Ingenuity Mars Helicopter',
          'The Huygens Titan lander',
          'The Beagle 2 pocket-watch probe',
          'The Hubble corrective optics',
        ],
        correctIndex: 0,
        explanation:
          'Perseverance carried the 1.8 kg Ingenuity Mars Helicopter beneath its chassis and deployed it onto Wright Brothers Field in April 2021.',
      },
      {
        id: 'perseverance-q3',
        question: 'What did Perseverance’s MOXIE instrument successfully demonstrate on Mars for future astronauts?',
        options: [
          'Producing breathable oxygen directly from carbon dioxide in the Martian atmosphere',
          'Melting polar ice caps with a laser beam from orbit',
          'Generating artificial gravity inside Jezero Crater',
          'Bouncing laser pulses to Earth from Mare Imbrium',
        ],
        correctIndex: 0,
        explanation:
          'MOXIE (Mars Oxygen In-Situ Resource Utilization Experiment) extracted breathable oxygen from Mars’s CO₂ atmosphere 16 times.',
      },
      {
        id: 'perseverance-q4',
        question: 'How is Perseverance preparing for the first return of Martian rocks to Earth?',
        options: [
          'By launching rockets directly from its roof every week',
          'By drilling rock cores and sealing them inside ultra-clean titanium sample tubes',
          'By catapulting rocks into low Mars orbit',
          'By melting rock samples into glass spheres',
        ],
        correctIndex: 1,
        explanation:
          'Perseverance drills rock and regolith cores, seals them inside titanium tubes, and cached a 10-tube backup depot at Three Forks in Jezero Crater.',
      },
      {
        id: 'perseverance-q5',
        question: 'What hidden message was encoded in the orange-and-white pattern of Perseverance’s supersonic parachute?',
        options: [
          'JPL’s motto "Dare Mighty Things" along with the GPS coordinates of Jet Propulsion Laboratory',
          'The musical notes to Happy Birthday',
          'The periodic table of elements',
          'A map of the Sea of Tranquility',
        ],
        correctIndex: 0,
        explanation:
          'Engineers encoded "Dare Mighty Things" in binary across the rings of Perseverance’s supersonic parachute, along with JPL’s latitude and longitude.',
      },
    ],
  },

  lrv: {
    landmarkId: 'lrv',
    title: 'Test Your Mission Knowledge: Lunar Roving Vehicles (LRVs)',
    description:
      'Review how NASA’s electric "Moon Buggies" expanded human exploration across the Moon during Apollo 15, 16, and 17.',
    xpReward: 100,
    questions: [
      {
        id: 'lrv-q1',
        question: 'Which Apollo missions carried and drove Lunar Roving Vehicles (LRVs) on the Moon?',
        options: [
          'Apollo 15, Apollo 16, and Apollo 17',
          'Apollo 8, Apollo 9, and Apollo 10',
          'Only Apollo 11 at Tranquility Base',
          'Surveyor 1, Surveyor 3, and Surveyor 6',
        ],
        correctIndex: 0,
        explanation:
          'Three Lunar Roving Vehicles were driven on the Moon during the final three J-class missions: Apollo 15, Apollo 16, and Apollo 17.',
      },
      {
        id: 'lrv-q2',
        question: 'How were the Apollo Lunar Roving Vehicles powered and what kind of wheels did they use?',
        options: [
          'Powered by two silver-zinc batteries and riding on woven piano-wire mesh wheels',
          'Powered by a diesel engine with solid rubber tires',
          'Powered by wind turbines and magnetic levitation pads',
          'Powered by liquid methane thrusters',
        ],
        correctIndex: 0,
        explanation:
          'Each LRV was powered by two non-rechargeable silver-zinc batteries and used flexible zinc-coated woven steel piano-wire mesh wheels with titanium treads.',
      },
      {
        id: 'lrv-q3',
        question: 'Where was the very first Lunar Roving Vehicle (LRV-1) deployed in July 1971?',
        options: [
          'Hadley–Apennine on Apollo 15',
          'Gusev Crater on Mars',
          'Phoebe Regio on Venus',
          'Ares Vallis on Mars',
        ],
        correctIndex: 0,
        explanation:
          'Apollo 15 astronauts David Scott and James Irwin deployed the first Lunar Roving Vehicle in the Hadley–Apennine region on 31 July 1971.',
      },
      {
        id: 'lrv-q4',
        question: 'Why did Apollo astronauts park each LRV a short distance away from the Lunar Module at the end of their final moonwalk?',
        options: [
          'So its remotely controlled television camera could broadcast the Lunar Module liftoff back to Earth',
          'So it could drive itself back to Earth',
          'To hide it inside a permanently shadowed polar crater',
          'To shield it from Martian dust storms',
        ],
        correctIndex: 0,
        explanation:
          'Mission control remotely tilted the LRV’s television camera to capture live footage of the Lunar Module ascent stage blasting off from the Moon.',
      },
      {
        id: 'lrv-q5',
        question: 'What is the official lunar land-speed record set by Eugene Cernan driving the Apollo 17 LRV?',
        options: [
          '18 km/h (11.2 mph)',
          '120 km/h (75 mph)',
          '1.5 km/h (0.9 mph)',
          '460 km/h (285 mph)',
        ],
        correctIndex: 0,
        explanation:
          'Apollo 17 Commander Eugene Cernan set the lunar land-speed record of 18 km/h (11.2 mph) driving down a slope in the Taurus–Littrow valley.',
      },
    ],
  },

  alsep: {
    landmarkId: 'alsep',
    title: 'Test Your Mission Knowledge: ALSEP Scientific Packages',
    description:
      'Test your knowledge of the nuclear-powered Apollo Lunar Surface Experiments Packages that monitored moonquakes and the lunar environment until 1977.',
    xpReward: 100,
    questions: [
      {
        id: 'alsep-q1',
        question: 'What was the primary purpose of the Apollo Lunar Surface Experiments Package (ALSEP) stations?',
        options: [
          'To operate as autonomous geophysical and seismic observatories on the Moon long after the astronauts returned to Earth',
          'To launch rock samples into interstellar space',
          'To propel the Lunar Roving Vehicle across craters',
          'To photograph Venus’s clouds from orbit',
        ],
        correctIndex: 0,
        explanation:
          'ALSEP stations were deployed by Apollo astronauts to continuously monitor moonquakes, heat flow, solar wind, and magnetic fields for years after each mission.',
      },
      {
        id: 'alsep-q2',
        question: 'How did the full ALSEP stations on Apollo 12 through 17 survive the freezing two-week-long lunar nights?',
        options: [
          'Each station was powered by a SNAP-27 radioisotope thermoelectric generator (RTG) producing continuous electricity',
          'Astronauts returned every two weeks to replace AA batteries',
          'They used wind turbines driven by lunar storms',
          'They burned coal mined from lunar craters',
        ],
        correctIndex: 0,
        explanation:
          'Each ALSEP station used a SNAP-27 plutonium-238 radioisotope thermoelectric generator (RTG) that supplied about 70 watts day and night.',
      },
      {
        id: 'alsep-q3',
        question: 'How did NASA calibrate the ALSEP seismometers to probe the Moon’s internal structure?',
        options: [
          'By deliberately crashing spent Saturn V third stages (S-IVB) and Lunar Module ascent stages into the Moon',
          'By firing lasers from the Hubble Space Telescope',
          'By triggering volcanic eruptions in Mare Tranquillitatis',
          'By dropping airbags from Mars Pathfinder',
        ],
        correctIndex: 0,
        explanation:
          'Controlled impacts of spent S-IVB rocket stages and Lunar Module ascent stages generated seismic waves of known energy and timing, making the Moon "ring like a bell."',
      },
      {
        id: 'alsep-q4',
        question: 'Roughly how many seismic events did the ALSEP network record before NASA turned off the receiving stations on 30 September 1977?',
        options: [
          'More than 13,000 seismic events, including deep moonquakes and meteorite impacts',
          'Zero — the Moon is completely silent',
          'Only 2 events in eight years',
          'Over 100 million volcanic eruptions',
        ],
        correctIndex: 0,
        explanation:
          'ALSEP seismometers recorded more than 13,000 moonquakes and meteorite impacts, revealing the thickness of the lunar crust and mantle structure.',
      },
      {
        id: 'alsep-q5',
        question: 'Which passive Apollo surface experiment requires no electrical power and is still used by scientists today?',
        options: [
          'The laser retroreflector arrays',
          'The SNAP-27 radio transmitter',
          'The Surveyor soil scoop',
          'The Viking biological oven',
        ],
        correctIndex: 0,
        explanation:
          'The passive optical corner-cube laser retroreflector arrays left at Apollo 11, 14, and 15 require no power and still reflect laser pulses from Earth observatories today.',
      },
    ],
  },

  surveyor: {
    landmarkId: 'surveyor',
    title: 'Test Your Mission Knowledge: Surveyor Landers',
    description:
      'Review how NASA’s robotic Surveyor landers achieved America’s first soft landings on the Moon and paved the way for Apollo.',
    xpReward: 100,
    questions: [
      {
        id: 'surveyor-q1',
        question: 'What was the primary goal of NASA’s robotic Surveyor program between 1966 and 1968?',
        options: [
          'To prove radar-guided soft landings on the Moon and verify that the lunar surface could support the weight of the Apollo Lunar Module',
          'To place a space telescope into an Earth-trailing heliocentric orbit',
          'To land the first wheeled rover in Ares Vallis on Mars',
          'To enter orbit around dwarf planet Ceres',
        ],
        correctIndex: 0,
        explanation:
          'Surveyor tested radar-controlled retro-rocket landings and proved that lunar soil was firm enough for Apollo astronauts and landers.',
      },
      {
        id: 'surveyor-q2',
        question: 'What historic milestone did Surveyor 1 achieve on 2 June 1966 in Oceanus Procellarum?',
        options: [
          'America’s first soft landing on the Moon (and on any extraterrestrial body), transmitting over 11,000 photos',
          'The first human moonwalk',
          'The first powered flight on Mars',
          'The first flyby of Jupiter and Saturn',
        ],
        correctIndex: 0,
        explanation:
          'Surveyor 1 touched down gently in Oceanus Procellarum on 2 June 1966, becoming the first American spacecraft to soft-land on another world.',
      },
      {
        id: 'surveyor-q3',
        question: 'What critical concern about the lunar surface did the Surveyor landers put to rest before Apollo 11?',
        options: [
          'That the Moon might be covered in a deep, loose dust layer that would swallow a landing spacecraft',
          'That the Moon had a 90-bar carbon-dioxide atmosphere',
          'That the Moon’s surface was made of liquid water',
          'That the Moon had no gravity at all',
        ],
        correctIndex: 0,
        explanation:
          'Before Surveyor, some scientists feared spacecraft would sink into metres of loose electrostatic dust; Surveyor proved the regolith was firm and load-bearing.',
      },
      {
        id: 'surveyor-q4',
        question: 'Which Apollo crew landed just 163 metres from Surveyor 3 in November 1969 and walked over to inspect it?',
        options: [
          'Apollo 12 astronauts Pete Conrad and Alan Bean',
          'Apollo 11 astronauts Neil Armstrong and Buzz Aldrin',
          'Apollo 17 astronauts Eugene Cernan and Harrison Schmitt',
          'Mars Pathfinder engineers',
        ],
        correctIndex: 0,
        explanation:
          'Apollo 12 demonstrated pinpoint lunar navigation by landing within walking distance of Surveyor 3 in Oceanus Procellarum and returning its camera and scoop to Earth.',
      },
      {
        id: 'surveyor-q5',
        question: 'What unique first did Surveyor 6 accomplish in November 1967?',
        options: [
          'It fired its vernier engines for 2.5 seconds to perform the first liftoff and 2.4-metre hop across the lunar surface',
          'It drove 45 kilometres on six wheels',
          'It deployed a coaxial helicopter',
          'It orbited asteroid 433 Eros',
        ],
        correctIndex: 0,
        explanation:
          'Surveyor 6 briefly restarted its engines on the Moon to hop 2.4 metres west, becoming the first spacecraft ever to lift off from the lunar surface.',
      },
    ],
  },

  sojourner: {
    landmarkId: 'sojourner',
    title: 'Test Your Mission Knowledge: Sojourner Rover',
    description:
      'Test your knowledge of NASA’s trailblazing 1997 Mars Pathfinder microrover Sojourner in Ares Vallis.',
    xpReward: 100,
    questions: [
      {
        id: 'sojourner-q1',
        question: 'What historic distinction does NASA’s Sojourner hold in planetary exploration?',
        options: [
          'It was the first wheeled rover ever to operate on Mars',
          'It was the first spacecraft to orbit Saturn',
          'It was the first crewed rover driven on the Moon',
          'It was the first probe to touch down on asteroid 433 Eros',
        ],
        correctIndex: 0,
        explanation:
          'Landing on 4 July 1997 aboard Mars Pathfinder, the 10.6 kg Sojourner microrover became the first wheeled vehicle ever to rove on Mars.',
      },
      {
        id: 'sojourner-q2',
        question: 'Why did scientists select the Ares Vallis flood plain as the landing site for Mars Pathfinder and Sojourner?',
        options: [
          'It was an ancient outflow channel where catastrophic floods washed a "grab bag" of diverse Martian rocks into a flat, safe plain',
          'It was the summit of Olympus Mons',
          'It was covered in liquid methane lakes',
          'It was a permanently shadowed crater near Mercury’s north pole',
        ],
        correctIndex: 0,
        explanation:
          'Ares Vallis offered a relatively flat landing zone strewn with a wide variety of rock types carried down from the ancient highlands by floodwaters.',
      },
      {
        id: 'sojourner-q3',
        question: 'How did Mars Pathfinder and Sojourner cushion their touchdown on the Martian surface on 4 July 1997?',
        options: [
          'Inside a giant cocoon of inflatable airbags after a parachute and solid retro-rocket descent',
          'Using a nuclear-powered Sky Crane',
          'By splashing down in an ocean',
          'Using astronauts at manual controls',
        ],
        correctIndex: 0,
        explanation:
          'Mars Pathfinder pioneered the airbag-cushioned landing system, bouncing across Ares Vallis before deflating and opening its petals.',
      },
      {
        id: 'sojourner-q4',
        question: 'Planned for a 7-sol demonstration, how long did Sojourner actually operate before the Pathfinder lander’s battery failed?',
        options: [
          '83 Martian days (sols) — nearly 12 times its planned mission',
          'Only 12 minutes',
          '15 Earth years',
          '300 years',
        ],
        correctIndex: 0,
        explanation:
          'Sojourner operated for 83 sols, driving about 100 metres and analyzing rocks like Barnacle Bill and Yogi until the base station lost power in September 1997.',
      },
      {
        id: 'sojourner-q5',
        question: 'Which mechanical suspension design introduced on Sojourner was later adopted for Spirit, Opportunity, Curiosity, and Perseverance?',
        options: [
          'The six-wheel "rocker-bogie" suspension system',
          'Woven piano-wire lunar wheels',
          'Coaxial carbon-fibre rotor blades',
          'Three-legged landing footpads',
        ],
        correctIndex: 0,
        explanation:
          'Sojourner flight-proven the six-wheel rocker-bogie suspension, which keeps all six wheels on uneven ground without springs and has been used on every NASA Mars rover since.',
      },
    ],
  },

  viking: {
    landmarkId: 'viking',
    title: 'Test Your Mission Knowledge: Viking 1 & 2 Landers',
    description:
      'Review the historic achievements of NASA’s twin Viking landers at Chryse Planitia and Utopia Planitia on Mars.',
    xpReward: 100,
    questions: [
      {
        id: 'viking-q1',
        question: 'What historic milestone did NASA’s Viking 1 lander achieve on 20 July 1976?',
        options: [
          'The first spacecraft to land safely on Mars and complete a full, extended scientific surface mission',
          'The first spacecraft to orbit dwarf planet Ceres',
          'The first human landing on the Moon',
          'The first colour panorama of Venus',
        ],
        correctIndex: 0,
        explanation:
          'On 20 July 1976 in Chryse Planitia, Viking 1 became the first spacecraft to successfully land on Mars and complete its surface mission.',
      },
      {
        id: 'viking-q2',
        question: 'Where on Mars did the twin Viking 1 and Viking 2 landers touch down in 1976?',
        options: [
          'Chryse Planitia (Viking 1) and Utopia Planitia (Viking 2)',
          'Mare Tranquillitatis and Mare Imbrium',
          'Phoebe Regio and Ishtar Terra',
          'Jezero Crater and Gale Crater',
        ],
        correctIndex: 0,
        explanation:
          'Viking 1 landed in Chryse Planitia (22.27°N, 47.95°W) in July 1976, and Viking 2 landed in Utopia Planitia (47.64°N, 134.29°E) in September 1976.',
      },
      {
        id: 'viking-q3',
        question: 'What specialized experiments did the Viking landers perform using soil scooped from the Martian surface?',
        options: [
          'The first in-situ biological experiments testing Martian soil for signs of microbial metabolism, alongside gas-chromatograph mass spectrometry',
          'Producing breathable oxygen with the MOXIE instrument',
          'Drilling 5 kilometres into the liquid iron core',
          'Launching samples back to Earth orbit',
        ],
        correctIndex: 0,
        explanation:
          'Each Viking lander carried a miniature automated biology lab with three metabolic experiments plus a GCMS to search for organic molecules.',
      },
      {
        id: 'viking-q4',
        question: 'How did the Viking landers’ atmospheric measurements solve a mystery about meteorites found on Earth?',
        options: [
          'Gas trapped inside SNC meteorites on Earth matched the exact atmospheric composition measured by Viking on Mars, proving those meteorites came from Mars',
          'They proved all meteorites come from Saturn’s rings',
          'They showed Mars has no atmosphere at all',
          'They showed Mars’s air is 99% oxygen',
        ],
        correctIndex: 0,
        explanation:
          'Viking’s precise isotopic measurements of Mars’s atmosphere matched microscopic gas bubbles trapped inside shergottite, nakhlite, and chassignite meteorites found on Earth.',
      },
      {
        id: 'viking-q5',
        question: 'How long did Viking 1 operate on the Martian surface before a command error ended communications in November 1982?',
        options: [
          'More than six Earth years (2,245 Martian sols) — a surface longevity record that stood until 2010',
          'Only 127 minutes',
          'Just 5 days',
          '95 minutes',
        ],
        correctIndex: 0,
        explanation:
          'Powered by radioisotope thermoelectric generators, Viking 1 operated on Mars for over six years until November 1982.',
      },
    ],
  },

  phoenix_insight: {
    landmarkId: 'phoenix_insight',
    title: 'Test Your Mission Knowledge: Phoenix & InSight Landers',
    description:
      'Challenge your knowledge of NASA’s Phoenix polar lander and InSight geophysical lander on Mars.',
    xpReward: 100,
    questions: [
      {
        id: 'phoenix_insight-q1',
        question: 'Why did NASA send the Phoenix lander to Vastitas Borealis at 68°N latitude in May 2008?',
        options: [
          'To dig directly into shallow subsurface water ice in the Martian arctic and analyze polar soil chemistry',
          'To fly a rotorcraft through the Valles Marineris canyon',
          'To dive into Saturn’s equatorial atmosphere',
          'To measure moonquakes in Fra Mauro',
        ],
        correctIndex: 0,
        explanation:
          'Phoenix landed in the Martian arctic plains where orbital spectrometers had detected abundant water ice just centimetres beneath the soil.',
      },
      {
        id: 'phoenix_insight-q2',
        question: 'How did scientists confirm that the bright material uncovered in Phoenix’s trenches was water ice rather than carbon-dioxide ice or salt?',
        options: [
          'Chunks of the bright material sublimated (vaporized) over four days in the sunlight at temperatures where water ice sublimates',
          'Astronauts tasted the ice in person',
          'The rover drove 45 kilometres across it',
          'It melted into a boiling ocean at 460 °C',
        ],
        correctIndex: 0,
        explanation:
          'Photographs taken four days apart showed dice-sized crumbs of bright trench material vanishing by sublimation, proving it was water ice.',
      },
      {
        id: 'phoenix_insight-q3',
        question: 'What historic scientific instrument did the InSight lander place directly onto the ground of Elysium Planitia in 2018?',
        options: [
          'SEIS — an ultra-sensitive dome-shielded seismometer built to detect marsquakes and map Mars’s deep interior',
          'A laser retroreflector for measuring the Earth–Moon distance',
          'A 2.4-metre optical mirror',
          'An airbag landing system',
        ],
        correctIndex: 0,
        explanation:
          'InSight used its robotic arm to place the SEIS seismometer directly onto the Martian surface and covered it with a wind and thermal shield.',
      },
      {
        id: 'phoenix_insight-q4',
        question: 'What did InSight reveal about the interior structure of Mars after recording more than 1,300 marsquakes?',
        options: [
          'It measured the thickness of Mars’s layered crust, the structure of its mantle, and proved Mars has a large liquid iron-alloy core',
          'It showed that Mars is completely hollow inside',
          'It proved Mars has no core or crust',
          'It showed Mars is made entirely of water ice',
        ],
        correctIndex: 0,
        explanation:
          'Seismic waves from marsquakes and meteoroid impacts allowed InSight to measure Mars’s crust thickness, mantle attenuation, and molten liquid core radius (~1,830 km).',
      },
      {
        id: 'phoenix_insight-q5',
        question: 'What caused both Phoenix (2008) and InSight (2022) to eventually end their surface operations on Mars?',
        options: [
          'Loss of solar power — Phoenix from the dark arctic winter and InSight from thick Martian dust coating its solar arrays',
          'Both launched back into Earth orbit',
          'Both sank into liquid methane seas',
          'Both were retrieved by Space Shuttle crews',
        ],
        correctIndex: 0,
        explanation:
          'Phoenix lost sunlight with the onset of the polar winter in November 2008, while InSight’s solar panels gradually lost power under accumulating dust until December 2022.',
      },
    ],
  },
};

export function getQuizForLandmark(landmarkId: string): LandmarkQuiz | undefined {
  return landmarkQuizzes[landmarkId];
}
