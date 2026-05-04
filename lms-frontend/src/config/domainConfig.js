// Shared course structure for student and instructor
export const domainConfig = [
  {
    title: "Artificial Intelligence",
    courses: [
      {
        id: "intro-ai",
        name: "Introduction to AI",
        points: 10,
        topics: [
          { id: "whatisai", title: "What is AI?", filePath: "/courses/ArtificialIntelligence/whatisAI.txt" },
          { id: "History of AI", title: "History Of AI", filePath: "/courses/ArtificialIntelligence/History of AI.txt" },
          { id: "Goals", title: "Goals Of AI", filePath: "/courses/ArtificialIntelligence/goals.txt" },
          { id: "Types", title: "Types Of AI", filePath: "/courses/ArtificialIntelligence/TypesOfAI.txt" },
          { id: "versus", title: "AI vs Humans", filePath: "/courses/ArtificialIntelligence/aiVShuman.txt" },
          { id: "ai-applications", title: "AI Applications", filePath: "/courses/ArtificialIntelligence/aiApplications.txt" },
        ],
      },
      { id: "ml-basics", name: "Machine Learning Basics", points: 5, topics: [] },
      { id: "nn-basics", name: "Neural Networks", points: 5, topics: [] },
    ],
  },
  {
    title: "Cybersecurity",
    courses: [
      {
        id: "network-security",
        name: "Network Security",
        points: 10,
        topics: [
          { id: "what-is-threats", title: "What are Threats?", filePath: "/courses/cybersecurity/whatisthreats.txt" },
        ],
      },
      { id: "ethical-hacking", name: "Ethical Hacking", points: 5, topics: [] },
      { id: "cryptography", name: "Cryptography", points: 5, topics: [] },
    ],
  },
  {
    title: "Web Development",
    courses: [
      { id: "html-css", name: "HTML & CSS", points: 5, topics: [] },
      { id: "javascript", name: "JavaScript", points: 5, topics: [] },
      { id: "react-basics", name: "React Basics", points: 5, topics: [] },
    ],
  },
  {
    title: "App Development",
    courses: [
      { id: "flutter-basics", name: "Flutter Basics", points: 5, topics: [] },
      { id: "firebase", name: "Firebase", points: 5, topics: [] },
    ],
  },
  { title: "Cloud Computing", courses: [] },
];
