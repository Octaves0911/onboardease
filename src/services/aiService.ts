// ─── Deploy AI Service ────────────────────────────────────────────────────────
// Calls Deploy AI API for real responses. Falls back to smart mocks on error.

const AUTH_URL         = 'https://api-auth.dev.deploy.ai/oauth2/token'
const API_URL          = 'https://core-api.dev.deploy.ai'
const ORG_ID           = '47e06cd4-2cfc-4020-bd40-155e24c723cf'
const AGENT_ID         = 'GPT_4O'            // general-purpose agent
const TASK_AGENT_ID    = 'task_generator'    // dedicated task-generation agent

// ─── Auth token (cached) ──────────────────────────────────────────────────────
let cachedToken: string | null = null
let tokenExpiry = 0

async function getAccessToken(): Promise<string | null> {
  const clientId     = import.meta.env.VITE_CLIENT_ID
  const clientSecret = import.meta.env.VITE_CLIENT_SECRET
  if (!clientId || !clientSecret) return null
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken

  try {
    const body = new URLSearchParams({ grant_type: 'client_credentials', client_id: clientId, client_secret: clientSecret })
    const res  = await fetch(AUTH_URL, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body })
    if (!res.ok) return null
    const data = await res.json()
    cachedToken = data.access_token
    tokenExpiry = Date.now() + (data.expires_in - 60) * 1000
    return cachedToken
  } catch { return null }
}

