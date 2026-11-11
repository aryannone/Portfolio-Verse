// Sample people shown inside template previews. All invented, all Indian context.

export type SampleProject = { title: string; text: string; tags: string[] };
export type SampleEducation = { title: string; place: string; years: string };
export type SampleExperience = { title: string; place: string; years: string; text: string };

export type Sample = {
  slug: string;
  name: string;
  initials: string;
  role: string;
  city: string;
  bio: string;
  about: string;
  workLabel: string;
  projects: SampleProject[];
  skills: string[];
  education: SampleEducation[];
  experience?: SampleExperience[];
  email: string;
  links: string[];
};

export const SAMPLES: Record<string, Sample> = {
  "professional-1": {
    slug: "priya-nair",
    name: "Priya Nair",
    initials: "PN",
    role: "Data Analyst",
    city: "Bengaluru",
    bio: "I turn messy spreadsheets into dashboards that teams use every morning.",
    about:
      "Final-year B.Sc. Statistics student. I like questions that start with \"why did sales drop\" and end with a chart that a shop owner can read in ten seconds.",
    workLabel: "Projects",
    projects: [
      { title: "Sales dashboard for a Kochi retailer", text: "Daily sales, stock and returns for 14 stores on one screen.", tags: ["Power BI", "SQL"] },
      { title: "IPL batting analysis", text: "Strike rate by over and venue, with a notebook anyone can rerun.", tags: ["Python", "pandas"] },
      { title: "Hostel mess wastage study", text: "A four-week survey that changed the Sunday menu.", tags: ["Excel", "Survey design"] },
    ],
    skills: ["SQL", "Python", "Power BI", "Excel", "Statistics", "Tableau"],
    education: [
      { title: "B.Sc. Statistics", place: "Christ University, Bengaluru", years: "2024 to 2027" },
      { title: "Class XII, Science", place: "Kendriya Vidyalaya, Ernakulam", years: "2024" },
    ],
    email: "priya.nair@example.com",
    links: ["LinkedIn", "GitHub"],
  },
  "professional-2": {
    slug: "rohan-mehta",
    name: "Rohan Mehta",
    initials: "RM",
    role: "CA Final student",
    city: "Mumbai",
    bio: "Audit and taxation, with a habit of automating the boring parts.",
    about:
      "Second-year articled assistant. I have worked on statutory audits for manufacturing clients and GST filings for small traders in Dadar.",
    workLabel: "Experience",
    projects: [
      { title: "Articleship, audit team", text: "Statutory audits for three manufacturing clients, from planning to sign-off.", tags: ["Ind AS", "Audit"] },
      { title: "GST help desk", text: "Monthly returns for 20 small traders, with a checklist that cut errors.", tags: ["GST", "Tally"] },
      { title: "Excel reconciliation tool", text: "A macro that matches bank entries to the ledger in minutes.", tags: ["Excel", "VBA"] },
    ],
    skills: ["Tally", "Excel", "GST filing", "Ind AS", "Income tax", "Audit"],
    education: [
      { title: "CA Intermediate, both groups", place: "ICAI", years: "2025" },
      { title: "B.Com.", place: "R. A. Podar College, Mumbai", years: "2022 to 2025" },
    ],
    email: "rohan.mehta@example.com",
    links: ["LinkedIn"],
  },
  "professional-3": {
    slug: "ananya-iyer",
    name: "Ananya Iyer",
    initials: "AI",
    role: "Mechanical Engineer",
    city: "Chennai",
    bio: "I design things that have to survive real roads and real weather.",
    about:
      "Final-year mechanical engineering student and suspension lead of my college Baja team. Looking for a graduate role in vehicle design.",
    workLabel: "Projects",
    projects: [
      { title: "Baja SAE buggy", text: "Led suspension design for an all-terrain buggy that finished endurance.", tags: ["SolidWorks", "ANSYS"] },
      { title: "Solar crop dryer", text: "A low-cost dryer built with farmers near Kanchipuram.", tags: ["Thermal", "Fabrication"] },
      { title: "Gearbox teardown study", text: "Wear analysis of a two-wheeler gearbox after 40,000 km.", tags: ["Metrology"] },
    ],
    skills: ["SolidWorks", "ANSYS", "AutoCAD", "GD&T", "MATLAB"],
    education: [
      { title: "B.E. Mechanical Engineering", place: "College of Engineering, Guindy", years: "2023 to 2027" },
      { title: "Class XII", place: "P. S. Senior Secondary School, Chennai", years: "2023" },
    ],
    email: "ananya.iyer@example.com",
    links: ["LinkedIn"],
  },
  "creative-1": {
    slug: "kabir-singh",
    name: "Kabir Singh",
    initials: "KS",
    role: "Illustrator",
    city: "Jaipur",
    bio: "Posters, book covers and wall art that borrow colour from the old city.",
    about:
      "I studied applied arts and now draw for indie publishers, cafes and music festivals. Most of my palettes start on a walk through Johari Bazaar.",
    workLabel: "Selected work",
    projects: [
      { title: "Jaipur Lit Fest posters", text: "A set of six screen-printed posters for a fringe event.", tags: ["Poster", "Print"] },
      { title: "Covers for Hindi poetry", text: "Three book covers for a small Delhi press.", tags: ["Book cover"] },
      { title: "Cafe wall, C-Scheme", text: "A twelve-foot mural of the city's rooftops at dusk.", tags: ["Mural"] },
    ],
    skills: ["Illustration", "Procreate", "Screen printing", "Lettering", "Murals"],
    education: [
      { title: "BFA, Applied Arts", place: "Rajasthan School of Art, Jaipur", years: "2021 to 2025" },
    ],
    email: "kabir.singh@example.com",
    links: ["Instagram", "Behance"],
  },
  "creative-2": {
    slug: "meera-joshi",
    name: "Meera Joshi",
    initials: "MJ",
    role: "Photographer",
    city: "Kochi",
    bio: "Photographs of the backwaters, monsoon streets and the people who work on them.",
    about:
      "I shoot documentary and travel stories across Kerala. My pictures have run in travel magazines and on the walls of a few homestays.",
    workLabel: "Series",
    projects: [
      { title: "Backwaters at 5 a.m.", text: "Boatmen and first light on Vembanad lake.", tags: ["Documentary"] },
      { title: "Monsoon, Fort Kochi", text: "Forty days of rain on the same three streets.", tags: ["Street"] },
      { title: "Chinese fishing nets", text: "The crews who still work the nets by hand.", tags: ["Portrait"] },
    ],
    skills: ["Documentary", "Lightroom", "Portraits", "Photo editing", "Printing"],
    education: [
      { title: "Diploma in Photography", place: "Light and Life Academy, Ooty", years: "2024" },
    ],
    email: "meera.joshi@example.com",
    links: ["Instagram"],
  },
  "creative-3": {
    slug: "zoya-khan",
    name: "Zoya Khan",
    initials: "ZK",
    role: "UX Designer",
    city: "Hyderabad",
    bio: "I design apps that feel friendly the first time you open them.",
    about:
      "Design student, chai enthusiast and regular at Hyderabad design meetups. I test every idea with five real people before I fall in love with it.",
    workLabel: "Things I made",
    projects: [
      { title: "Chai ordering app", text: "Order from the tapri downstairs and skip the queue.", tags: ["App design"] },
      { title: "Metro card redesign", text: "A recharge flow that takes three taps, not nine.", tags: ["UX research"] },
      { title: "Biryani finder", text: "A playful map of the city's best plates, rated by friends.", tags: ["Prototype"] },
    ],
    skills: ["Figma", "User research", "Prototyping", "Illustration", "Wireframes"],
    education: [
      { title: "B.Des., Interaction Design", place: "NIFT Hyderabad", years: "2023 to 2027" },
    ],
    email: "zoya.khan@example.com",
    links: ["LinkedIn", "Dribbble"],
  },
  "professional-4": {
    slug: "arjun-reddy",
    name: "Arjun Reddy",
    initials: "AR",
    role: "Software Engineer",
    city: "Hyderabad",
    bio: "Backend developer who likes small services, clear logs and fast tests.",
    about:
      "Final-year computer science student. I have interned twice, shipped a payments feature used by 40,000 people and still enjoy explaining recursion to juniors.",
    workLabel: "Projects",
    projects: [
      { title: "Hostel room allotment system", text: "Replaced a paper lottery for 1,200 students with a fair, auditable draw.", tags: ["Go", "PostgreSQL"] },
      { title: "Bus tracker for campus shuttles", text: "Live locations on a map, built with drivers' own phones.", tags: ["React Native", "Firebase"] },
      { title: "Open-source PDF splitter", text: "A command-line tool with 300 stars and a very patient maintainer.", tags: ["Rust", "CLI"] },
    ],
    skills: ["Go", "Java", "PostgreSQL", "Docker", "AWS", "System design"],
    experience: [
      { title: "Software Engineering Intern", place: "A fintech startup, Bengaluru", years: "May to Jul 2026", text: "Built the UPI refund flow and cut failed refunds by a third." },
      { title: "Summer Intern", place: "A logistics company, Hyderabad", years: "May to Jun 2025", text: "Wrote a route report that the operations team still opens every Monday." },
    ],
    education: [
      { title: "B.Tech. Computer Science", place: "JNTU Hyderabad", years: "2023 to 2027" },
      { title: "Class XII, MPC", place: "Narayana Junior College", years: "2023" },
    ],
    email: "arjun.reddy@example.com",
    links: ["LinkedIn", "GitHub"],
  },
  "creative-4": {
    slug: "sneha-kulkarni",
    name: "Sneha Kulkarni",
    initials: "SK",
    role: "Motion Designer",
    city: "Pune",
    bio: "I make logos move, explainers breathe and title cards worth pausing on.",
    about:
      "Animation graduate working with studios and indie musicians. I storyboard on paper, animate at night and render while I sleep.",
    workLabel: "Reel",
    projects: [
      { title: "Monsoon, a music video", text: "Two minutes of hand-drawn rain for a Marathi indie band.", tags: ["After Effects", "Frame by frame"] },
      { title: "Startup explainer series", text: "Six short films that made a billing product feel friendly.", tags: ["Motion", "Storyboard"] },
      { title: "Festival title sequence", text: "Opening titles for a Pune short-film festival.", tags: ["Cinema 4D", "Type"] },
    ],
    skills: ["After Effects", "Cinema 4D", "Blender", "Illustrator", "Storyboarding", "Sound sync"],
    experience: [
      { title: "Junior Motion Designer", place: "An animation studio, Pune", years: "2025 to now", text: "Explainers and brand films for product companies." },
      { title: "Freelance animator", place: "Indie musicians and cafes", years: "2023 to 2025", text: "Lyric videos, loops and looping menu boards." },
    ],
    education: [
      { title: "B.Des., Animation", place: "MIT Institute of Design, Pune", years: "2021 to 2025" },
    ],
    email: "sneha.kulkarni@example.com",
    links: ["Instagram", "Vimeo"],
  },
  "creative-5": {
    slug: "farhan-ali",
    name: "Farhan Ali",
    initials: "FA",
    role: "Architect",
    city: "Lucknow",
    bio: "Small buildings, old cities and the light between them.",
    about:
      "I trained in Lucknow and work on homes, courtyards and restorations. I draw by hand first, because a pencil argues less than software.",
    workLabel: "Selected work",
    projects: [
      { title: "Courtyard house, Aliganj", text: "A family home planned around a neem tree and the afternoon breeze.", tags: ["Residential", "Brick"] },
      { title: "Chowk haveli restoration", text: "Lime plaster, timber repairs and a roof that no longer leaks.", tags: ["Conservation"] },
      { title: "Riverside reading room", text: "A competition entry for a small public library on the Gomti.", tags: ["Public", "Competition"] },
    ],
    skills: ["Hand drafting", "AutoCAD", "Rhino", "Model making", "Site supervision", "Conservation"],
    experience: [
      { title: "Junior Architect", place: "A conservation practice, Lucknow", years: "2025 to now", text: "Measured drawings and site work on two listed buildings." },
      { title: "Intern", place: "A design studio, Ahmedabad", years: "2024", text: "Models and working drawings for a school campus." },
    ],
    education: [
      { title: "B.Arch.", place: "Faculty of Architecture, AKTU Lucknow", years: "2020 to 2025" },
    ],
    email: "farhan.ali@example.com",
    links: ["Instagram", "LinkedIn"],
  },
};
