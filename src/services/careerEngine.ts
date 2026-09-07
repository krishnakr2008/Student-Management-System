import { CareerRoleRecommendation } from '../types';

export const ALL_SKILLS = [
  'HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Vue.js', 'Angular', 'Next.js',
  'Tailwind CSS', 'Redux', 'Node.js', 'Express.js', 'MongoDB', 'PostgreSQL', 'SQL',
  'Supabase', 'Python', 'Pandas', 'NumPy', 'Scikit-Learn', 'PyTorch', 'TensorFlow',
  'Java', 'Spring Boot', 'C++', 'Git', 'GitHub', 'AWS', 'Docker', 'REST APIs',
  'GraphQL', 'Linux', 'Unit Testing', 'CI/CD'
];

export interface CareerTrackDefinition {
  role: string;
  requiredSkills: string[];
  description: string;
  roadmapPhases: Array<{
    phase: number;
    title: string;
    topics: string[];
    milestone: string;
  }>;
  suggestedProjects: Array<{
    id: string;
    name: string;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    description: string;
    technologies: string[];
    features: string[];
    skills_gained: string[];
  }>;
  interviewQuestions: Array<{
    id: string;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    question: string;
    answer: string;
    topic: string;
  }>;
}

export const CAREER_TRACKS: CareerTrackDefinition[] = [
  {
    role: 'Frontend Developer',
    requiredSkills: ['HTML', 'CSS', 'JavaScript', 'React', 'Tailwind CSS', 'TypeScript', 'Git'],
    description: 'Specializes in crafting user-facing interfaces, responsive layouts, interactive components, and web applications.',
    roadmapPhases: [
      { phase: 1, title: 'Web Fundamentals', topics: ['HTML5 Semantic tags', 'CSS Flexbox & Grid', 'Responsive design'], milestone: 'Build a responsive portfolio page' },
      { phase: 2, title: 'Modern JavaScript (ES6+)', topics: ['Async/Await', 'Promises', 'DOM Manipulation', 'Closures'], milestone: 'Create an interactive ES6 JS app' },
      { phase: 3, title: 'React Fundamentals', topics: ['JSX', 'Props & State', 'Hooks (useState, useEffect)', 'Component Lifecycle'], milestone: 'Build a React Task Manager' },
      { phase: 4, title: 'State & Routing', topics: ['React Router DOM', 'Context API', 'Redux Toolkit'], milestone: 'Build a Multi-page E-commerce UI' },
      { phase: 5, title: 'TypeScript Integration', topics: ['Interfaces & Types', 'Generics', 'Type-safe React Props'], milestone: 'Migrate React app to TypeScript' },
      { phase: 6, title: 'Modern CSS Frameworks', topics: ['Tailwind CSS', 'CSS Modules', 'Styled Components'], milestone: 'Style a SaaS Dashboard with Tailwind' },
      { phase: 7, title: 'API & Async Data', topics: ['Axios / Fetch API', 'React Query / SWR', 'Error Boundaries'], milestone: 'Connect React UI to REST APIs' },
      { phase: 8, title: 'Testing & Tooling', topics: ['Vite', 'Jest', 'React Testing Library', 'ESLint / Prettier'], milestone: 'Write unit tests for UI components' },
      { phase: 9, title: 'Performance & SEO', topics: ['Code splitting', 'Lazy loading', 'Lighthouse optimization'], milestone: 'Achieve 90+ Lighthouse score' },
      { phase: 10, title: 'Interview & Portfolio', topics: ['Mock interviews', 'System design basics', 'Resume polishing'], milestone: 'Deploy portfolio on Vercel' }
    ],
    suggestedProjects: [
      {
        id: 'proj-fe-1',
        name: 'Interactive Analytics Dashboard',
        difficulty: 'Intermediate',
        description: 'A modern web dashboard with charts, theme switching, and live data filtering.',
        technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Recharts'],
        features: ['Dark/Light mode', 'Exportable reports', 'Filtering & sorting', 'Responsive sidebar'],
        skills_gained: ['State management', 'Data visualization', 'Tailwind layout design']
      },
      {
        id: 'proj-fe-2',
        name: 'E-Commerce Product Catalog with Cart',
        difficulty: 'Beginner',
        description: 'Shopping application featuring product search, category filters, and interactive cart modal.',
        technologies: ['React', 'JavaScript', 'CSS Modules'],
        features: ['Product filtering', 'Cart persistence', 'Checkout summary modal'],
        skills_gained: ['Context API', 'Local storage persistence', 'UX design']
      },
      {
        id: 'proj-fe-3',
        name: 'Real-Time Collaborative Kanban Board',
        difficulty: 'Advanced',
        description: 'Drag-and-drop task board with column creation, tags, and progress tracking.',
        technologies: ['React', 'TypeScript', 'Dnd-kit', 'Tailwind CSS'],
        features: ['Drag & drop columns', 'Tag search', 'Task modal editor', 'Export JSON'],
        skills_gained: ['Drag and drop mechanics', 'Complex React state', 'Performance tuning']
      }
    ],
    interviewQuestions: [
      {
        id: 'iq-fe-1',
        difficulty: 'Beginner',
        topic: 'React',
        question: 'What is the Virtual DOM and how does React use it?',
        answer: 'The Virtual DOM is an in-memory lightweight representation of the real DOM. When component state changes, React creates a new Virtual DOM tree, computes differences (diffing algorithm) against the previous tree, and batch-updates only the changed elements in the real DOM for optimal performance.'
      },
      {
        id: 'iq-fe-2',
        difficulty: 'Intermediate',
        topic: 'JavaScript',
        question: 'Explain the difference between call, apply, and bind in JavaScript.',
        answer: 'All three methods explicitly set the `this` context of a function. `call()` invokes the function immediately with arguments passed individually. `apply()` invokes it immediately with arguments passed as an array. `bind()` returns a new copy of the function with `this` bound, allowing delayed execution.'
      },
      {
        id: 'iq-fe-3',
        difficulty: 'Advanced',
        topic: 'React Performance',
        question: 'How do useMemo and useCallback optimize React applications?',
        answer: '`useMemo` memoizes the computed result of an expensive calculation across re-renders unless its dependencies change. `useCallback` memoizes a callback function definition between re-renders to prevent unnecessary child component re-rendering when passed as props.'
      }
    ]
  },
  {
    role: 'MERN Stack Developer',
    requiredSkills: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'Express.js', 'MongoDB', 'REST APIs', 'Git'],
    description: 'Full-stack engineer proficient in MongoDB, Express.js, React.js, and Node.js for end-to-end web application development.',
    roadmapPhases: [
      { phase: 1, title: 'Frontend Core', topics: ['HTML', 'CSS', 'Modern JavaScript'], milestone: 'Build responsive web templates' },
      { phase: 2, title: 'React Deep Dive', topics: ['Hooks', 'Router', 'State Management'], milestone: 'Create dynamic frontend app' },
      { phase: 3, title: 'Node.js Fundamentals', topics: ['Event loop', 'File system', 'NPM modules'], milestone: 'Build CLI tool in Node.js' },
      { phase: 4, title: 'Express.js Web Servers', topics: ['Routing', 'Middleware', 'Error handling'], milestone: 'Create Express REST API server' },
      { phase: 5, title: 'Database & MongoDB', topics: ['NoSQL concepts', 'Mongoose ORM', 'Aggregations'], milestone: 'Design database schemas & queries' },
      { phase: 6, title: 'Authentication & Security', topics: ['JWT', 'Bcrypt password hashing', 'CORS & Rate limiting'], milestone: 'Implement login/signup auth flow' },
      { phase: 7, title: 'Full Stack Integration', topics: ['Connecting React to Express API', 'Environment variables'], milestone: 'Build & connect MERN App' },
      { phase: 8, title: 'State Management & Async Data', topics: ['Redux Toolkit', 'Axios interceptors'], milestone: 'Implement global state & token refresh' },
      { phase: 9, title: 'Deployment & DevOps', topics: ['Vercel', 'Render / Heroku', 'MongoDB Atlas cloud'], milestone: 'Deploy live MERN project' },
      { phase: 10, title: 'Advanced Full Stack Features', topics: ['WebSockets (Socket.io)', 'File Uploads (Multer/Cloudinary)'], milestone: 'Add real-time features & portfolio presentation' }
    ],
    suggestedProjects: [
      {
        id: 'proj-mern-1',
        name: 'Smart Student Management System',
        difficulty: 'Advanced',
        description: 'Complete academic management portal with role-based access, attendance analytics, and resume builder.',
        technologies: ['React', 'Node.js', 'Express.js', 'MongoDB', 'Tailwind CSS'],
        features: ['JWT Auth', 'Role routing', 'Recharts analytics', 'PDF generation'],
        skills_gained: ['Full-stack architecture', 'DB schema design', 'Role security']
      },
      {
        id: 'proj-mern-2',
        name: 'Multi-Vendor E-Commerce Platform',
        difficulty: 'Advanced',
        description: 'Full-featured online store with seller dashboards, payment gateway integration, and order tracking.',
        technologies: ['React', 'Node.js', 'Express.js', 'MongoDB', 'Stripe API'],
        features: ['Shopping cart', 'Stripe checkout', 'Order history', 'Admin dashboard'],
        skills_gained: ['Third-party API integration', 'Transaction safety', 'CRUD']
      }
    ],
    interviewQuestions: [
      {
        id: 'iq-mern-1',
        difficulty: 'Beginner',
        topic: 'Node.js',
        question: 'What is the Node.js Event Loop and how does it handle concurrency?',
        answer: 'Node.js uses a single-threaded non-blocking event loop. Asynchronous I/O operations (file system, network calls) are delegated to system kernel or libuv thread pool. When completed, callbacks are pushed to event queues (Microtask / Macrotask queue) and processed sequentially without blocking the main execution thread.'
      },
      {
        id: 'iq-mern-2',
        difficulty: 'Intermediate',
        topic: 'Express.js',
        question: 'What is middleware in Express.js and how does next() work?',
        answer: 'Middleware functions have access to the request object (`req`), response object (`res`), and the next middleware function (`next`). Calling `next()` passes execution control to the next middleware handler in the stack. Omitting `next()` and not ending the response will leave the request hanging.'
      }
    ]
  },
  {
    role: 'Data Analyst / Python Engineer',
    requiredSkills: ['Python', 'SQL', 'Pandas', 'NumPy', 'Git'],
    description: 'Analyzes raw business data, constructs SQL queries, generates statistical insights, and builds visual dashboards.',
    roadmapPhases: [
      { phase: 1, title: 'Python Fundamentals', topics: ['Data types', 'Loops & Functions', 'File handling'], milestone: 'Create Python data processing scripts' },
      { phase: 2, title: 'Relational Databases & SQL', topics: ['SELECT, JOIN, GROUP BY', 'Subqueries', 'Window functions'], milestone: 'Execute complex SQL data queries' },
      { phase: 3, title: 'Data Wrangling with Pandas', topics: ['DataFrames', 'Cleaning missing data', 'Merging & Pivoting'], milestone: 'Clean & transform messy CSV dataset' },
      { phase: 4, title: 'Numerical Computing with NumPy', topics: ['Arrays', 'Vectorized math', 'Matrix operations'], milestone: 'Perform numerical analysis' },
      { phase: 5, title: 'Data Visualization', topics: ['Matplotlib', 'Seaborn', 'Plotly interactive charts'], milestone: 'Create exploratory data analysis report' },
      { phase: 6, title: 'Statistical Analysis', topics: ['Probability', 'Hypothesis testing', 'Correlation & Regression'], milestone: 'Conduct statistical hypothesis test' },
      { phase: 7, title: 'BI Dashboards', topics: ['PowerBI / Tableau', 'Streamlit dashboards'], milestone: 'Build interactive Streamlit data app' },
      { phase: 8, title: 'Database Optimization', topics: ['Indexing', 'Query execution plans', 'DB Views'], milestone: 'Optimize slow SQL queries' },
      { phase: 9, title: 'Automated Reporting', topics: ['ETL pipelines', 'Automated email reports', 'Cron jobs'], milestone: 'Build automated Python ETL pipeline' },
      { phase: 10, title: 'Portfolio & Interview Prep', topics: ['Kaggle competitions', 'Data storytelling', 'SQL whiteboard problems'], milestone: 'Publish data analysis portfolio' }
    ],
    suggestedProjects: [
      {
        id: 'proj-da-1',
        name: 'Student Academic & Placement Insights Dashboard',
        difficulty: 'Intermediate',
        description: 'Exploratory data analysis of student grades, attendance, and campus hiring outcomes.',
        technologies: ['Python', 'Pandas', 'Seaborn', 'Streamlit', 'SQL'],
        features: ['Interactive charts', 'Grade distribution', 'Placement predictor'],
        skills_gained: ['Data cleaning', 'Statistical visualization', 'SQL Joins']
      }
    ],
    interviewQuestions: [
      {
        id: 'iq-da-1',
        difficulty: 'Beginner',
        topic: 'SQL',
        question: 'What is the difference between WHERE and HAVING in SQL?',
        answer: '`WHERE` filters individual rows BEFORE any grouping or aggregation takes place. `HAVING` filters aggregated groups AFTER `GROUP BY` has been performed.'
      }
    ]
  },
  {
    role: 'Java Backend Developer',
    requiredSkills: ['Java', 'Spring Boot', 'SQL', 'REST APIs', 'Git'],
    description: 'Engineers robust enterprise backends, microservices, secure RESTful APIs, and relational databases using Java & Spring.',
    roadmapPhases: [
      { phase: 1, title: 'Java Core', topics: ['OOP concepts', 'Collections framework', 'Exception handling'], milestone: 'Build Java OOP console app' },
      { phase: 2, title: 'Advanced Java', topics: ['Lambda expressions', 'Streams API', 'Multithreading'], milestone: 'Process data with Java Streams' },
      { phase: 3, title: 'SQL & Database Design', topics: ['Relational schemas', 'Transactions & ACID', 'PostgreSQL'], milestone: 'Design normalized SQL schema' },
      { phase: 4, title: 'Spring Framework Basics', topics: ['Dependency Injection', 'Inversion of Control', 'Spring Beans'], milestone: 'Build basic Spring application' },
      { phase: 5, title: 'Spring Boot REST APIs', topics: ['@RestController', 'Request mappings', 'DTO pattern'], milestone: 'Create RESTful API service' },
      { phase: 6, title: 'Persistence with Spring Data JPA', topics: ['Entities', 'Hibernate ORM', 'Repository interfaces'], milestone: 'Connect Spring Boot to PostgreSQL' },
      { phase: 7, title: 'Spring Security & Auth', topics: ['JWT authentication', 'Role-based authorization', 'OAuth2'], milestone: 'Secure REST API endpoints' },
      { phase: 8, title: 'Testing & Microservices', topics: ['JUnit 5', 'Mockito', 'Spring Cloud', 'Feign client'], milestone: 'Write unit tests for service layer' },
      { phase: 9, title: 'Docker & Deployment', topics: ['Dockerfile creation', 'Docker Compose', 'AWS EC2 / Elastic Beanstalk'], milestone: 'Containerize & deploy Spring Boot app' },
      { phase: 10, title: 'System Architecture', topics: ['Design patterns', 'Caching (Redis)', 'Message queues (Kafka)'], milestone: 'Build event-driven microservice' }
    ],
    suggestedProjects: [
      {
        id: 'proj-java-1',
        name: 'University Academic Portal Backend API',
        difficulty: 'Advanced',
        description: 'Enterprise REST API backend handling course registration, grade calculations, and student transcripts.',
        technologies: ['Java', 'Spring Boot', 'Spring Data JPA', 'PostgreSQL', 'JWT'],
        features: ['Role-based authorization', 'Automated GPA calculator', 'Swagger API docs'],
        skills_gained: ['Spring Security', 'ORM Hibernate', 'Unit testing']
      }
    ],
    interviewQuestions: [
      {
        id: 'iq-java-1',
        difficulty: 'Intermediate',
        topic: 'Spring Boot',
        question: 'What is Dependency Injection in Spring Framework?',
        answer: 'Dependency Injection (DI) is a design pattern where the Spring IoC Container creates, manages, and injects dependent objects into a class (via Constructor, Setter, or Field injection) rather than the class constructing them manually. This decouples classes and promotes testability.'
      }
    ]
  }
];