async function createChat(token: string, agentId: string = AGENT_ID): Promise<string | null> {
  try {
    const res = await fetch(`${API_URL}/chats`, {
      method: 'POST',
      headers: { 'accept': 'application/json', 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, 'X-Org': ORG_ID },
      body: JSON.stringify({ agentId, stream: false }),
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.id
  } catch { return null }
}

async function sendMessage(token: string, chatId: string, content: string): Promise<string | null> {
  try {
    const res = await fetch(`${API_URL}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, 'X-Org': ORG_ID },
      body: JSON.stringify({ chatId, stream: false, content: [{ type: 'text', value: content }] }),
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.content?.[0]?.value ?? null
  } catch { return null }
}

// ─── Smart mock responses ─────────────────────────────────────────────────────

function mockTasksFromDocument(docContent: string, docName: string, employeeRole?: string): string {
  const lower = (docName + docContent).toLowerCase()
  const role  = (employeeRole ?? '').toLowerCase()

  if (lower.includes('security') || lower.includes('password') || lower.includes('vpn')) {
    return `Here are the onboarding tasks I generated from **${docName}**:

**Security & Compliance Tasks**

1. **Complete cybersecurity awareness training** — Watch the mandatory security training video and pass the assessment quiz. *(30 min · Compliance)*
2. **Enable Multi-Factor Authentication (MFA)** — Set up MFA on all company accounts including email, Slack, and GitHub. *(15 min · Security)*
3. **Set up company VPN** — Install and configure the VPN client. Required for all remote work sessions. *(20 min · Tools)*
4. **Review data classification policy** — Understand public, internal, confidential, and restricted data labels. *(15 min · Compliance)*
5. **Create a strong password using company policy** — Use a password manager and generate 12+ character passwords for all tools. *(10 min · Security)*
6. **Report your devices to IT** — Register all devices used for company work in the asset management portal. *(10 min · Admin)*
7. **Sign security policy acknowledgement** — Digitally sign the IT Security Policy document in DocuSign. *(5 min · Compliance)*
8. **Complete phishing simulation exercise** — Practice identifying phishing emails in a safe training environment. *(20 min · Security)*

Would you like me to add, remove, or modify any of these tasks before assigning?`
  }

  if (lower.includes('engineering') || lower.includes('react') || lower.includes('github') || role.includes('engineer') || role.includes('developer')) {
    return `Here are the onboarding tasks I generated from **${docName}**:

**Technical Onboarding Tasks — Engineering**

1. **Set up local development environment** — Clone the main repository, install dependencies, and run the app locally. *(1 hr · Setup)*
2. **Complete GitHub access & SSH key setup** — Configure SSH keys, join the GitHub org, and verify repository access. *(20 min · Tools)*
3. **Architecture deep-dive with buddy** — Walk through the system architecture diagram with Sarah Chen. *(1 hr · Learning)*
4. **Review coding standards & PR guidelines** — Read the contributing guide and understand code review requirements. *(30 min · Learning)*
5. **Set up local testing environment** — Run the full test suite locally and ensure 100% pass rate. *(30 min · Setup)*
6. **Complete first "good first issue"** — Pick up a beginner-tagged issue, implement a fix, and submit a PR. *(2 hrs · Technical)*
7. **Attend daily standups for one week** — Join standups as an observer to learn team rhythm and communication style. *(15 min/day · People)*
8. **Review CI/CD pipeline documentation** — Understand the deployment pipeline from feature branch to production. *(30 min · Learning)*
9. **Set up monitoring dashboards** — Get access to DataDog/Grafana and bookmark key dashboards. *(15 min · Tools)*
10. **Complete pair programming session** — Pair with a senior engineer on an active story for hands-on learning. *(2 hrs · Technical)*

Would you like me to adjust these tasks or focus on a specific area?`
  }

  if (lower.includes('sales') || lower.includes('crm') || lower.includes('quota') || role.includes('sales')) {
    return `Here are the onboarding tasks I generated from **${docName}**:

**Sales Onboarding Tasks**

1. **Complete Salesforce CRM fundamentals training** — Finish the CRM basics course and create your first opportunity. *(1 hr · Tools)*
2. **Product certification: Core modules (1-4)** — Complete the first 4 product knowledge modules and pass the quiz. *(2 hrs · Learning)*
3. **Shadow 3 customer discovery calls** — Observe senior reps on live calls. Take notes using the BANT framework. *(3 hrs · Learning)*
4. **Learn the demo script** — Practice the standard demo deck and deliver it to your manager. *(1 hr · Skills)*
5. **Understand pricing & packaging** — Review all pricing tiers, discounting policy, and approval workflow. *(30 min · Learning)*
6. **Meet your top 5 accounts** — Intro calls with the 5 largest accounts in your territory. *(1 hr · People)*
7. **Submit your first pipeline entries** — Add 10 qualified prospects to Salesforce pipeline. *(30 min · Admin)*
8. **Study competitive landscape** — Review competitor battle cards and understand our differentiators. *(1 hr · Learning)*

Would you like me to customize these for a specific territory or quota target?`
  }

  if (lower.includes('handbook') || lower.includes('culture') || lower.includes('values') || lower.includes('benefits')) {
    return `Here are the onboarding tasks I generated from **${docName}**:

**Culture & Compliance Onboarding Tasks**

1. **Watch the company overview video** — 20-minute video covering mission, vision, values, and history. *(20 min · Culture)*
2. **Complete the org chart walkthrough** — Identify your team, cross-functional partners, and executive leadership. *(15 min · People)*
3. **Review and sign the Code of Conduct** — Read all sections and digitally sign acknowledgement. *(20 min · Compliance)*
4. **Set up employee profile** — Add photo, bio, role, and contact details to the company directory. *(10 min · Admin)*
5. **Understand PTO & leave policies** — Review vacation, sick leave, parental leave, and holiday schedule. *(15 min · HR)*
6. **Benefits enrollment** — Complete health, dental, vision, and 401k enrollment within 30 days. *(30 min · HR)*
7. **Attend company all-hands meeting** — Participate in the next monthly all-hands as an observer. *(1 hr · Culture)*
8. **Coffee chat with 3 colleagues** — Schedule informal 15-minute intros with cross-functional teammates. *(45 min · People)*

Would you like me to add role-specific tasks or adjust timelines?`
  }

  // Default response
  return `Here are the onboarding tasks I generated from **${docName}**:

**Onboarding Task List**

1. **Review the document thoroughly** — Read all sections of ${docName} and highlight key policies. *(30 min · Learning)*
2. **Complete knowledge check** — Answer the 10-question quiz to confirm understanding. *(15 min · Compliance)*
3. **Discuss key points with manager** — Schedule a 30-minute debrief to clarify any questions. *(30 min · People)*
4. **Apply learnings to daily workflow** — Identify 3 action items from the document to implement immediately. *(15 min · Admin)*
5. **Share key takeaways with team** — Post a brief summary to the #onboarding Slack channel. *(10 min · Culture)*

Would you like me to add more specific tasks or explore a different focus area?`
}

function mockTasksFromResume(resumeContent: string, resumeFileName: string, mentorPrompt: string, employeeRole: string): string {
  const prompt = mentorPrompt.toLowerCase()
  const role   = employeeRole.toLowerCase()

  const isDevFocused  = prompt.includes('react') || prompt.includes('technical') || prompt.includes('code') || role.includes('engineer') || role.includes('developer')
  const isFrontend    = prompt.includes('frontend') || prompt.includes('front-end') || prompt.includes('ui') || prompt.includes('react')
  const is30Day       = prompt.includes('30') || prompt.includes('month')
  const isDesign      = role.includes('design') || prompt.includes('design') || prompt.includes('ux')
  const isSales       = role.includes('sales') || prompt.includes('sales')

  const dayLabel = is30Day ? '30-day' : '21-day'

  if (isDesign) {
    return `Based on ${resumeFileName || "the candidate's resume"} and your guidance, here's the personalized **${dayLabel} Design Onboarding Plan**:

**Week 1 — Foundation**
1. **Design system deep-dive** — Review the component library in Figma. Map existing patterns to your design background. *(2 hrs · Technical)*
2. **Brand guidelines walkthrough** — Study typography, color palette, spacing, and tone-of-voice guide with Priya. *(1 hr · Learning)*
3. **Meet the product squad** — Coffee chats with 3 PMs and 3 engineers to understand collaboration workflow. *(1.5 hrs · People)*
4. **Audit current live product** — Document UX inconsistencies and accessibility gaps as a fresh-eyes exercise. *(2 hrs · Research)*

**Week 2 — Hands-On**
5. **Shadow a user research session** — Observe moderated usability testing with a real user. *(1.5 hrs · Research)*
6. **Contribute to an active design spec** — Add annotations or revisions to a mid-flight design file. *(2 hrs · Technical)*
7. **Review the design process** — Understand how designs move from concept to engineering handoff. *(30 min · Learning)*

**Week 3–4 — Ownership**
8. **Lead first design critique** — Present a small concept to the team for feedback. *(1 hr · Skills)*
9. **Complete accessibility audit** — Run the current main screen through WCAG 2.1 AA checklist. *(1 hr · Compliance)*
10. **Ship first design to production** — Own a small UI change end-to-end, from wireframe to developer handoff. *(3 hrs · Technical)*

Tasks are based on the candidate's existing ${employeeRole} background. Want me to adjust difficulty or focus area?`
  }

  if (isSales) {
    return `Based on ${resumeFileName || "the candidate's resume"} and your guidance, here's the personalized **${dayLabel} Sales Onboarding Plan**:

**Week 1 — Product & Process**
1. **Intensive product certification (all 8 modules)** — Prioritized given their background; can self-pace. *(4 hrs · Learning)*
2. **CRM setup and pipeline methodology** — Configure Salesforce with personal templates based on prior CRM experience. *(1 hr · Tools)*
3. **Territory & account mapping** — Identify key accounts, existing contacts, and warm leads in territory. *(1.5 hrs · Strategy)*
4. **Study competitive battle cards** — Focus on top 3 competitors most relevant to their territory. *(1 hr · Learning)*

**Week 2 — Active Learning**
5. **Shadow 5 discovery calls** — Take structured notes using BANT and share observations with mentor. *(3 hrs · Learning)*
6. **Practice demo delivery** — Record and review self-demo, share with mentor for feedback. *(1 hr · Skills)*
7. **Meet top 10 accounts** — Intro calls using a prepared intro script. *(2 hrs · People)*

**Week 3 — First Deals**
8. **Submit first 5 qualified opportunities** — Log in Salesforce with full BANT qualification notes. *(1 hr · Admin)*
9. **Co-present a live demo with manager** — Shadow and assist on a real prospect demo. *(1 hr · Skills)*
10. **First solo discovery call** — Lead a discovery call independently with mentor listening. *(30 min · Skills)*

Personalized to leverage their prior sales experience. Want to adjust the ramp timeline?`
  }

  if (isFrontend || isDevFocused) {
    return `Based on ${resumeFileName || "the candidate's resume"} and your guidance, here's the personalized **${dayLabel} Technical Onboarding Plan**:

**Week 1 — Environment & Codebase**
1. **Dev environment setup & codebase tour** — Clone repo, install dependencies, run all services locally. Leverage their existing React knowledge. *(1.5 hrs · Setup)*
2. **Architecture walkthrough with Sarah** — Deep-dive into system design, service boundaries, and data flow. *(1 hr · Learning)*
3. **Read and sign-off on engineering standards** — Review PR guidelines, commit conventions, and naming patterns. *(30 min · Compliance)*
4. **Set up observability tools** — Configure DataDog alerts and Grafana dashboards for their assigned services. *(30 min · Tools)*

**Week 2 — First Contributions**
5. **Fix first 2 "good first issues"** — Independently pick up beginner tickets to learn the codebase workflow. *(3 hrs · Technical)*
6. **Write your first unit test suite** — Add tests for an untested utility module. Minimum 80% coverage. *(2 hrs · Technical)*
7. **Review 5 open PRs** — Leave meaningful code review comments on 5 active pull requests. *(1 hr · Learning)*

**Week 3–4 — Feature Ownership**
8. **Own a small feature end-to-end** — From ticket to production: design, implementation, tests, PR, and deploy. *(4 hrs · Technical)*
9. **Pair on a complex refactor** — Pair with a senior engineer on an active refactoring task. *(2 hrs · Technical)*
10. **Lead a tech share** — Present a short (15-min) deep-dive on something learned in onboarding. *(1 hr · Leadership)*

Based on their ${employeeRole} background — tasks are calibrated to fast-track the ramp. Adjust?`
  }

  // Generic role response
  return `Based on ${resumeFileName || "the candidate's resume"} and your guidance, here's the personalized **${dayLabel} Onboarding Plan** for ${employeeRole}:

**Week 1 — Foundation**
1. **Company overview & culture immersion** — Study mission, values, and org structure with focus on their team. *(1 hr · Culture)*
2. **Tool setup & account provisioning** — Configure all required tools based on their role requirements. *(1 hr · Setup)*
3. **Meet key stakeholders** — Intro meetings with 5 cross-functional partners identified from their role scope. *(1.5 hrs · People)*
4. **Review role-specific documentation** — Read all relevant policies, processes, and guidelines for ${employeeRole}. *(1.5 hrs · Learning)*

**Week 2 — Hands-On**
5. **Shadow a senior colleague** — Observe and document how a similar role operates day-to-day. *(2 hrs · Learning)*
6. **Complete first independent task** — Take ownership of a low-stakes assignment to apply knowledge. *(2 hrs · Technical)*
7. **1:1 feedback session with mentor** — Review progress, blockers, and priorities for the next 2 weeks. *(30 min · People)*

**Week 3–4 — Ownership**
8. **Lead a small project** — Own an end-to-end workstream from planning to delivery. *(4 hrs · Skills)*
9. **Document key learnings** — Write a 1-page "what I learned" summary to share with the team. *(30 min · Admin)*
10. **Set 30-60-90 day goals with manager** — Formalize performance milestones and success criteria. *(30 min · Planning)*

Want me to adjust this based on specific skills or priorities you have in mind?`
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function generateTasksFromDocument(
  docContent: string,
  docName: string,
  userMessage: string,
  employeeRole?: string,
  chatHistory?: { role: 'user' | 'ai'; content: string }[]
): Promise<string> {
  const token = await getAccessToken()

  if (token) {
    const chatId = await createChat(token)
    if (chatId) {
      const systemContext = `You are an expert onboarding specialist AI assistant. You help HR managers and admins create actionable onboarding task lists based on company documents. Format tasks clearly with titles, time estimates, and categories. Document context: "${docContent.slice(0, 2000)}"`
      const fullMessage = `${systemContext}\n\nUser: ${userMessage}\n\nEmployee Role Context: ${employeeRole ?? 'General employee'}`
      const response = await sendMessage(token, chatId, fullMessage)
      if (response) return response
    }
  }

  // Smart mock fallback
  await new Promise(r => setTimeout(r, 1200 + Math.random() * 800))
  return mockTasksFromDocument(docContent, docName, employeeRole)
}

export async function generateTasksFromResume(
  resumeContent: string,
  resumeFileName: string,
  mentorPrompt: string,
  employeeRole: string
): Promise<string> {
  const token = await getAccessToken()

  if (token) {
    const chatId = await createChat(token)
    if (chatId) {
      const systemContext = `You are an expert onboarding specialist AI assistant helping a mentor create a personalized task list for a new hire. Resume content: "${resumeContent.slice(0, 2000)}". Employee role: ${employeeRole}.`
      const fullMessage = `${systemContext}\n\nMentor request: ${mentorPrompt}\n\nGenerate a detailed, personalized onboarding task list with time estimates and categories.`
      const response = await sendMessage(token, chatId, fullMessage)
      if (response) return response
    }
  }

  // Smart mock fallback
  await new Promise(r => setTimeout(r, 1200 + Math.random() * 800))
  return mockTasksFromResume(resumeContent, resumeFileName, mentorPrompt, employeeRole)
}

export async function generalChat(userMessage: string, context: string): Promise<string> {
  const token = await getAccessToken()

  if (token) {
    const chatId = await createChat(token)
    if (chatId) {
      const response = await sendMessage(token, chatId, `${context}\n\nUser: ${userMessage}`)
      if (response) return response
    }
  }

  // Mock fallback
  await new Promise(r => setTimeout(r, 800 + Math.random() * 600))
  const lower = userMessage.toLowerCase()
  if (lower.includes('task') || lower.includes('assign')) return 'I can help you create and assign tasks! Just describe what you need done and which employee it\'s for, and I\'ll generate a structured task list.'
  if (lower.includes('resume') || lower.includes('candidate')) return 'Upload the candidate\'s resume and I\'ll analyze their background to create a personalized onboarding plan tailored to their skills and experience.'
  if (lower.includes('document') || lower.includes('policy')) return 'Share a document with me and I\'ll extract all the key requirements into actionable onboarding tasks that can be assigned to new hires.'
  return 'I\'m your AI onboarding assistant. I can help you create task lists from documents, analyze resumes to personalize onboarding plans, and answer questions about your team\'s progress. What would you like to do?'
}

// ─── Suggest tasks for a specific employee (for CreateTaskModal AI mode) ──────

export interface SuggestedTask {
  title: string
  description: string
  category: string
  estimatedTime: string
  priority: 'low' | 'medium' | 'high'
  subtasks: { title: string }[]
  requiresInput: boolean
  inputPrompt: string
}

function mockSuggestedTasks(employeeRole: string, employeeName: string, userRequest: string): SuggestedTask[] {
  const role = (employeeRole + userRequest).toLowerCase()

  if (role.includes('engineer') || role.includes('developer') || role.includes('technical')) {
    return [
      { title: 'Set up local development environment', description: 'Clone the main repository, install all dependencies, and verify the app runs locally.', category: 'Setup', estimatedTime: '1.5 hrs', priority: 'high', subtasks: [{ title: 'Clone repository' }, { title: 'Install Node.js & dependencies' }, { title: 'Run app locally and verify' }], requiresInput: false, inputPrompt: '' },
      { title: 'Complete codebase architecture review', description: 'Read the architecture documentation and diagram the major system components.', category: 'Learning', estimatedTime: '1 hr', priority: 'medium', subtasks: [{ title: 'Read architecture docs' }, { title: 'Map service boundaries' }], requiresInput: true, inputPrompt: 'Describe 3 things you learned about our system architecture.' },
      { title: 'Submit first pull request', description: 'Pick a "good first issue" from the backlog and submit a PR following team guidelines.', category: 'Technical', estimatedTime: '2 hrs', priority: 'medium', subtasks: [{ title: 'Pick issue from backlog' }, { title: 'Implement fix' }, { title: 'Write unit tests' }, { title: 'Submit PR for review' }], requiresInput: false, inputPrompt: '' },
    ]
  }

  if (role.includes('sales') || role.includes('crm') || role.includes('quota')) {
    return [
      { title: 'Complete Salesforce CRM setup', description: 'Configure your CRM profile, pipeline view, and import your initial prospect list.', category: 'Tools', estimatedTime: '1 hr', priority: 'high', subtasks: [{ title: 'Log in and configure profile' }, { title: 'Set up pipeline stages' }, { title: 'Add 5 initial prospects' }], requiresInput: false, inputPrompt: '' },
      { title: 'Product knowledge certification', description: 'Complete the 4 core product modules and pass the certification quiz with 80%+.', category: 'Learning', estimatedTime: '2 hrs', priority: 'high', subtasks: [{ title: 'Modules 1–2' }, { title: 'Modules 3–4' }, { title: 'Pass quiz' }], requiresInput: true, inputPrompt: 'What are the top 3 customer pain points our product solves? Write your answer here.' },
      { title: 'Shadow 3 discovery calls', description: 'Observe senior reps on real prospect calls and take structured BANT notes.', category: 'Learning', estimatedTime: '3 hrs', priority: 'medium', subtasks: [{ title: 'Call 1 observation' }, { title: 'Call 2 observation' }, { title: 'Call 3 observation' }], requiresInput: true, inputPrompt: 'After shadowing, what objection did you hear most? How was it handled?' },
    ]
  }

  if (role.includes('design') || role.includes('ux') || role.includes('ui')) {
    return [
      { title: 'Design system deep-dive', description: 'Review the Figma component library and document any inconsistencies or gaps.', category: 'Learning', estimatedTime: '2 hrs', priority: 'high', subtasks: [{ title: 'Review Figma components' }, { title: 'Document inconsistencies' }], requiresInput: false, inputPrompt: '' },
      { title: 'Accessibility audit of main screens', description: 'Run the top 5 screens through WCAG 2.1 AA checklist and file issues.', category: 'Compliance', estimatedTime: '2 hrs', priority: 'medium', subtasks: [{ title: 'Audit screen 1-2' }, { title: 'Audit screen 3-4' }, { title: 'Audit screen 5' }, { title: 'File accessibility issues' }], requiresInput: true, inputPrompt: 'List the top 3 accessibility issues you found and how you would fix them.' },
    ]
  }

  // Generic
  return [
    { title: `Complete ${employeeName.split(' ')[0]}'s onboarding checklist`, description: 'Review all sections of the employee handbook and acknowledge receipt.', category: 'Compliance', estimatedTime: '45 min', priority: 'high', subtasks: [{ title: 'Read company values section' }, { title: 'Review PTO policy' }, { title: 'Sign acknowledgement' }], requiresInput: false, inputPrompt: '' },
    { title: 'Meet key stakeholders', description: 'Schedule intro 1:1 calls with 5 cross-functional partners.', category: 'People', estimatedTime: '1.5 hrs', priority: 'medium', subtasks: [{ title: 'Schedule calls' }, { title: 'Prepare intro questions' }, { title: 'Complete all 5 calls' }], requiresInput: true, inputPrompt: 'Who did you meet and what was one thing you learned from each person?' },
    { title: 'Complete tools & access setup', description: 'Ensure all required software is installed and access is provisioned.', category: 'Tools', estimatedTime: '30 min', priority: 'high', subtasks: [{ title: 'Email & calendar' }, { title: 'Slack & communication tools' }, { title: 'Role-specific tools' }], requiresInput: false, inputPrompt: '' },
  ]
}

export async function suggestTasksForEmployee(
  employeeRole: string,
  employeeName: string,
  userRequest: string,
  documentContext?: string
): Promise<SuggestedTask[]> {
  const token = await getAccessToken()

  if (token) {
    const chatId = await createChat(token, TASK_AGENT_ID)
    if (chatId) {
      const prompt = `You are an onboarding specialist. Generate 3-5 specific onboarding tasks strictly tailored to the employee's role.
Employee: ${employeeName}, Role: ${employeeRole}
Admin request: ${userRequest}
${documentContext ? `Company context: ${documentContext.slice(0, 800)}` : ''}

IMPORTANT: Tasks must be relevant to the "${employeeRole}" role only. Do NOT generate software/engineering tasks unless the role is explicitly technical.

Respond with ONLY a JSON array (no markdown, no explanation):
[{"title":"...","description":"...","category":"Setup|Learning|Technical|Compliance|People|Tools|Admin","estimatedTime":"...","priority":"low|medium|high","subtasks":[{"title":"..."}],"requiresInput":false,"inputPrompt":""}]`
      const response = await sendMessage(token, chatId, prompt)
      if (response) {
        try {
          const jsonMatch = response.match(/\[[\s\S]*\]/)
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]) as SuggestedTask[]
            if (Array.isArray(parsed) && parsed.length > 0) return parsed
          }
        } catch { /* fall through to mock */ }
      }
    }
  }

  await new Promise(r => setTimeout(r, 1000 + Math.random() * 600))
  return mockSuggestedTasks(employeeRole, employeeName, userRequest)
}

// ─── Conversational task-creation agent (per-employee chat) ──────────────────
// Keeps a persistent chatId so follow-up messages stay in the same session.

export interface TaskChatMessage {
  role: 'user' | 'agent'
  content: string
  tasks?: SuggestedTask[]   // populated when agent includes JSON task array
}

let taskChatId: string | null = null
let taskChatToken: string | null = null

export async function resetTaskChat() {
  taskChatId = null
  taskChatToken = null
}

export async function sendTaskChatMessage(
  userMessage: string,
  employeeName: string,
  employeeRole: string,
  documentContext: string
): Promise<TaskChatMessage> {
  // Try real agent first
  const token = taskChatToken ?? await getAccessToken()
  if (token) {
    taskChatToken = token
    // Capture BEFORE creating chat so we know if this is the first message
    const isFirstMessage = !taskChatId
    if (!taskChatId) {
      const id = await createChat(token, TASK_AGENT_ID)
      if (id) taskChatId = id
    }
    if (taskChatId) {
      // On the first message inject the employee role context so the agent
      // generates tasks strictly relevant to that role
      const fullMsg = isFirstMessage
        ? `You are an expert onboarding task designer. You must generate tasks STRICTLY relevant to the employee's role — never default to software/engineering tasks for non-technical roles.\n\nEmployee: ${employeeName}\nRole: ${employeeRole}\n${documentContext ? `Company docs context: ${documentContext.slice(0, 600)}` : ''}\n\nWhen you suggest tasks, always append a JSON array at the END of your reply in this exact format (no markdown fences):\n[{"title":"...","description":"...","category":"Setup|Learning|Technical|Compliance|People|Tools|Admin","estimatedTime":"...","priority":"low|medium|high","subtasks":[{"title":"..."}],"requiresInput":false,"inputPrompt":""}]\n\nAdmin request: ${userMessage}`
        : userMessage

      const reply = await sendMessage(token, taskChatId, fullMsg)
      if (reply) {
        const tasks = _extractTasksFromText(reply)
        return { role: 'agent', content: reply, tasks: tasks.length > 0 ? tasks : undefined }
      }
    }
  }

  // Mock fallback — simulate a conversational response
  await new Promise(r => setTimeout(r, 900 + Math.random() * 700))
  const lower = userMessage.toLowerCase()
  const mockTasks = mockSuggestedTasks(employeeRole, employeeName, userMessage)

  if (lower.includes('change') || lower.includes('modify') || lower.includes('update') || lower.includes('instead')) {
    return {
      role: 'agent',
      content: `Sure! I've updated the task list based on your feedback. Here are the revised tasks for ${employeeName}:`,
      tasks: mockTasks.map(t => ({ ...t, title: `[Updated] ${t.title}` })),
    }
  }
  if (lower.includes('more') || lower.includes('add') || lower.includes('additional')) {
    return {
      role: 'agent',
      content: `Here are some additional tasks I'd suggest for ${employeeName} as a ${employeeRole}:`,
      tasks: mockTasks,
    }
  }
  if (lower.includes('remove') || lower.includes('delete') || lower.includes('fewer')) {
    return {
      role: 'agent',
      content: `Understood. I've simplified the list to the most essential tasks for ${employeeName}'s first week.`,
      tasks: mockTasks.slice(0, 2),
    }
  }

  return {
    role: 'agent',
    content: `Here's a tailored onboarding task list for ${employeeName} (${employeeRole}). You can ask me to adjust priorities, add more tasks, focus on specific areas, or modify any task. Just let me know!`,
    tasks: mockTasks,
  }
}

function _extractTasksFromText(text: string): SuggestedTask[] {
  try {
    const match = text.match(/\[[\s\S]*?\]/)
    if (match) {
      const parsed = JSON.parse(match[0])
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].title) return parsed
    }
  } catch { /* ignore */ }
  return []
}

