---
marp: true
theme: uncover
class: invert
paginate: true
style: |
  section {
    background-color: #0d1117;
    color: #e6edf3;
    font-family: 'Inter', 'Segoe UI', sans-serif;
  }
  h1 {
    color: #58a6ff;
    font-size: 2.8em;
  }
  h2 {
    color: #79c0ff;
  }
  li {
    text-align: left;
    font-size: 1.2em;
    line-height: 1.4;
  }
  strong {
    color: #2ea043;
  }
---

<!-- _class: lead -->
# 🏙️ Agentic AI for Smart City Complaint Resolution
**From Bureaucratic Bottlenecks to Autonomous Action**

---

## 🛑 1. The Problem Space
Urban issue reporting is broken.

- **The Ticket Black Hole:** Citizens report issues, but never hear back.
- **Manual Triage:** City officials drown in manual sorting and categorization.
- **Misrouting:** Complaints bounce between departments for weeks.
- **No Transparency:** Frustrated citizens left in the dark about infrastructure status.

<!-- Speaker Notes: "Currently, when a citizen reports a pothole or broken streetlight, the ticket falls into a bureaucratic black hole. Civil servants are overwhelmed, and citizens are frustrated." -->

---

## 💡 2. Why We Chose This Problem
*Because urban infrastructure affects everyone, every single day.*

- **Massive Scale:** Thousands of reports poured into municipalities daily.
- **Inefficient Legacy Tech:** Current systems are basically just email forms.
- **The AI Opportunity:** It is the perfect use-case for autonomous Agentic routing rather than simple "rule-based" ticking.

<!-- Speaker Notes: "We chose this because broken infrastructure isn't just an inconvenience; it impacts municipal budgets, safety, and daily life. Traditional software isn't fast enough to handle the volume—but AI agents are." -->

---

## ⚡ 3. Our Solution
An Agentic AI that **triages, verifies, and routes** autonomously.

- **Multimodal Submissions:** Citizens can upload text, voice, or images.
- **AI Triage Agent:** Under-the-hood engine instantly analyzes the issue.
- **No Human Checkers:** Automatically routes straight to the correct department (e.g., Water, Traffic, Public Works).
- **Status Loop:** Citizens are updated at every state change.

<!-- Speaker Notes: "Our solution removes the human middleman. Our AI agent listens to a citizen's voice note, sees their picture, understands it's a waterline break, and routes it directly to the local Water Department." -->

---

## 🏗️ 4. Technical Implementation
Built for speed, scale, and modern UX.

- **Frontend:** Next.js & React for a buttery-smooth citizen portal.
- **Backend Flow:** Node.js processing streams and API gateways.
- **Database:** MongoDB for flexible, multimodal schema storage.
- **AI Magic:** LLM reasoning to process voice context, image context, and auto-location tags simultaneously.

<!-- Speaker Notes: "We built this on a Next.js/Node.js stack. Why? Because we need to handle heavy, multimodal payload streams—like images combined with gps data—rapidly." -->

---

## ⚙️ 5. Methodology Workflow

1. **Ingestion:** User snaps a photo & sends a voice note.
2. **AI Analysis:** Agent parses location, image severity, and transcribes voice.
3. **Scoring:** Assigns priority (e.g., "Critical" for exposed wires vs. "Low" for graffiti).
4. **Autonomous Routing:** Pushes to specific authority's dashboard.
5. **Real-Time Map:** Heatmap updates live for public transparency.

<!-- Speaker Notes: "The flow is instant. Ingestion, agent analysis, severity scoring, and routing happen in under 2 seconds. No more waiting 3 days for someone to read the email." -->

---

## 🧠 6. What Makes Us Different?
**Not a form submission. An Autonomous Agent.**

- **Static vs. Agentic:** We don't use 'if-then' dropdown menus. The AI organically understands the context.
- **Multimodal First:** Voice and images are primary. Text is secondary.
- **Hyper-Local Context:** Combines GPS with incident reporting for automated clustering (detecting multiple reports of the same fire).

<!-- Speaker Notes: "What sets us apart? This isn't a form builder. Traditional apps ask the user to guess the correct department. Our Agentic logic requires zero user knowledge—just upload the issue, and the AI handles the bureaucracy." -->

---

## 🚀 7. Future Scope
Where we take this next.

- **Predictive Maintenance:** Using historical MongoDB data to predict pipe bursts or pothole formations *before* they are reported.
- **WhatsApp/Telegram Bots:** Letting users report directly from daily messaging apps via a conversational AI bot.
- **IoT Integration:** Connecting with smart streetlights to auto-verify citizen reports via nearby sensors.

<!-- Speaker Notes: "And this is just step one. Next, we integrate this with WhatsApp so citizens don't even need to download an app, and eventually use the data for predictive analytics to fix the city before it breaks." -->
