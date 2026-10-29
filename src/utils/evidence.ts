// SkillProof Evidence Detection Engine
// Deterministic pattern-matching rules for identifying skill evidence in repository files.
// These rules are transparent, bounded, and do not use AI/LLM.

import type { EvidenceItem, EvidenceStatus, EvidenceCategory, SkillResult } from '../types';

interface SkillRule {
  skill: string;
  // File extensions that are relevant to this skill
  relevantExtensions: string[];
  // File names that are particularly relevant
  relevantFilenames: string[];
  // Content patterns (regex) that indicate skill usage
  contentPatterns: { pattern: RegExp; relevance: string; category: EvidenceCategory }[];
  // Maximum evidence items to report
  maxEvidence: number;
}

const SKILL_RULES: SkillRule[] = [
  {
    skill: 'Python',
    relevantExtensions: ['.py', '.pyw', '.pyx', '.ipynb'],
    relevantFilenames: ['requirements.txt', 'setup.py', 'pyproject.toml', 'pipfile', 'tox.ini'],
    contentPatterns: [
      { pattern: /^import\s+\w+/m, relevance: 'Python import statement found', category: 'source_code' },
      { pattern: /def\s+\w+\s*\(/, relevance: 'Python function definition found', category: 'source_code' },
      { pattern: /class\s+\w+.*:/, relevance: 'Python class definition found', category: 'source_code' },
      { pattern: /if\s+__name__\s*==\s*['"]__main__['"]/, relevance: 'Python main entry point found', category: 'source_code' },
      { pattern: /from\s+\w+\s+import/, relevance: 'Python module import found', category: 'source_code' },
    ],
    maxEvidence: 5,
  },
  {
    skill: 'JavaScript',
    relevantExtensions: ['.js', '.jsx', '.mjs', '.cjs'],
    relevantFilenames: ['package.json', '.eslintrc.js', 'webpack.config.js', 'babel.config.js'],
    contentPatterns: [
      { pattern: /const\s+\w+\s*=\s*require\(/, relevance: 'CommonJS require found', category: 'source_code' },
      { pattern: /import\s+.*\s+from\s+['"]/, relevance: 'ES module import found', category: 'source_code' },
      { pattern: /export\s+(default\s+)?(function|class|const)/, relevance: 'ES module export found', category: 'source_code' },
      { pattern: /async\s+function|=>\s*{/, relevance: 'Async/arrow function pattern found', category: 'source_code' },
      { pattern: /addEventListener|querySelector|fetch\(/, relevance: 'DOM/Web API usage found', category: 'source_code' },
    ],
    maxEvidence: 5,
  },
  {
    skill: 'TypeScript',
    relevantExtensions: ['.ts', '.tsx'],
    relevantFilenames: ['tsconfig.json', 'tslint.json'],
    contentPatterns: [
      { pattern: /:\s*(string|number|boolean|any|void|never)\b/, relevance: 'TypeScript type annotation found', category: 'source_code' },
      { pattern: /interface\s+\w+/, relevance: 'TypeScript interface definition found', category: 'source_code' },
      { pattern: /type\s+\w+\s*=/, relevance: 'TypeScript type alias found', category: 'source_code' },
      { pattern: /<[A-Z]\w*>/, relevance: 'TypeScript generic usage found', category: 'source_code' },
      { pattern: /enum\s+\w+/, relevance: 'TypeScript enum definition found', category: 'source_code' },
    ],
    maxEvidence: 5,
  },
  {
    skill: 'Java',
    relevantExtensions: ['.java'],
    relevantFilenames: ['pom.xml', 'build.gradle', 'build.gradle.kts', 'settings.gradle'],
    contentPatterns: [
      { pattern: /public\s+class\s+\w+/, relevance: 'Java class definition found', category: 'source_code' },
      { pattern: /public\s+static\s+void\s+main/, relevance: 'Java main method found', category: 'source_code' },
      { pattern: /import\s+java\.\w+/, relevance: 'Java standard library import found', category: 'source_code' },
      { pattern: /@(Override|Test|Autowired|RequestMapping)/, relevance: 'Java annotation usage found', category: 'source_code' },
      { pattern: /implements\s+\w+|extends\s+\w+/, relevance: 'Java inheritance/implementation found', category: 'source_code' },
    ],
    maxEvidence: 5,
  },
  {
    skill: 'C/C++',
    relevantExtensions: ['.c', '.cpp', '.cc', '.cxx', '.h', '.hpp', '.hxx'],
    relevantFilenames: ['CMakeLists.txt', 'Makefile', 'makefile', '.clang-format'],
    contentPatterns: [
      { pattern: /#include\s*[<"].*[>"]/, relevance: 'C/C++ include directive found', category: 'source_code' },
      { pattern: /int\s+main\s*\(/, relevance: 'C/C++ main function found', category: 'source_code' },
      { pattern: /std::\w+/, relevance: 'C++ standard library usage found', category: 'source_code' },
      { pattern: /class\s+\w+\s*(\{|:)/, relevance: 'C++ class definition found', category: 'source_code' },
      { pattern: /template\s*</, relevance: 'C++ template usage found', category: 'source_code' },
    ],
    maxEvidence: 5,
  },
  {
    skill: 'React',
    relevantExtensions: ['.jsx', '.tsx', '.js', '.ts'],
    relevantFilenames: [],
    contentPatterns: [
      { pattern: /import\s+.*\s+from\s+['"]react['"]/, relevance: 'React import found', category: 'dependency' },
      { pattern: /useState|useEffect|useContext|useRef|useMemo/, relevance: 'React hooks usage found', category: 'source_code' },
      { pattern: /export\s+(default\s+)?function\s+\w+.*\(.*\).*\{/, relevance: 'React component function found', category: 'source_code' },
      { pattern: /<[A-Z]\w+.*>/, relevance: 'JSX component usage found', category: 'source_code' },
      { pattern: /React\.createElement|ReactDOM/, relevance: 'React API usage found', category: 'source_code' },
    ],
    maxEvidence: 5,
  },
  {
    skill: 'SQL',
    relevantExtensions: ['.sql'],
    relevantFilenames: ['schema.sql', 'migration.sql', 'init.sql', 'seed.sql'],
    contentPatterns: [
      { pattern: /CREATE\s+(TABLE|DATABASE|INDEX|VIEW)/i, relevance: 'SQL CREATE statement found', category: 'source_code' },
      { pattern: /SELECT\s+.*\s+FROM/i, relevance: 'SQL SELECT query found', category: 'source_code' },
      { pattern: /INSERT\s+INTO/i, relevance: 'SQL INSERT statement found', category: 'source_code' },
      { pattern: /JOIN\s+\w+/i, relevance: 'SQL JOIN operation found', category: 'source_code' },
      { pattern: /ALTER\s+TABLE|DROP\s+TABLE/i, relevance: 'SQL schema modification found', category: 'source_code' },
    ],
    maxEvidence: 5,
  },
  {
    skill: 'Git',
    relevantExtensions: [],
    relevantFilenames: ['.gitignore', '.gitattributes', '.gitmodules'],
    contentPatterns: [
      { pattern: /^[^#]*\b(node_modules|__pycache__|\.env|dist|build)\b/m, relevance: 'Git ignore patterns found in .gitignore', category: 'configuration' },
      { pattern: /submodule|subtree/i, relevance: 'Git submodule/subtree reference found', category: 'configuration' },
      { pattern: /merge|rebase|cherry-pick/i, relevance: 'Git workflow reference found', category: 'documentation' },
    ],
    maxEvidence: 3,
  },
  {
    skill: 'Docker',
    relevantExtensions: ['.dockerfile'],
    relevantFilenames: ['Dockerfile', 'docker-compose.yml', 'docker-compose.yaml', '.dockerignore'],
    contentPatterns: [
      { pattern: /^FROM\s+\w+/m, relevance: 'Docker base image found', category: 'infrastructure' },
      { pattern: /^(RUN|CMD|ENTRYPOINT|COPY|ADD)\s+/m, relevance: 'Docker instruction found', category: 'infrastructure' },
      { pattern: /docker-compose|services:/, relevance: 'Docker Compose configuration found', category: 'infrastructure' },
      { pattern: /EXPOSE\s+\d+/, relevance: 'Docker port exposure found', category: 'infrastructure' },
    ],
    maxEvidence: 5,
  },
  {
    skill: 'HTML/CSS',
    relevantExtensions: ['.html', '.htm', '.css', '.scss', '.sass', '.less'],
    relevantFilenames: ['index.html', 'styles.css', 'main.css'],
    contentPatterns: [
      { pattern: /<!DOCTYPE\s+html>|<html/i, relevance: 'HTML document structure found', category: 'source_code' },
      { pattern: /<(div|section|article|header|nav|main|footer)\b/, relevance: 'HTML semantic elements found', category: 'source_code' },
      { pattern: /\.[\w-]+\s*\{/, relevance: 'CSS class selector found', category: 'source_code' },
      { pattern: /display:\s*(flex|grid|block)/, relevance: 'CSS layout technique found', category: 'source_code' },
      { pattern: /@media\s*\(/, relevance: 'CSS media query found', category: 'source_code' },
    ],
    maxEvidence: 5,
  },
  {
    skill: 'Node.js',
    relevantExtensions: ['.js', '.ts', '.json'],
    relevantFilenames: ['package.json', 'server.js', 'app.js', 'index.js'],
    contentPatterns: [
      { pattern: /require\(['"]express['"]\)|import.*express/, relevance: 'Express.js usage found', category: 'dependency' },
      { pattern: /app\.(get|post|put|delete|use)\s*\(/, relevance: 'Express route handler found', category: 'source_code' },
      { pattern: /process\.env\./, relevance: 'Node.js environment variable access found', category: 'source_code' },
      { pattern: /http\.createServer|app\.listen/, relevance: 'Node.js server setup found', category: 'source_code' },
      { pattern: /__dirname|__filename|process\./, relevance: 'Node.js globals usage found', category: 'source_code' },
    ],
    maxEvidence: 5,
  },
  {
    skill: 'REST APIs',
    relevantExtensions: ['.js', '.ts', '.py', '.java', '.go', '.rb'],
    relevantFilenames: [],
    contentPatterns: [
      { pattern: /fetch\(|axios\.|requests\.(get|post)|http\.client/i, relevance: 'HTTP client usage found', category: 'source_code' },
      { pattern: /\/api\/|\/v\d+\//, relevance: 'API endpoint pattern found', category: 'source_code' },
      { pattern: /JSON\.parse|\.json\(\)|jsonify/, relevance: 'JSON handling found', category: 'source_code' },
      { pattern: /status.*200|status.*201|status.*404|status.*500/, relevance: 'HTTP status code handling found', category: 'source_code' },
      { pattern: /Content-Type|Authorization|Bearer/, relevance: 'HTTP header handling found', category: 'source_code' },
    ],
    maxEvidence: 5,
  },
  {
    skill: 'Data Analysis',
    relevantExtensions: ['.py', '.ipynb', '.r', '.R'],
    relevantFilenames: [],
    contentPatterns: [
      { pattern: /import\s+(pandas|numpy|matplotlib|seaborn)/, relevance: 'Data analysis library import found', category: 'dependency' },
      { pattern: /pd\.DataFrame|pd\.read_|np\.array/, relevance: 'Pandas/NumPy data structure found', category: 'source_code' },
      { pattern: /\.groupby\(|\.merge\(|\.pivot\(/, relevance: 'Data transformation operation found', category: 'source_code' },
      { pattern: /plt\.(plot|show|figure)|sns\./, relevance: 'Data visualization code found', category: 'source_code' },
      { pattern: /describe\(\)|value_counts|corr\(\)/, relevance: 'Statistical analysis method found', category: 'source_code' },
    ],
    maxEvidence: 5,
  },
  {
    skill: 'Machine Learning',
    relevantExtensions: ['.py', '.ipynb'],
    relevantFilenames: [],
    contentPatterns: [
      { pattern: /import\s+(sklearn|tensorflow|keras|torch|pytorch)/, relevance: 'ML framework import found', category: 'dependency' },
      { pattern: /model\.fit|model\.predict|model\.evaluate/, relevance: 'Model training/prediction found', category: 'source_code' },
      { pattern: /train_test_split|cross_val_score/, relevance: 'ML evaluation technique found', category: 'source_code' },
      { pattern: /Sequential|Dense|Conv2D|LSTM/, relevance: 'Neural network layer found', category: 'source_code' },
      { pattern: /accuracy|precision|recall|f1_score|roc_auc/, relevance: 'ML metric found', category: 'source_code' },
    ],
    maxEvidence: 5,
  },
  {
    skill: 'Testing',
    relevantExtensions: ['.py', '.js', '.ts', '.jsx', '.tsx', '.java', '.go'],
    relevantFilenames: ['pytest.ini', 'jest.config.js', 'jest.config.ts', '.mocharc.yml', 'karma.conf.js'],
    contentPatterns: [
      { pattern: /def\s+test_\w+|def\s+test\w+/, relevance: 'Python test function found', category: 'test' },
      { pattern: /describe\(|it\(|test\(/, relevance: 'Test suite/case definition found', category: 'test' },
      { pattern: /assert\s|expect\(|assertEqual|assertTrue/, relevance: 'Test assertion found', category: 'test' },
      { pattern: /@Test|@pytest|@BeforeEach|@BeforeAll/, relevance: 'Test annotation/decorator found', category: 'test' },
      { pattern: /mock|Mock|patch|spy|stub/i, relevance: 'Test mocking/spying found', category: 'test' },
    ],
    maxEvidence: 5,
  },
  {
    skill: 'CI/CD',
    relevantExtensions: ['.yml', '.yaml'],
    relevantFilenames: [
      '.github/workflows/ci.yml', '.github/workflows/cd.yml',
      '.travis.yml', '.circleci/config.yml', 'Jenkinsfile',
      '.gitlab-ci.yml', 'azure-pipelines.yml',
    ],
    contentPatterns: [
      { pattern: /on:\s*(push|pull_request)/, relevance: 'CI trigger configuration found', category: 'infrastructure' },
      { pattern: /steps:|run:/, relevance: 'CI step definition found', category: 'infrastructure' },
      { pattern: /uses:\s+actions\//, relevance: 'GitHub Actions usage found', category: 'infrastructure' },
      { pattern: /deploy|publish|release/i, relevance: 'CD deployment step found', category: 'infrastructure' },
      { pattern: /pytest|npm\s+test|mvn\s+test|gradle\s+test/, relevance: 'CI test execution found', category: 'infrastructure' },
    ],
    maxEvidence: 5,
  },
  {
    skill: 'Cloud (AWS/GCP/Azure)',
    relevantExtensions: ['.yml', '.yaml', '.json', '.tf', '.py', '.js', '.ts'],
    relevantFilenames: ['serverless.yml', 'terraform.tf', 'main.tf', 'app.yaml', 'Procfile'],
    contentPatterns: [
      { pattern: /aws|amazon|s3|ec2|lambda|dynamodb/i, relevance: 'AWS service reference found', category: 'infrastructure' },
      { pattern: /gcp|google\.cloud|gcloud|firebase/i, relevance: 'GCP service reference found', category: 'infrastructure' },
      { pattern: /azure|azurerm|microsoft\.azure/i, relevance: 'Azure service reference found', category: 'infrastructure' },
      { pattern: /provider\s+["']?(aws|google|azurerm)["']?/, relevance: 'Cloud provider configuration found', category: 'infrastructure' },
      { pattern: /resource\s+["'](aws_|google_|azurerm_)/, relevance: 'Infrastructure as code resource found', category: 'infrastructure' },
    ],
    maxEvidence: 5,
  },
  {
    skill: 'Linux/Shell',
    relevantExtensions: ['.sh', '.bash', '.zsh', '.fish'],
    relevantFilenames: ['Makefile', 'makefile', '.bashrc', '.bash_profile', 'setup.sh', 'install.sh'],
    contentPatterns: [
      { pattern: /^#!\/bin\/(ba)?sh/, relevance: 'Shell script shebang found', category: 'source_code' },
      { pattern: /\$\(|`[^`]+`/, relevance: 'Shell command substitution found', category: 'source_code' },
      { pattern: /if\s*\[\s*.*\s*\]|case\s+\w+\s+in/, relevance: 'Shell conditional found', category: 'source_code' },
      { pattern: /for\s+\w+\s+in|while\s+read/, relevance: 'Shell loop found', category: 'source_code' },
      { pattern: /\b(grep|awk|sed|find|xargs|curl|wget)\b/, relevance: 'Common Unix utility found', category: 'source_code' },
    ],
    maxEvidence: 5,
  },
  {
    skill: 'MongoDB/NoSQL',
    relevantExtensions: ['.js', '.ts', '.py', '.json'],
    relevantFilenames: [],
    contentPatterns: [
      { pattern: /mongoose|mongodb|MongoClient/, relevance: 'MongoDB driver/client found', category: 'dependency' },
      { pattern: /Schema\s*=|new\s+Schema|model\(/, relevance: 'MongoDB schema/model found', category: 'source_code' },
      { pattern: /\.find\(|\.findOne\(|\.insertMany|\.aggregate/, relevance: 'MongoDB query operation found', category: 'source_code' },
      { pattern: /redis|cassandra|firebase.*firestore|dynamodb/i, relevance: 'NoSQL database reference found', category: 'dependency' },
    ],
    maxEvidence: 5,
  },
  {
    skill: 'Algorithms',
    relevantExtensions: ['.py', '.js', '.ts', '.java', '.cpp', '.c'],
    relevantFilenames: [],
    contentPatterns: [
      { pattern: /def\s+(sort|search|binary_search|merge_sort|quick_sort|bfs|dfs)/i, relevance: 'Algorithm implementation found', category: 'source_code' },
      { pattern: /class\s+(Node|TreeNode|LinkedList|Stack|Queue|Graph|HashTable)/i, relevance: 'Data structure definition found', category: 'source_code' },
      { pattern: /O\(n\)|O\(log|time.*complexity|space.*complexity/i, relevance: 'Complexity analysis reference found', category: 'documentation' },
      { pattern: /recursion|recursive|dynamic.programming|greedy/i, relevance: 'Algorithm technique reference found', category: 'documentation' },
      { pattern: /while.*left.*right|binary.search|two.pointer/i, relevance: 'Algorithmic pattern found', category: 'source_code' },
    ],
    maxEvidence: 5,
  },
];

/**
 * Get evidence category label for display
 */
export function getCategoryLabel(category: EvidenceCategory): string {
  switch (category) {
    case 'source_code': return 'Source code';
    case 'configuration': return 'Configuration';
    case 'dependency': return 'Dependency declaration';
    case 'test': return 'Test';
    case 'documentation': return 'Documentation';
    case 'infrastructure': return 'Infrastructure';
    case 'project_structure': return 'Project structure';
    default: return 'Other';
  }
}

/**
 * Analyze a file's content for evidence of a specific skill
 */
function analyzeFileForSkill(
  file: { name: string; path: string; html_url: string },
  content: string,
  rule: SkillRule
): EvidenceItem | null {
  const ext = '.' + file.name.split('.').pop()?.toLowerCase();

  // Check if file is relevant to this skill
  const isRelevantExt = rule.relevantExtensions.some(re => ext === re);
  const isRelevantFilename = rule.relevantFilenames.some(fn =>
    file.name.toLowerCase() === fn.toLowerCase() ||
    file.path.toLowerCase().endsWith(fn.toLowerCase())
  );

  if (!isRelevantExt && !isRelevantFilename) return null;

  // Check content patterns
  const matches: { pattern: RegExp; relevance: string; category: EvidenceCategory }[] = [];
  for (const cp of rule.contentPatterns) {
    if (cp.pattern.test(content)) {
      matches.push(cp);
    }
  }

  if (matches.length === 0) return null;

  // Extract a relevant snippet (first 200 chars around the first match)
  let snippet = '';
  const firstMatch = matches[0].pattern.exec(content);
  if (firstMatch && firstMatch.index !== undefined) {
    const start = Math.max(0, firstMatch.index - 50);
    const end = Math.min(content.length, firstMatch.index + 150);
    snippet = content.slice(start, end).replace(/\n/g, ' ').trim();
    if (snippet.length > 200) snippet = snippet.slice(0, 200) + '...';
  }

  // Use the category of the first match
  const primaryCategory = matches[0].category;

  return {
    file: file.name,
    filePath: file.path,
    htmlUrl: file.html_url,
    snippet,
    relevance: matches.map(m => m.relevance).join('; '),
    category: primaryCategory,
  };
}

/**
 * Run full analysis for all selected skills
 */
export async function analyzeSkills(
  owner: string,
  repo: string,
  selectedSkills: string[],
  filesWithContent: { file: { name: string; path: string; html_url: string }; content: string }[],
  totalFiles: number,
  filesInspected: number,
  inspectionComplete: boolean
): Promise<SkillResult[]> {
  const results: SkillResult[] = [];

  for (const skill of selectedSkills) {
    const rule = SKILL_RULES.find(r => r.skill === skill);
    if (!rule) {
      results.push({
        skill,
        status: 'needs_further_assessment',
        evidence: [],
        limitations: ['No detection rules available for this skill in the current version.'],
        filesInspected,
        totalFilesAvailable: totalFiles,
        inspectionComplete,
        statusExplanation: 'No detection rules are available for this skill. Manual assessment is required.',
      });
      continue;
    }

    const evidence: EvidenceItem[] = [];
    const seenFiles = new Set<string>();

    for (const { file, content } of filesWithContent) {
      if (evidence.length >= rule.maxEvidence) break;

      // Deduplicate: skip if we already have evidence from this file
      if (seenFiles.has(file.path)) continue;

      const item = analyzeFileForSkill(file, content, rule);
      if (item) {
        evidence.push(item);
        seenFiles.add(file.path);
      }
    }

    let status: EvidenceStatus;
    let statusExplanation: string;
    const limitations: string[] = [];

    if (evidence.length > 0) {
      status = 'evidence_found';
      statusExplanation = 'Potentially relevant artifacts matching this skill\'s detection rules were identified in the inspected files. This suggests possible supporting evidence but does not establish authorship, proficiency, or job readiness.';
      if (!inspectionComplete) {
        statusExplanation += ' Note: the inspection was limited — additional evidence may exist in uninspected files.';
      }
    } else if (!inspectionComplete) {
      status = 'inspection_incomplete';
      statusExplanation = 'The inspection did not complete sufficiently to support a reliable conclusion for this skill. Not all repository files were examined due to inspection limits.';
    } else if (filesInspected < totalFiles) {
      status = 'needs_further_assessment';
      statusExplanation = 'The available artifacts in the inspected files are insufficient to support a meaningful conclusion. Additional examination or practical assessment would be needed.';
    } else {
      status = 'not_found_in_inspected_files';
      statusExplanation = 'No matching evidence was found in the files that were inspected. This does not mean the person lacks this skill — evidence may exist in files that were not examined, or in work not captured in this repository.';
    }

    // Add standard limitations
    limitations.push('Evidence suggests potential use of this skill; it does not prove authorship or proficiency.');
    if (!inspectionComplete) {
      limitations.push(`Inspection was limited: only ${filesInspected} of ${totalFiles} files were examined (bounded for performance and API limits).`);
    } else if (filesInspected < totalFiles) {
      limitations.push(`${filesInspected} of ${totalFiles} files were inspected.`);
    }

    results.push({
      skill,
      status,
      evidence,
      limitations,
      filesInspected,
      totalFilesAvailable: totalFiles,
      inspectionComplete,
      statusExplanation,
    });
  }

  return results;
}

/**
 * Get status label for display
 */
export function getStatusLabel(status: EvidenceStatus): string {
  switch (status) {
    case 'evidence_found': return 'Evidence found';
    case 'not_found_in_inspected_files': return 'Not found in inspected files';
    case 'needs_further_assessment': return 'Needs further assessment';
    case 'inspection_incomplete': return 'Inspection incomplete';
    default: return 'Unknown';
  }
}

/**
 * Get status color class
 */
export function getStatusColor(status: EvidenceStatus): string {
  switch (status) {
    case 'evidence_found': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    case 'not_found_in_inspected_files': return 'text-gray-600 bg-gray-50 border-gray-200';
    case 'needs_further_assessment': return 'text-amber-700 bg-amber-50 border-amber-200';
    case 'inspection_incomplete': return 'text-red-700 bg-red-50 border-red-200';
    default: return 'text-gray-600 bg-gray-50 border-gray-200';
  }
}
