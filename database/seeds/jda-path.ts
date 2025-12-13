/**
 * JDA Strategic Path Seed
 * AI Adoption for Architecture Firms
 *
 * Based on consultation with Jesse Gugliotta (JDA) - December 2024
 *
 * Key insights from consultation:
 * - Team has mix of interest, indifference, and fear about AI
 * - Jim makes jokes about replacing workers with AI (needs reframing)
 * - Quality > productivity framing is critical
 * - Field Report Generator is "worth every penny right off the bat"
 * - Affinity Publisher is the bottleneck, not the AI
 */

import { db } from '@/lib/db';
import {
  strategicPaths,
  decisionNodes,
  clientContexts,
} from '@/database/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

// Generate stable UUIDs for relationships
const pathIds = {
  aiAdoption: uuidv4(),
};

const nodeIds = {
  // Phase 1: Assessment & Education (Foundation)
  root: uuidv4(),
  teamSurvey: uuidv4(),
  workflowAnalysis: uuidv4(),
  promptingWorkshop: uuidv4(),

  // Phase 2: Quick Wins (Immediate Value)
  quickWinsRoot: uuidv4(),
  fieldReportGenerator: uuidv4(),
  meetingTranscription: uuidv4(),
  clientCommunication: uuidv4(),

  // Phase 3: Creative Enhancement (Medium-term)
  creativeRoot: uuidv4(),
  renderingAssistance: uuidv4(),
  designIteration: uuidv4(),
  presentationEnhancement: uuidv4(),

  // Phase 4: Full Integration (Long-term)
  integrationRoot: uuidv4(),
  projectManagementAI: uuidv4(),
  codeCompliance: uuidv4(),
  customAgents: uuidv4(),

  // Final Outcome
  aiEnhancedPractice: uuidv4(),
};

// JDA client context
const contextIds = {
  jda: uuidv4(),
};