export const matchCareerTrack = (userSkills: string[]): CareerRoleRecommendation => {
  const normalizedUserSkills = userSkills.map(s => s.toLowerCase().trim());

  let bestTrack = CAREER_TRACKS[0];
  let maxScore = -1;
  let bestMatchedSkills: string[] = [];
  let bestMissingSkills: string[] = [];

  CAREER_TRACKS.forEach(track => {
    const matched = track.requiredSkills.filter(req => 
      normalizedUserSkills.includes(req.toLowerCase().trim())
    );
    const missing = track.requiredSkills.filter(req => 
      !normalizedUserSkills.includes(req.toLowerCase().trim())
    );

    const matchPercentage = Math.round((matched.length / track.requiredSkills.length) * 100);

    if (matchPercentage > maxScore) {
      maxScore = matchPercentage;
      bestTrack = track;
      bestMatchedSkills = matched;
      bestMissingSkills = missing;
    }
  });

  // Calculate high confidence score (minimum 40% base if skills selected)
  const finalMatchScore = Math.max(maxScore, userSkills.length > 0 ? 55 : 30);

  return {
    role: bestTrack.role,
    match_percentage: finalMatchScore,
    description: bestTrack.description,
    matched_skills: bestMatchedSkills.length > 0 ? bestMatchedSkills : userSkills,
    missing_skills: bestMissingSkills,
    roadmap_phases: bestTrack.roadmapPhases,
    suggested_projects: bestTrack.suggestedProjects,
    interview_questions: bestTrack.interviewQuestions,
  };
};

export const calculateCareerReadinessScore = (
  userSkillsCount: number,
  completedProjectsCount: number,
  verifiedCertificatesCount: number,
  hasInternship: boolean,
  resumeCompletenessPercent: number,
  cgpa: number
) => {
  const skillsScore = Math.min(100, Math.round((userSkillsCount / 8) * 100));
  const projectsScore = Math.min(100, Math.round((completedProjectsCount / 3) * 100));
  const certsScore = Math.min(100, Math.round((verifiedCertificatesCount / 2) * 100));
  const internshipScore = hasInternship ? 95 : 45;
  const resumeScore = resumeCompletenessPercent;
  const academicsScore = Math.min(100, Math.round((cgpa / 10) * 100));

  const overallScore = Math.round(
    skillsScore * 0.25 +
    projectsScore * 0.20 +
    certsScore * 0.15 +
    internshipScore * 0.15 +
    resumeScore * 0.15 +
    academicsScore * 0.10
  );

  return {
    overall: overallScore,
    breakdown: {
      skills: skillsScore,
      projects: projectsScore,
      certificates: certsScore,
      internship: internshipScore,
      resume: resumeScore,
      academics: academicsScore,
    }
  };
};
