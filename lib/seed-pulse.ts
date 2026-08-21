import type { Lane, Pillar } from '@/lib/design-tokens'

export interface PulseItem {
  id: string
  title: string
  summary: string
  lane: Lane
  pillar: Pillar
  sourceUrl: string
  sourceName: string
  publishedAt: string
  
  // New fields for the Hermes long-form blog pipeline
  content_md?: string
  demo_scenario_md?: string
}

/**
 * Shared seed pulse data.
 * Used by /pulse (list), /pulse/[id] (detail), and the landing page.
 * Live data will replace this once Hermes is running and Supabase is seeded.
 */
export const SEED_PULSE: PulseItem[] = [
  { 
    id: '1', 
    lane: 'new', 
    pillar: 'd365-fo', 
    title: 'Finance Copilot: variance narratives', 
    summary: 'Auto-generated written explanations for budget-to-actual variances, surfaced directly in the workspace. The Copilot analyses the ledger context and produces plain-English narrative you can review before sharing with stakeholders.', 
    sourceUrl: 'https://learn.microsoft.com/en-us/dynamics365/finance/', 
    sourceName: 'Microsoft Learn', 
    publishedAt: '2d ago',
    content_md: `The period-close process just got a lot less tedious. Historically, financial controllers have spent hours digging through ledger entries to explain why a department went over budget. With the new **variance narratives** feature in Dynamics 365 Finance Copilot, that initial analysis is done instantly.

When a variance threshold is breached, Copilot automatically queries the underlying voucher transactions, identifies the largest contributing factors (e.g., a massive spike in travel expenses or an unbudgeted vendor invoice), and writes a plain-English explanation.

This isn't just a generic template; it's grounded in your actual transactional data. You can review, edit, and then directly attach this narrative to the financial report before distributing it to the board or stakeholders, saving hours of manual data mining.`,
    demo_scenario_md: `### Scenario: Q3 Marketing Budget Overrun

**The Setup:** 
Contoso's Q3 Marketing budget was set at $50,000, but actuals came in at $72,000. The controller needs to explain this $22k variance in the quarterly review pack.

**The Action:**
1. Navigate to the **Financial reporting workspace** in D365 Finance.
2. Select the Q3 Budget vs. Actuals report.
3. Click the Copilot icon next to the Marketing row showing the red variance.
4. Copilot generates: *"The $22,000 variance in Marketing is primarily driven by three unbudgeted invoices from 'AdWorks Agency' totaling $18,500 posted to the 'Digital Advertising' main account in September, and a $3,500 overspend in 'Event Sponsorships'."*
5. The controller hits **Insert to report notes**.

**The Result:** 
A complete variance analysis accomplished in 3 clicks instead of 45 minutes of drilling down into voucher transactions.`
  },
  { 
    id: '2', 
    lane: 'new', 
    pillar: 'dataverse-power-platform', 
    title: 'Dataverse generative answers GA', 
    summary: 'Generally available grounding over Dataverse tables for Copilot Studio agents — no custom plug-in or connector required. Agents can now answer natural-language questions directly over your business data with no extra configuration.', 
    sourceUrl: 'https://learn.microsoft.com/en-us/microsoft-copilot-studio/', 
    sourceName: 'Microsoft Blog', 
    publishedAt: '3d ago',
    content_md: `For the past year, connecting a Copilot Studio agent to structured database records required building custom Power Automate flows, writing Power Fx, or configuring complex search indexes. That friction is now gone.

**Generative answers over Dataverse** is now Generally Available (GA). This means you can simply point your Copilot agent at a specific Dataverse table (like 'Accounts', 'Tickets', or a custom 'Inventory' table), select the columns you want to index, and you're done.

The agent will automatically translate natural language questions from users into the appropriate Dataverse queries, retrieve the data, and summarize it into a conversational response. It completely changes the ROI calculus for building internal Q&A bots.`,
    demo_scenario_md: `### Scenario: IT Helpdesk Ticket Status Bot

**The Setup:**
Contoso wants an internal Teams bot where employees can ask about their open IT tickets, which are stored in a custom Dataverse table called \`cr2b_IT_Tickets\`.

**The Action:**
1. In Copilot Studio, create a new Agent.
2. Go to **Knowledge**, click **Add knowledge**, and select **Dataverse**.
3. Choose the \`cr2b_IT_Tickets\` table.
4. Select the columns: \`Ticket_Number\`, \`Status\`, \`Assignee\`, and \`Resolution_Notes\`.
5. In the test pane, type: *"What's the status of my laptop repair ticket?"*
6. The agent dynamically queries Dataverse filtering by the logged-in user and responds: *"Your ticket (REQ-9921) is currently 'In Progress' and is assigned to John Doe. The latest note says they are waiting on a replacement screen to ship."*

**The Result:**
A fully functional database-grounded agent built in 5 minutes with zero code.`
  },
  { 
    id: '3', 
    lane: 'new', 
    pillar: 'd365-fo', 
    title: 'Supply Chain anomaly alerts', 
    summary: 'Real-time exception flags for inventory and demand forecasts, tuned per warehouse. The model learns from your historical deviation patterns and surfaces only statistically significant anomalies, reducing alert fatigue.', 
    sourceUrl: 'https://learn.microsoft.com/en-us/dynamics365/supply-chain/', 
    sourceName: 'Release Wave', 
    publishedAt: '3d ago',
    content_md: `Supply chain planners are traditionally buried under a mountain of exception messages — most of which are false positives caused by minor timing issues in MRP runs. D365 Supply Chain Management is introducing AI-driven **anomaly alerts** to cut through the noise.

Instead of hard-coded thresholds (e.g., "Alert if inventory drops below 50"), the system uses machine learning to understand the *normal* volatility of each specific item at each specific warehouse. 

It evaluates lead times, historical demand variance, and supplier reliability. If an exception is raised, it's because the system determines there is a statistically high probability of a stockout or severe overstock that falls outside the normal operating pattern.`,
    demo_scenario_md: `### Scenario: Preventing a Stockout Before It Happens

**The Setup:**
Contoso sells high-volume retail goods. The master planning run completes overnight.

**The Action:**
1. The planner logs into the **Master Planning workspace** in the morning.
2. Instead of reviewing 500 standard MRP action messages, they check the **AI Anomaly Dashboard**.
3. The dashboard highlights 3 critical alerts. One indicates that a shipment of 'Widget A' is running 4 days late, but demand has unexpectedly spiked 20% in the last 48 hours.
4. The alert includes a Copilot recommendation: *"Expedite purchase order PO-1022 or transfer 500 units from Warehouse B to avoid a projected stockout on Thursday."*

**The Result:**
The planner immediately executes the transfer order directly from the alert pane, preventing a lost sale.`
  },
  { id: '4', lane: 'coming', pillar: 'copilot-ai-agents', title: 'Autonomous reconciliation agents', summary: 'Preview agents that propose and explain journal matches, with a mandatory human approval step before posting.', sourceUrl: 'https://learn.microsoft.com/en-us/dynamics365/', sourceName: 'Roadmap', publishedAt: 'roadmap' },
  { id: '5', lane: 'coming', pillar: 'dataverse-power-platform', title: 'Cross-app agent handoffs', summary: 'An agent started in Power Apps will be able to hand off its full context to a Copilot Studio agent mid-task.', sourceUrl: 'https://learn.microsoft.com/en-us/power-apps/', sourceName: 'Roadmap', publishedAt: 'roadmap' },
  { id: '6', lane: 'coming', pillar: 'industry-solutions', title: 'Industry agent templates: Manufacturing', summary: 'Pre-built agent scaffolds for shop-floor exception handling and planner co-review.', sourceUrl: 'https://learn.microsoft.com/en-us/industry/', sourceName: 'Roadmap', publishedAt: 'roadmap' },
  { id: '7', lane: 'architecture', pillar: 'dataverse-power-platform', title: 'Dataverse long-term retention via Fabric link', summary: 'Dataverse environments on the new retention policy use Fabric as the underlying storage link.', sourceUrl: 'https://learn.microsoft.com/en-us/power-platform/', sourceName: 'Microsoft Learn', publishedAt: '5d ago' },
  { id: '8', lane: 'architecture', pillar: 'd365-fo', title: 'Unified dev environment changes', summary: 'Build and deploy pipeline updates for the unified D365 developer experience — fewer manual sync steps.', sourceUrl: 'https://learn.microsoft.com/en-us/dynamics365/fin-ops-core/', sourceName: 'Microsoft Blog', publishedAt: '6d ago' },
  { id: '9', lane: 'architecture', pillar: 'dataverse-power-platform', title: 'Virtual table connector limits', summary: 'Updated throughput guidance for virtual tables against high-volume external systems.', sourceUrl: 'https://learn.microsoft.com/en-us/power-apps/developer/data-platform/', sourceName: 'Microsoft Learn', publishedAt: '1w ago' },
]