export async function seedJDAPath() {
  console.log('🏗️ Seeding JDA AI Adoption path...');

  // =========================================================================
  // CLEANUP: Remove existing JDA data to allow re-running seed
  // =========================================================================
  console.log('  Cleaning up existing JDA data...');

  // Find existing path by slug
  const existingPath = await db.query.strategicPaths.findFirst({
    where: eq(strategicPaths.slug, 'ai-adoption-architecture'),
  });

  if (existingPath) {
    // Delete nodes for this path first (FK constraint)
    await db.delete(decisionNodes).where(eq(decisionNodes.pathId, existingPath.id));
    // Delete the path
    await db.delete(strategicPaths).where(eq(strategicPaths.id, existingPath.id));
    console.log('  ✓ Removed existing path and nodes');
  }

  // Delete JDA client context if exists
  await db.delete(clientContexts).where(eq(clientContexts.sessionId, 'jda-main'));
  console.log('  ✓ Cleaned up client context');

  // =========================================================================
  // STRATEGIC PATH: AI Adoption for Architecture Firms
  // =========================================================================
  await db.insert(strategicPaths).values({
    id: pathIds.aiAdoption,
    name: 'AI Adoption for Architecture Firms',
    slug: 'ai-adoption-architecture',
    summary: 'Transform your architecture practice with AI-enhanced workflows that improve quality and expand capacity',
    description: `A phased approach to AI adoption tailored for architecture firms, balancing team readiness with practical implementation.

Key principles:
- Quality improvement over productivity metrics
- Human-centered design (AI enhances, doesn't replace)
- Quick wins first to build confidence
- Creative control remains with architects

Developed through consultation with practicing architects who face:
- Team skepticism and fear about AI
- Time-intensive documentation (field reports, RFIs)
- Design iteration bottlenecks
- Client communication overhead`,
    successRate: '78.00',
    caseCount: 0, // New path, no outcomes yet
    timelineP25: 8,
    timelineP75: 24,
    capitalP25: '5000.00',
    capitalP75: '25000.00',
    riskScore: '0.30',
    confidenceLevel: 'medium',
    lastAggregated: new Date(),
    rootNodeId: nodeIds.root,
    icon: 'Building2',
    color: 'slate',
    sortOrder: 4,
    isActive: true,
  });

  // =========================================================================
  // PHASE 1: Assessment & Education (Foundation)
  // =========================================================================
  const phase1Nodes = [
    {
      id: nodeIds.root,
      pathId: pathIds.aiAdoption,
      parentId: null,
      label: 'AI Readiness Assessment',
      description: `Begin with understanding where your team stands. This foundational phase:
- Surveys team attitudes (interest, skepticism, fear)
- Maps current AI usage (personal and professional)
- Identifies hidden opportunities
- Surfaces concerns to address

Critical insight: 79% of people use AI but many won't admit it. Create psychological safety first.`,
      type: 'phase',
      disclosureLevel: 1,
      cost: '0.00',
      durationWeeks: 1,
      successProbability: '95.00',
      dependencies: [],
      riskFactors: [
        'Low survey participation',
        'Dishonest responses due to fear',
        'Analysis paralysis'
      ],
      mitigationStrategies: [
        'Anonymous survey option',
        'Frame as "learning together" not "evaluation"',
        'Principal buy-in messaging first'
      ],
      children: [nodeIds.teamSurvey],
      position: { x: 400, y: 0 },
      confidenceLevel: 'high',
    },
    {
      id: nodeIds.teamSurvey,
      pathId: pathIds.aiAdoption,
      parentId: nodeIds.root,
      label: 'Team AI Readiness Survey',
      description: `Questionnaire covering Jesse's 7 core questions plus architecture-specific concerns:

1. Current AI usage (normalize adoption)
2. Tasks already using AI (find existing patterns)
3. Tasks that could use AI (surface aspirations)
4. Goals and outcomes (define success)
5. Uncertain tasks (find the gold mine)
6. Tasks NOT for AI (establish boundaries)
7. Feelings about AI (surface hidden fears)

Plus: IP/ownership concerns, professional reputation, creative control.`,
      type: 'milestone',
      disclosureLevel: 2,
      cost: '500.00',
      durationWeeks: 1,
      successProbability: '90.00',
      dependencies: ['Principal approval', 'Team availability'],
      riskFactors: ['Survey fatigue', 'Fear of consequences'],
      benchmarkData: {
        avgResponseRate: 0.85,
        avgCompletionTime: '15 minutes'
      },
      children: [nodeIds.workflowAnalysis],
      position: { x: 400, y: 120 },
      confidenceLevel: 'high',
    },
    {
      id: nodeIds.workflowAnalysis,
      pathId: pathIds.aiAdoption,
      parentId: nodeIds.teamSurvey,
      label: 'Current Workflow Analysis',
      description: `Map existing processes to identify AI opportunities:

**Documentation workflows:**
- Field reports (voice notes → transcription → formatting)
- Meeting notes
- RFIs and submittals
- Client communications

**Design workflows:**
- Concept sketches
- 3D modeling
- Rendering
- Presentation prep

**Administrative:**
- Project coordination
- Code compliance research
- Cost estimation

Identify bottlenecks and time sinks. Field reports consistently emerge as #1 pain point.`,
      type: 'phase',
      disclosureLevel: 2,
      cost: '1000.00',
      durationWeeks: 2,
      successProbability: '90.00',
      dependencies: ['Survey results', 'Team interviews'],
      riskFactors: ['Incomplete picture', 'Resistance to observation'],
      children: [nodeIds.promptingWorkshop],
      position: { x: 400, y: 240 },
      confidenceLevel: 'high',
    },
    {
      id: nodeIds.promptingWorkshop,
      pathId: pathIds.aiAdoption,
      parentId: nodeIds.workflowAnalysis,
      label: 'AI Prompting Workshop',
      description: `Hands-on training session covering:

**Level 1: Consumer Tools**
- ChatGPT, Claude, Gemini basics
- When to use which tool
- Privacy considerations

**Level 2: Prompting Techniques**
- Persona prompts ("You are a qualified architect...")
- Meta-prompts (ask AI to generate the optimal prompt)
- Iterative refinement
- Running 3-5 variations

**Level 3: Architecture-Specific**
- Field report prompting patterns
- Design brief elaboration
- Code compliance research
- Client communication templates

Jesse's feedback: "I like that a lot, especially the creating the persona part."`,
      type: 'milestone',
      disclosureLevel: 2,
      cost: '2500.00',
      durationWeeks: 1,
      successProbability: '85.00',
      dependencies: ['Workflow analysis complete', 'Team scheduling'],
      riskFactors: ['Varying technical comfort', 'Workshop fatigue'],
      mitigationStrategies: [
        'Tiered workshop tracks',
        'Hands-on practice time',
        'Take-home cheat sheets'
      ],
      linkedDocuments: [
        { title: 'Prompting Cheat Sheet', url: '/docs/prompting-guide.pdf' },
        { title: 'Architecture AI Toolkit', url: '/docs/arch-toolkit.pdf' }
      ],
      children: [nodeIds.quickWinsRoot],
      position: { x: 400, y: 360 },
      confidenceLevel: 'high',
    },
  ];

  // =========================================================================
  // PHASE 2: Quick Wins (Immediate Value)
  // =========================================================================
  const phase2Nodes = [
    {
      id: nodeIds.quickWinsRoot,
      pathId: pathIds.aiAdoption,
      parentId: nodeIds.promptingWorkshop,
      label: 'Quick Wins Implementation',
      description: `Deploy high-impact, low-risk AI solutions that demonstrate immediate value.

Priority order based on ROI and team readiness:
1. Field Report Generator (highest impact)
2. Meeting Transcription Workflow
3. Client Communication Templates

Success criteria: Team members independently using AI within 2 weeks.`,
      type: 'decision',
      disclosureLevel: 2,
      cost: '0.00',
      durationWeeks: 1,
      successProbability: '90.00',
      dependencies: ['Workshop completion', 'Tool access'],
      riskFactors: ['Tool overload', 'Uneven adoption'],
      children: [nodeIds.fieldReportGenerator, nodeIds.meetingTranscription, nodeIds.clientCommunication],
      position: { x: 400, y: 480 },
      confidenceLevel: 'high',
    },
    {
      id: nodeIds.fieldReportGenerator,
      pathId: pathIds.aiAdoption,
      parentId: nodeIds.quickWinsRoot,
      label: 'Field Report Generator',
      description: `THE KILLER FEATURE - transforms 2-hour reports into 30-minute outputs.

**Current pain (observed):**
1. Voice recording during/after site visit
2. Copy/paste transcription into AI
3. Format struggles in Affinity Publisher
4. Manual photo placement
5. Export to PDF (10+ pages)

**Solution:**
- Voice note → structured report → formatted PDF
- Bypasses Affinity entirely
- Consistent professional formatting
- Photo integration automated

**ROI calculation:**
- Time saved: 1.5 hours × 20 reports/month = 30 hours
- At $150/hr = $4,500/month recovered
- Solution cost: ~$5,000 one-time
- Break-even: First month

Jesse's quote: "That would be incredible and worth every penny, right off the bat."`,
      type: 'milestone',
      disclosureLevel: 2,
      cost: '5000.00',
      durationWeeks: 3,
      successProbability: '90.00',
      dependencies: ['Template design', 'PDF generation setup'],
      riskFactors: [
        'Template refinement cycles',
        'Photo metadata handling',
        'Voice recording quality'
      ],
      benchmarkData: {
        currentTimePerReport: 120, // minutes
        targetTimePerReport: 30,
        reportsPerMonth: 20,
        hourlyRate: 150
      },
      mitigationStrategies: [
        'Start with 3 template variations',
        'Pilot with most receptive team member',
        'Feedback loop for continuous improvement'
      ],
      children: [],
      position: { x: 200, y: 600 },
      confidenceLevel: 'high',
    },
    {
      id: nodeIds.meetingTranscription,
      pathId: pathIds.aiAdoption,
      parentId: nodeIds.quickWinsRoot,
      label: 'Meeting Transcription Workflow',
      description: `Capture client meetings with intelligent note extraction.

**Workflow:**
1. Record site meetings (phone app)
2. AI transcription with speaker identification
3. Extract action items, decisions, open questions
4. Auto-format into meeting notes template
5. Distribute to attendees

**Key insight from Jesse:**
Recording full conversations requires more editing than voice notes.
AI sometimes inverts meaning ("shop-painted" vs "field-painted").

**Solution approach:**
- Use Claude for better accuracy
- Human review checkpoint
- Highlight uncertain extractions`,
      type: 'phase',
      disclosureLevel: 2,
      cost: '1500.00',
      durationWeeks: 2,
      successProbability: '80.00',
      dependencies: ['Recording app selected', 'Template defined'],
      riskFactors: [
        'Client consent issues',
        'Background noise',
        'Technical term accuracy'
      ],
      mitigationStrategies: [
        'Consent language in project kickoff',
        'Use lapel mics for site visits',
        'Architecture term fine-tuning'
      ],
      children: [],
      position: { x: 400, y: 600 },
      confidenceLevel: 'medium',
    },
    {
      id: nodeIds.clientCommunication,
      pathId: pathIds.aiAdoption,
      parentId: nodeIds.quickWinsRoot,
      label: 'Client Communication Templates',
      description: `AI-assisted templates for common client communications:

**Templates library:**
- Project update emails
- Scope clarification requests
- Change order notifications
- Schedule adjustment notices
- RFI responses
- Submittal cover letters

**How it works:**
1. Select template type
2. Input key variables (project, date, specifics)
3. AI generates draft maintaining firm voice
4. Human review and send

**Quality focus:**
- Consistent professional tone
- Compliance with contractual obligations
- Clear action items for clients`,
      type: 'phase',
      disclosureLevel: 2,
      cost: '1000.00',
      durationWeeks: 2,
      successProbability: '85.00',
      dependencies: ['Communication audit', 'Template library'],
      riskFactors: ['Over-templating feels robotic', 'Missing context'],
      children: [nodeIds.creativeRoot],
      position: { x: 600, y: 600 },
      confidenceLevel: 'high',
    },
  ];

  // =========================================================================
  // PHASE 3: Creative Enhancement (Medium-term)
  // =========================================================================
  const phase3Nodes = [
    {
      id: nodeIds.creativeRoot,
      pathId: pathIds.aiAdoption,
      parentId: nodeIds.clientCommunication,
      label: 'Creative AI Integration',
      description: `Carefully introduce AI to design workflows, maintaining creative control.

**Guiding principle:** AI suggests, humans decide.

**Areas of enhancement:**
1. Rendering assistance (visualization)
2. Design iteration support (exploration)
3. Presentation enhancement (client materials)

**Critical framing for team:**
- "Expand your creative toolkit"
- "See more options faster"
- "Communicate ideas more effectively"

NOT: "Replace your design skills"`,
      type: 'decision',
      disclosureLevel: 3,
      cost: '0.00',
      durationWeeks: 1,
      successProbability: '85.00',
      dependencies: ['Quick wins established', 'Team confidence built'],
      riskFactors: ['Creative resistance', 'Quality concerns', 'IP questions'],
      children: [nodeIds.renderingAssistance, nodeIds.designIteration, nodeIds.presentationEnhancement],
      position: { x: 400, y: 720 },
      confidenceLevel: 'medium',
    },
    {
      id: nodeIds.renderingAssistance,
      pathId: pathIds.aiAdoption,
      parentId: nodeIds.creativeRoot,
      label: 'AI Rendering Assistance',
      description: `Use AI image generation to accelerate visualization.

**Jesse's experiments (Gemini):**
✅ Pool removal from photos
✅ SketchUp → realistic rendering
✅ Hand sketch → photo-realistic image
✅ 3D model enhancement

**Known limitations:**
❌ Railings (can't stop at specific posts)
❌ Door/window placement accuracy
❌ Floor level consistency
❌ People look like "twins"

**Workflow:**
1. Create base in familiar tools (SketchUp, hand sketch)
2. AI generates visualization options
3. Architect selects and refines
4. Final polish in traditional tools if needed

**IP consideration:** Courts have ruled AI-generated images are creative works, not copies.`,
      type: 'phase',
      disclosureLevel: 3,
      cost: '2500.00',
      durationWeeks: 4,
      successProbability: '75.00',
      dependencies: ['Image AI tool access', 'Rendering skill assessment'],
      riskFactors: [
        'Detail accuracy',
        'Client expectation management',
        'IP concerns'
      ],
      benchmarkData: {
        traditionalRenderTime: 480, // minutes
        aiAssistedRenderTime: 120,
        iterationsPerProject: 3
      },
      children: [],
      position: { x: 200, y: 840 },
      confidenceLevel: 'medium',
    },
    {
      id: nodeIds.designIteration,
      pathId: pathIds.aiAdoption,
      parentId: nodeIds.creativeRoot,
      label: 'Design Iteration Support',
      description: `AI as creative partner for exploring design options.

**Use cases:**
- "Show me 5 variations of this facade"
- "How would this look in different materials?"
- "Generate massing options for this site"

**Process:**
1. Architect provides design intent
2. AI generates rapid variations
3. Architect curates and combines
4. Refined options presented to client

**Creative control maintained:**
- AI never makes final decisions
- Architect guides aesthetic direction
- Human judgment on context/appropriateness`,
      type: 'phase',
      disclosureLevel: 3,
      cost: '2000.00',
      durationWeeks: 4,
      successProbability: '70.00',
      dependencies: ['Rendering workflow established', 'Team comfort with AI'],
      riskFactors: [
        'Over-reliance on AI suggestions',
        'Losing distinctive firm style',
        'Client confusion about process'
      ],
      children: [],
      position: { x: 400, y: 840 },
      confidenceLevel: 'low',
    },
    {
      id: nodeIds.presentationEnhancement,
      pathId: pathIds.aiAdoption,
      parentId: nodeIds.creativeRoot,
      label: 'Presentation Enhancement',
      description: `AI-powered improvements to client presentations.

**Applications:**
- Narrative generation from project data
- Slide layout optimization
- Speaking notes creation
- Client persona customization

**Jesse's presentation philosophy (applied to AI):**
- Start with what they know (their property, familiar views)
- Build complexity page by page
- Don't give everything at once

AI helps execute this philosophy faster and more consistently.`,
      type: 'milestone',
      disclosureLevel: 3,
      cost: '1500.00',
      durationWeeks: 3,
      successProbability: '85.00',
      dependencies: ['Presentation templates', 'Design asset library'],
      riskFactors: ['Generic output', 'Losing personal touch'],
      children: [nodeIds.integrationRoot],
      position: { x: 600, y: 840 },
      confidenceLevel: 'high',
    },
  ];

  // =========================================================================
  // PHASE 4: Full Integration (Long-term)
  // =========================================================================
  const phase4Nodes = [
    {
      id: nodeIds.integrationRoot,
      pathId: pathIds.aiAdoption,
      parentId: nodeIds.presentationEnhancement,
      label: 'Advanced AI Systems',
      description: `Enterprise-grade AI integration for competitive advantage.

**Only pursue after:**
- Team fully comfortable with consumer AI
- Quick wins delivering measurable value
- Creative workflows enhanced
- Leadership sees ROI

**Advanced capabilities:**
1. Project Management AI
2. Code Compliance Automation
3. Custom Agentic Workflows

Jesse's quote: "We spent the last five years turning down projects because we had too many... I can't imagine being able to fit all the work we turned away."`,
      type: 'decision',
      disclosureLevel: 3,
      cost: '0.00',
      durationWeeks: 1,
      successProbability: '80.00',
      dependencies: ['Phase 3 complete', 'Budget approval', 'Technical readiness'],
      riskFactors: ['Over-automation', 'System complexity', 'Maintenance burden'],
      children: [nodeIds.projectManagementAI, nodeIds.codeCompliance, nodeIds.customAgents],
      position: { x: 400, y: 960 },
      confidenceLevel: 'medium',
    },
    {
      id: nodeIds.projectManagementAI,
      pathId: pathIds.aiAdoption,
      parentId: nodeIds.integrationRoot,
      label: 'Project Management AI',
      description: `AI-enhanced project coordination and tracking.

**Capabilities:**
- Schedule optimization
- Resource allocation suggestions
- Risk identification
- Milestone tracking
- Client communication automation

**Integration points:**
- Existing PM tools (Asana, Monday, etc.)
- Calendar systems
- Email/communication platforms
- Document management`,
      type: 'phase',
      disclosureLevel: 3,
      cost: '5000.00',
      durationWeeks: 6,
      successProbability: '70.00',
      dependencies: ['PM tool audit', 'Integration capabilities'],
      riskFactors: ['Tool sprawl', 'Data silos', 'Learning curve'],
      children: [],
      position: { x: 200, y: 1080 },
      confidenceLevel: 'low',
    },
    {
      id: nodeIds.codeCompliance,
      pathId: pathIds.aiAdoption,
      parentId: nodeIds.integrationRoot,
      label: 'Code Compliance Checking',
      description: `AI-assisted building code and zoning compliance.

**Use cases:**
- Preliminary zoning analysis
- Building code cross-referencing
- ADA compliance checking
- Energy code verification

**Approach:**
- AI flags potential issues
- Human architect verifies
- Documentation automated

**Risk mitigation:**
- Always human final review
- AI confidence scores displayed
- Clear liability boundaries`,
      type: 'phase',
      disclosureLevel: 3,
      cost: '4000.00',
      durationWeeks: 5,
      successProbability: '65.00',
      dependencies: ['Code database access', 'Jurisdiction mapping'],
      riskFactors: [
        'Code update lag',
        'Local amendment handling',
        'Liability concerns'
      ],
      children: [],
      position: { x: 400, y: 1080 },
      confidenceLevel: 'low',
    },
    {
      id: nodeIds.customAgents,
      pathId: pathIds.aiAdoption,
      parentId: nodeIds.integrationRoot,
      label: 'Custom Agentic Workflows',
      description: `Bespoke AI agents for firm-specific processes.

**What are agentic systems?**
- AI that can execute multi-step tasks
- Accesses multiple tools and APIs
- Works autonomously within boundaries
- Reports back results

**Example workflows:**
- "Prepare bid package for Project X"
- "Research material options for sustainable renovation"
- "Generate alternatives analysis for client meeting"

**Luc's explanation to Jesse:**
"Lives in terminal, has access to everything. Can spawn agents for parallel tasks. 6 months of development down to 4 hours."`,
      type: 'outcome',
      disclosureLevel: 3,
      cost: '10000.00',
      durationWeeks: 8,
      successProbability: '60.00',
      dependencies: ['All previous phases', 'Technical champion on team'],
      riskFactors: [
        'Complexity management',
        'Maintenance overhead',
        'Debugging challenges'
      ],
      linkedDocuments: [
        { title: 'Agent Architecture Guide', url: '/docs/agent-guide.pdf' },
        { title: 'Custom Workflow Examples', url: '/docs/workflows.pdf' }
      ],
      children: [nodeIds.aiEnhancedPractice],
      position: { x: 600, y: 1080 },
      confidenceLevel: 'low',
    },
    {
      id: nodeIds.aiEnhancedPractice,
      pathId: pathIds.aiAdoption,
      parentId: nodeIds.customAgents,
      label: 'AI-Enhanced Architecture Practice',
      description: `The destination: A modern architecture firm where AI enhances every workflow.

**Outcomes achieved:**
✅ Documentation time reduced 60%+
✅ Design iteration speed doubled
✅ Client communication streamlined
✅ Capacity expanded without headcount
✅ Quality improved, not just speed

**Jesse's reframed narrative achieved:**
"If we used AI, each one of you could take on a lot more work and we could have a lot more projects going through the door. We don't need to expand the workforce. We just expand the products."

**Ongoing:**
- Continuous learning and tool updates
- New capability discovery
- Team knowledge sharing
- Industry best practice adoption`,
      type: 'outcome',
      disclosureLevel: 3,
      cost: '0.00',
      durationWeeks: 0,
      successProbability: '100.00',
      dependencies: ['All phases complete'],
      riskFactors: [],
      children: [],
      position: { x: 400, y: 1200 },
      confidenceLevel: 'high',
    },
  ];

  // Insert all nodes
  const allNodes = [...phase1Nodes, ...phase2Nodes, ...phase3Nodes, ...phase4Nodes];

  for (const node of allNodes) {
    await db.insert(decisionNodes).values(node);
  }

  console.log(`✅ Seeded 1 strategic path: AI Adoption for Architecture Firms`);
  console.log(`✅ Seeded ${allNodes.length} decision nodes`);

  // =========================================================================
  // JDA CLIENT CONTEXT
  // =========================================================================
  await db.insert(clientContexts).values({
    id: contextIds.jda,
    sessionId: 'jda-main',
    email: 'jesse@jamesdixonarchitect.com',
    companyName: 'James Dixon Architect PC',
    industry: 'Architecture',
    companySize: '2-10',
    annualRevenue: null, // Private
    yearsInBusiness: 15,
    currentStage: 'growth',
    primaryGoal: 'Increase quality and capacity without adding headcount',
    biggestChallenge: 'Team skepticism about AI, fear of job replacement, Affinity Publisher bottleneck',
    timelinePreference: 'moderate',
    riskTolerance: 'conservative',
    availableCapital: '10000.00',
    budgetFlexibility: 'flexible',
    // Architecture-specific fields (new explicit schema columns)
    firmType: 'mixed', // residential + commercial
    designTools: ['Revit', 'SketchUp', 'Affinity Publisher'],
    currentAiFamiliarity: 2, // 1-5 scale, team is beginner level
    avgProjectsPerMonth: 4,
    teamComposition: { architects: 3, designers: 2, admin: 1 },
    preferences: {
      painPoints: ['field reports', 'document formatting', 'rendering time'],
      interestedInAI: ['documentation', 'visualization', 'communication'],
    },
  });

  console.log(`✅ Seeded JDA client context`);
  console.log('🎉 JDA AI Adoption path seed complete!');
}

// Run if called directly
if (require.main === module) {
  seedJDAPath()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ JDA seed failed:', err);
      process.exit(1);
    });
}
