/**
 * PathMap Seed Data
 * Seeds 3 strategic paths with decision nodes for testing
 */

import { db } from '@/lib/db';
import { strategicPaths, decisionNodes } from '@/database/schema';
import { v4 as uuidv4 } from 'uuid';

// Generate stable UUIDs for relationships
const pathIds = {
  vertical: uuidv4(),
  contentLed: uuidv4(),
  partnership: uuidv4(),
};

const nodeIds = {
  // Vertical Specialization nodes
  v_root: uuidv4(),
  v_identify: uuidv4(),
  v_position: uuidv4(),
  v_pricing: uuidv4(),
  v_marketing: uuidv4(),
  v_delivery: uuidv4(),

  // Content-Led Growth nodes
  c_root: uuidv4(),
  c_strategy: uuidv4(),
  c_creation: uuidv4(),
  c_distribution: uuidv4(),
  c_conversion: uuidv4(),
  c_scale: uuidv4(),

  // Partnership Expansion nodes
  p_root: uuidv4(),
  p_identify: uuidv4(),
  p_outreach: uuidv4(),
  p_structure: uuidv4(),
  p_launch: uuidv4(),
  p_optimize: uuidv4(),
};

export async function seedPathMap() {
  console.log('🌱 Seeding PathMap data...');

  // Clear existing data
  await db.delete(decisionNodes);
  await db.delete(strategicPaths);

  // =========================================================================
  // STRATEGIC PATH 1: Vertical Specialization
  // =========================================================================
  await db.insert(strategicPaths).values({
    id: pathIds.vertical,
    name: 'Vertical Specialization',
    slug: 'vertical-specialization',
    summary: 'Become the go-to expert in a specific industry niche',
    description:
      'Transform from a generalist service provider to a specialized expert commanding premium rates. This path focuses on deep industry knowledge, tailored solutions, and word-of-mouth referrals within a tight-knit vertical.',
    successRate: '72.00',
    caseCount: 34,
    timelineP25: 6,
    timelineP75: 18,
    capitalP25: '5000.00',
    capitalP75: '25000.00',
    riskScore: '0.35',
    confidenceLevel: 'high',
    lastAggregated: new Date(),
    rootNodeId: nodeIds.v_root,
    icon: 'Target',
    color: 'blue',
    sortOrder: 1,
    isActive: true,
  });

  // Vertical Specialization Nodes
  const verticalNodes = [
    {
      id: nodeIds.v_root,
      pathId: pathIds.vertical,
      parentId: null,
      label: 'Choose Your Vertical',
      description:
        'Select the industry vertical where you have existing expertise, network connections, or passion.',
      type: 'decision',
      disclosureLevel: 1,
      cost: '0.00',
      durationWeeks: 2,
      successProbability: '95.00',
      dependencies: [],
      riskFactors: ['Analysis paralysis', 'Market too small', 'Too competitive'],
      children: [nodeIds.v_identify],
      position: { x: 250, y: 0 },
      confidenceLevel: 'high',
    },
    {
      id: nodeIds.v_identify,
      pathId: pathIds.vertical,
      parentId: nodeIds.v_root,
      label: 'Identify Pain Points',
      description:
        'Research and validate the top 3-5 recurring problems your target vertical faces.',
      type: 'phase',
      disclosureLevel: 2,
      cost: '500.00',
      durationWeeks: 4,
      successProbability: '85.00',
      dependencies: ['Industry contacts', 'Research time'],
      riskFactors: ['Insufficient research', 'Misreading market signals'],
      caseStudyIds: [],
      benchmarkData: { avgInterviews: 12, conversionRate: 0.23 },
      mitigationStrategies: [
        'Conduct 15+ customer interviews',
        'Validate with paid pilot',
      ],
      children: [nodeIds.v_position],
      position: { x: 250, y: 150 },
      confidenceLevel: 'high',
    },
    {
      id: nodeIds.v_position,
      pathId: pathIds.vertical,
      parentId: nodeIds.v_identify,
      label: 'Craft Positioning',
      description:
        'Develop messaging that clearly articulates your unique value to the vertical.',
      type: 'milestone',
      disclosureLevel: 2,
      cost: '2000.00',
      durationWeeks: 3,
      successProbability: '80.00',
      dependencies: ['Pain point research', 'Competitive analysis'],
      riskFactors: ['Generic positioning', 'Price-based competition'],
      children: [nodeIds.v_pricing, nodeIds.v_marketing],
      position: { x: 250, y: 300 },
      confidenceLevel: 'medium',
    },
    {
      id: nodeIds.v_pricing,
      pathId: pathIds.vertical,
      parentId: nodeIds.v_position,
      label: 'Premium Pricing Strategy',
      description: 'Set pricing 30-50% above generalist competitors based on specialized value.',
      type: 'decision',
      disclosureLevel: 2,
      cost: '0.00',
      durationWeeks: 1,
      successProbability: '70.00',
      dependencies: ['Clear positioning', 'Value documentation'],
      riskFactors: ['Price resistance', 'Underpricing'],
      children: [],
      position: { x: 100, y: 450 },
      confidenceLevel: 'medium',
    },
    {
      id: nodeIds.v_marketing,
      pathId: pathIds.vertical,
      parentId: nodeIds.v_position,
      label: 'Vertical Marketing Launch',
      description:
        'Execute targeted marketing: industry conferences, publications, LinkedIn groups.',
      type: 'phase',
      disclosureLevel: 2,
      cost: '5000.00',
      durationWeeks: 8,
      successProbability: '75.00',
      dependencies: ['Positioning', 'Content assets', 'Event calendar'],
      riskFactors: ['Low visibility', 'Wrong channels'],
      children: [nodeIds.v_delivery],
      position: { x: 400, y: 450 },
      confidenceLevel: 'medium',
    },
    {
      id: nodeIds.v_delivery,
      pathId: pathIds.vertical,
      parentId: nodeIds.v_marketing,
      label: 'Specialized Delivery',
      description:
        'Develop vertical-specific processes, templates, and case studies.',
      type: 'outcome',
      disclosureLevel: 3,
      cost: '3000.00',
      durationWeeks: 12,
      successProbability: '85.00',
      dependencies: ['Client projects', 'Feedback loops'],
      riskFactors: ['Quality inconsistency', 'Scale challenges'],
      linkedDocuments: [
        { title: 'SOP Template', url: '/docs/sop-template.pdf' },
        { title: 'Case Study Framework', url: '/docs/case-study.pdf' },
      ],
      children: [],
      position: { x: 400, y: 600 },
      confidenceLevel: 'high',
    },
  ];

  // =========================================================================
  // STRATEGIC PATH 2: Content-Led Growth
  // =========================================================================
  await db.insert(strategicPaths).values({
    id: pathIds.contentLed,
    name: 'Content-Led Growth',
    slug: 'content-led-growth',
    summary: 'Build authority and inbound leads through valuable content',
    description:
      'Establish yourself as a thought leader through consistent, high-value content. This path requires patience but builds compounding returns through SEO, social proof, and word-of-mouth.',
    successRate: '65.00',
    caseCount: 28,
    timelineP25: 9,
    timelineP75: 24,
    capitalP25: '2000.00',
    capitalP75: '15000.00',
    riskScore: '0.45',
    confidenceLevel: 'medium',
    lastAggregated: new Date(),
    rootNodeId: nodeIds.c_root,
    icon: 'FileText',
    color: 'green',
    sortOrder: 2,
    isActive: true,
  });

  const contentNodes = [
    {
      id: nodeIds.c_root,
      pathId: pathIds.contentLed,
      parentId: null,
      label: 'Define Content Strategy',
      description:
        'Choose your primary content format and distribution channel based on audience preferences.',
      type: 'decision',
      disclosureLevel: 1,
      cost: '500.00',
      durationWeeks: 2,
      successProbability: '90.00',
      dependencies: ['Audience research', 'Competitor analysis'],
      riskFactors: ['Wrong format', 'Inconsistent output'],
      children: [nodeIds.c_strategy],
      position: { x: 250, y: 0 },
      confidenceLevel: 'high',
    },
    {
      id: nodeIds.c_strategy,
      pathId: pathIds.contentLed,
      parentId: nodeIds.c_root,
      label: 'Content Calendar & Topics',
      description:
        'Map out 3-6 months of content topics aligned with buyer journey and keywords.',
      type: 'phase',
      disclosureLevel: 2,
      cost: '1000.00',
      durationWeeks: 3,
      successProbability: '85.00',
      dependencies: ['SEO research', 'Pain point mapping'],
      riskFactors: ['Topic fatigue', 'SEO competition'],
      children: [nodeIds.c_creation],
      position: { x: 250, y: 150 },
      confidenceLevel: 'medium',
    },
    {
      id: nodeIds.c_creation,
      pathId: pathIds.contentLed,
      parentId: nodeIds.c_strategy,
      label: 'Content Production System',
      description: 'Establish repeatable process for creating quality content weekly.',
      type: 'milestone',
      disclosureLevel: 2,
      cost: '2000.00',
      durationWeeks: 4,
      successProbability: '70.00',
      dependencies: ['Writing/video skills', 'Tools setup'],
      riskFactors: ['Burnout', 'Quality drops'],
      children: [nodeIds.c_distribution],
      position: { x: 250, y: 300 },
      confidenceLevel: 'medium',
    },
    {
      id: nodeIds.c_distribution,
      pathId: pathIds.contentLed,
      parentId: nodeIds.c_creation,
      label: 'Distribution & Amplification',
      description: 'Syndicate content across multiple channels to maximize reach.',
      type: 'phase',
      disclosureLevel: 2,
      cost: '1500.00',
      durationWeeks: 8,
      successProbability: '65.00',
      dependencies: ['Platform accounts', 'Engagement time'],
      riskFactors: ['Algorithm changes', 'Low engagement'],
      children: [nodeIds.c_conversion],
      position: { x: 250, y: 450 },
      confidenceLevel: 'low',
    },
    {
      id: nodeIds.c_conversion,
      pathId: pathIds.contentLed,
      parentId: nodeIds.c_distribution,
      label: 'Lead Capture & Nurture',
      description: 'Build email list and nurture sequences to convert readers to clients.',
      type: 'milestone',
      disclosureLevel: 3,
      cost: '1000.00',
      durationWeeks: 6,
      successProbability: '60.00',
      dependencies: ['Email tool', 'Lead magnet'],
      riskFactors: ['Low conversion', 'Email deliverability'],
      children: [nodeIds.c_scale],
      position: { x: 250, y: 600 },
      confidenceLevel: 'medium',
    },
    {
      id: nodeIds.c_scale,
      pathId: pathIds.contentLed,
      parentId: nodeIds.c_conversion,
      label: 'Scale with Help',
      description: 'Hire writers, editors, or VAs to increase content velocity.',
      type: 'outcome',
      disclosureLevel: 3,
      cost: '5000.00',
      durationWeeks: 12,
      successProbability: '75.00',
      dependencies: ['Budget', 'Process documentation'],
      riskFactors: ['Quality control', 'Voice consistency'],
      children: [],
      position: { x: 250, y: 750 },
      confidenceLevel: 'medium',
    },
  ];

  // =========================================================================
  // STRATEGIC PATH 3: Partnership Expansion
  // =========================================================================
  await db.insert(strategicPaths).values({
    id: pathIds.partnership,
    name: 'Partnership Expansion',
    slug: 'partnership-expansion',
    summary: 'Grow through strategic alliances and referral partnerships',
    description:
      'Leverage other businesses\' audiences and trust to accelerate growth. This path works best for businesses with complementary (not competing) offerings and strong relationship-building skills.',
    successRate: '68.00',
    caseCount: 22,
    timelineP25: 4,
    timelineP75: 12,
    capitalP25: '1000.00',
    capitalP75: '10000.00',
    riskScore: '0.40',
    confidenceLevel: 'medium',
    lastAggregated: new Date(),
    rootNodeId: nodeIds.p_root,
    icon: 'Users',
    color: 'purple',
    sortOrder: 3,
    isActive: true,
  });

  const partnershipNodes = [
    {
      id: nodeIds.p_root,
      pathId: pathIds.partnership,
      parentId: null,
      label: 'Map Partner Ecosystem',
      description:
        'Identify businesses serving your target audience with complementary offerings.',
      type: 'decision',
      disclosureLevel: 1,
      cost: '0.00',
      durationWeeks: 2,
      successProbability: '90.00',
      dependencies: ['Market research'],
      riskFactors: ['Wrong partner type', 'Competitive overlap'],
      children: [nodeIds.p_identify],
      position: { x: 250, y: 0 },
      confidenceLevel: 'high',
    },
    {
      id: nodeIds.p_identify,
      pathId: pathIds.partnership,
      parentId: nodeIds.p_root,
      label: 'Qualify Top 10 Partners',
      description: 'Research, prioritize, and create approach plans for top partner candidates.',
      type: 'phase',
      disclosureLevel: 2,
      cost: '500.00',
      durationWeeks: 3,
      successProbability: '80.00',
      dependencies: ['CRM', 'LinkedIn access'],
      riskFactors: ['Gatekeepers', 'Wrong contacts'],
      children: [nodeIds.p_outreach],
      position: { x: 250, y: 150 },
      confidenceLevel: 'high',
    },
    {
      id: nodeIds.p_outreach,
      pathId: pathIds.partnership,
      parentId: nodeIds.p_identify,
      label: 'Outreach Campaign',
      description: 'Execute personalized outreach with clear value proposition for partners.',
      type: 'milestone',
      disclosureLevel: 2,
      cost: '1000.00',
      durationWeeks: 4,
      successProbability: '50.00',
      dependencies: ['Email sequences', 'Mutual connections'],
      riskFactors: ['Low response', 'Wrong timing'],
      children: [nodeIds.p_structure],
      position: { x: 250, y: 300 },
      confidenceLevel: 'medium',
    },
    {
      id: nodeIds.p_structure,
      pathId: pathIds.partnership,
      parentId: nodeIds.p_outreach,
      label: 'Structure Partnership',
      description: 'Define terms: referral fees, co-marketing, revenue share, or joint offerings.',
      type: 'decision',
      disclosureLevel: 2,
      cost: '2000.00',
      durationWeeks: 3,
      successProbability: '75.00',
      dependencies: ['Legal review', 'Finance alignment'],
      riskFactors: ['Misaligned incentives', 'Complex terms'],
      children: [nodeIds.p_launch],
      position: { x: 250, y: 450 },
      confidenceLevel: 'medium',
    },
    {
      id: nodeIds.p_launch,
      pathId: pathIds.partnership,
      parentId: nodeIds.p_structure,
      label: 'Launch & Co-Market',
      description: 'Execute joint webinars, co-branded content, or cross-promotions.',
      type: 'phase',
      disclosureLevel: 3,
      cost: '3000.00',
      durationWeeks: 6,
      successProbability: '70.00',
      dependencies: ['Marketing assets', 'Coordination'],
      riskFactors: ['Partner drops ball', 'Audience mismatch'],
      children: [nodeIds.p_optimize],
      position: { x: 250, y: 600 },
      confidenceLevel: 'medium',
    },
    {
      id: nodeIds.p_optimize,
      pathId: pathIds.partnership,
      parentId: nodeIds.p_launch,
      label: 'Track & Optimize',
      description: 'Measure referral quality, conversion rates, and partner satisfaction.',
      type: 'outcome',
      disclosureLevel: 3,
      cost: '500.00',
      durationWeeks: 8,
      successProbability: '80.00',
      dependencies: ['Tracking system', 'Regular check-ins'],
      riskFactors: ['Data gaps', 'Partner churn'],
      children: [],
      position: { x: 250, y: 750 },
      confidenceLevel: 'high',
    },
  ];

  // Insert all nodes
  const allNodes = [...verticalNodes, ...contentNodes, ...partnershipNodes];

  for (const node of allNodes) {
    await db.insert(decisionNodes).values(node);
  }

  console.log(`✅ Seeded ${Object.keys(pathIds).length} strategic paths`);
  console.log(`✅ Seeded ${allNodes.length} decision nodes`);
  console.log('🎉 PathMap seed complete!');
}

// Run if called directly
if (require.main === module) {
  seedPathMap()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Seed failed:', err);
      process.exit(1);
    });
}