// ─── Task extraction helper ───────────────────────────────────────────────────
// Parses AI response text to extract structured tasks

export interface ParsedTask {
  title: string
  description: string
  category: string
  estimatedTime: string
}

export function parseTasksFromResponse(response: string): ParsedTask[] {
  const tasks: ParsedTask[] = []
  const lines = response.split('\n')

  for (const line of lines) {
    const match = line.match(/^\d+\.\s+\*{0,2}(.+?)\*{0,2}\s*[—-]\s*(.+?)\s*[.(]\s*(\d+[^)]+)\s*[·•]\s*([^)]+)\)?/)
    if (match) {
      tasks.push({
        title: match[1].trim(),
        description: match[2].trim(),
        estimatedTime: match[3].trim(),
        category: match[4].trim().replace('*)', '').replace(')', '').trim(),
      })
    }
  }

  // Fallback: extract numbered lines without strict format
  if (tasks.length === 0) {
    for (const line of lines) {
      const simple = line.match(/^\d+\.\s+\*{0,2}(.+?)\*{0,2}\s*[—–-]/)
      if (simple && simple[1].length > 5) {
        tasks.push({
          title: simple[1].trim(),
          description: line.replace(/^\d+\.\s+/, '').trim(),
          estimatedTime: '30 min',
          category: 'General',
        })
      }
    }
  }

  return tasks.slice(0, 12)
}
