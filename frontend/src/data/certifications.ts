import { Certification } from "../types";

// Import badges from assets
import microsoftBadge from "../assets/ai-skills-fest-2026.webp";
import infosysDeepLearningDevelopers from "../assets/infosys-deep-learning-developers.webp";
import infosysRoboticProcessAutomation from "../assets/infosys-robotic-process-automation.webp";
import infosysComputerVision101 from "../assets/infosys-computer-vision-101.webp";
import infosysIntroToDeepLearning from "../assets/infosys-introduction-to-deep-learning.webp";
import infosysIntroToAI from "../assets/infosys-introduction-to-artificial-intelligence.webp";
import infosysNLP from "../assets/infosys-natural-language-processing.webp";
import infosysIntroToDataScience from "../assets/infosys-introduction-to-data-science.webp";

export const CERTIFICATIONS: Certification[] = [
  {
    id: "microsoft-ai-skills-fest-2026",
    title: "Microsoft AI Skills Fest 2026",
    issuer: "Microsoft",
    issueDate: "June 2026",
    description: "Successfully completed Microsoft AI Skills Fest 2026 and earned the official badge. This achievement demonstrates practical knowledge in Applied AI, Prompt Engineering, Workflow Automation, AI Ethics, Responsible AI, and AI Applications. The program focused on leveraging AI tools to enhance productivity, automate workflows, and solve real-world problems responsibly.",
    skills: [
      "Applied AI",
      "Prompt Engineering",
      "Workflow Automation",
      "Build Automation",
      "AI Tools Adoption",
      "Responsible AI",
      "AI Ethics",
      "Artificial Intelligence Applications"
    ],
    credentialUrl: "https://www.credly.com/badges/bb76917f-cac2-4f41-9234-ccc368c5a419/public_url",
    badgeImage: microsoftBadge,
    glowColor: "fuchsia",
    accentGradient: "from-violet-600/20 to-fuchsia-600/20"
  },
  {
    id: "infosys-deep-learning-developers",
    title: "Deep Learning for Developers",
    issuer: "Infosys Springboard",
    issueDate: "May 4, 2026",
    description: "Focuses on building, training, and deploying neural network models. Covers architectures like CNNs, RNNs, and Transformers, along with hands-on practice implementing deep learning pipelines for software development applications.",
    skills: [
      "Deep Learning",
      "Neural Networks",
      "CNN",
      "RNN",
      "Transformers",
      "Model Training",
      "Python"
    ],
    credentialUrl: null,
    badgeImage: infosysDeepLearningDevelopers,
    glowColor: "violet",
    accentGradient: "from-violet-600/20 to-purple-600/20"
  },
  {
    id: "infosys-robotic-process-automation",
    title: "Introduction to Robotic Process Automation",
    issuer: "Infosys Springboard",
    issueDate: "April 29, 2026",
    description: "Explores the foundational concepts of workflow automation and software robotics. Covers designing automated tasks, screen scraping, UI interaction modeling, and building bot workflows to streamline business processes.",
    skills: [
      "Robotic Process Automation",
      "Workflow Automation",
      "Process Mining",
      "Bot Development",
      "UI Automation"
    ],
    credentialUrl: null,
    badgeImage: infosysRoboticProcessAutomation,
    glowColor: "cyan",
    accentGradient: "from-cyan-600/20 to-teal-600/20"
  },
  {
    id: "infosys-computer-vision-101",
    title: "Computer Vision 101",
    issuer: "Infosys Springboard",
    issueDate: "April 21, 2026",
    description: "Covers foundational computer vision techniques and image processing. Topics include edge detection, image transformations, object detection, segmentation, and building neural networks to classify and process visual data.",
    skills: [
      "Computer Vision",
      "Image Processing",
      "OpenCV",
      "Image Classification",
      "Object Detection"
    ],
    credentialUrl: null,
    badgeImage: infosysComputerVision101,
    glowColor: "fuchsia",
    accentGradient: "from-fuchsia-600/20 to-pink-600/20"
  },
  {
    id: "infosys-introduction-to-deep-learning",
    title: "Introduction to Deep Learning",
    issuer: "Infosys Springboard",
    issueDate: "April 15, 2026",
    description: "Introduces the core concepts of artificial neural networks, backpropagation, and activation functions. Focuses on designing basic deep networks, optimization techniques, and overfitting prevention.",
    skills: [
      "Deep Learning",
      "Neural Networks",
      "Backpropagation",
      "Keras",
      "TensorFlow",
      "Optimization"
    ],
    credentialUrl: null,
    badgeImage: infosysIntroToDeepLearning,
    glowColor: "violet",
    accentGradient: "from-blue-600/20 to-indigo-600/20"
  },
  {
    id: "infosys-introduction-to-artificial-intelligence",
    title: "Introduction to Artificial Intelligence",
    issuer: "Infosys Springboard",
    issueDate: "April 14, 2026",
    description: "Provides a comprehensive introduction to AI fields, including machine learning, cognitive computing, heuristics, search algorithms, and the ethical implications of artificial intelligence systems.",
    skills: [
      "Artificial Intelligence",
      "Machine Learning",
      "Heuristics",
      "Search Algorithms",
      "Cognitive Computing",
      "AI Ethics"
    ],
    credentialUrl: null,
    badgeImage: infosysIntroToAI,
    glowColor: "cyan",
    accentGradient: "from-teal-600/20 to-emerald-600/20"
  },
  {
    id: "infosys-natural-language-processing",
    title: "Introduction to Natural Language Processing",
    issuer: "Infosys Springboard",
    issueDate: "April 2, 2026",
    description: "Explores core techniques for analyzing and representing text data. Covers tokenization, stemming, lemmatization, POS tagging, named entity recognition, and building statistical models for language processing.",
    skills: [
      "Natural Language Processing",
      "NLP",
      "Text Processing",
      "Tokenization",
      "NLTK",
      "Named Entity Recognition"
    ],
    credentialUrl: null,
    badgeImage: infosysNLP,
    glowColor: "violet",
    accentGradient: "from-indigo-600/20 to-purple-600/20"
  },
  {
    id: "infosys-introduction-to-data-science",
    title: "Introduction to Data Science",
    issuer: "Infosys Springboard",
    issueDate: "March 31, 2026",
    description: "Introduces the data science lifecycle, from data collection and cleaning to exploratory data analysis, visualization, and basic statistical modeling. Covers essential libraries like Pandas, NumPy, and Matplotlib.",
    skills: [
      "Data Science",
      "Exploratory Data Analysis",
      "Python",
      "Pandas",
      "NumPy",
      "Data Visualization",
      "Statistics"
    ],
    credentialUrl: null,
    badgeImage: infosysIntroToDataScience,
    glowColor: "cyan",
    accentGradient: "from-emerald-600/20 to-blue-600/20"
  }
];
