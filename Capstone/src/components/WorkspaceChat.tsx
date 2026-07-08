"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { GlobalState, stateVault, AtomicConcept } from "../lib/stateVault";
import { ASSESSMENT_DATABASE } from "../lib/agents/assessor";
import { OrchestratorAgent } from "../lib/agents/orchestrator";
import { ChatMessage, createMessage } from "../lib/chatTypes";
import { Markdown } from "./Markdown";
import {
  Send,
  Paperclip,
  Bot,
  User,
  Loader2,
  UploadCloud,
  Sparkles,
  RotateCcw,
} from "lucide-react";

interface WorkspaceChatProps {
  state: GlobalState;
  onNavigateToConcept?: (conceptName: string) => void;
  onTriggerReviewMode?: () => void;
}

type DemoSessionPayload = {
  syllabus_hierarchy: string[];
  current_milestone: string;
  student_profile: {
    mastered_concepts: string[];
    struggling_concepts: string[];
    total_questions_attempted: number;
    accuracy_rate: number;
  };
  current_quiz: {
    active: boolean;
    questions: unknown[];
    current_question_index: number;
    user_answers: unknown[];
  };
};

const DEMO_SESSION_PAYLOAD: DemoSessionPayload = {
  syllabus_hierarchy: [
    "Introduction to Neural Networks",
    "Backpropagation Mechanics",
    "Activation Functions",
    "Cost Functions & Optimization",
  ],
  current_milestone: "Backpropagation Mechanics",
  student_profile: {
    mastered_concepts: ["Introduction to Neural Networks", "Activation Functions"],
    struggling_concepts: ["Cost Functions & Optimization"],
    total_questions_attempted: 8,
    accuracy_rate: 75.0,
  },
  current_quiz: {
    active: false,
    questions: [],
    current_question_index: 0,
    user_answers: [],
  },
};

function createDemoStateFromPayload(payload: DemoSessionPayload): GlobalState {
  const conceptIds = payload.syllabus_hierarchy.map((_, index) => `CON_DEMO_${index + 1}`);
  const conceptLookup = new Map(
    payload.syllabus_hierarchy.map((conceptName, index) => [conceptName, `CON_DEMO_${index + 1}`])
  );

  const syllabus = payload.syllabus_hierarchy.map((conceptName, index) => {
    const conceptId = `CON_DEMO_${index + 1}`;
    return {
      module_id: `MOD_DEMO_${index + 1}`,
      title: conceptName,
      description: `Demo module for ${conceptName}`,
      atomic_concepts: [
        {
          concept_id: conceptId,
          name: conceptName,
          prerequisites: index === 0 ? [] : [`CON_DEMO_${index}`],
          core_text_anchors: [`Study ${conceptName}`],
          content: `### ${conceptName}`,
        },
      ],
    };
  });

  const masteredIds = payload.student_profile.mastered_concepts
    .map((conceptName) => conceptLookup.get(conceptName) ?? conceptName)
    .filter(Boolean);
  const strugglingIds = payload.student_profile.struggling_concepts
    .map((conceptName) => conceptLookup.get(conceptName) ?? conceptName)
    .filter(Boolean);

  const totalAttempts = payload.student_profile.total_questions_attempted;
  const accuracyRate = payload.student_profile.accuracy_rate;
  const correctCount = Math.round(totalAttempts * (accuracyRate / 100));

  return {
    session: {
      student_id: "STU_DEMO",
      course_title: "Neural Network Foundations",
      current_status: payload.current_quiz.active ? "ACTIVE_ASSESSMENT" : "INIT",
    },
    knowledge_vault: {
      raw_source_metadata: {
        file_names: ["demo_session.md"],
        total_tokens_ingested: 3200,
      },
      hierarchical_syllabus: syllabus,
    },
    student_profile: {
      knowledge_graph: {
        unlocked_nodes: conceptIds,
        mastered_nodes: masteredIds,
        struggling_nodes: strugglingIds,
        current_focus_node: conceptLookup.get(payload.current_milestone) ?? conceptIds[0],
      },
      history: Array.from({ length: totalAttempts }, (_, index) => ({
        timestamp: new Date(Date.now() - (index + 1) * 60000).toISOString(),
        concept_id: index < correctCount ? conceptIds[index % conceptIds.length] : strugglingIds[0] ?? conceptIds[0],
        assessment_type: index < correctCount ? "CONCEPT_PUZZLE" : "LOGIC_GATE",
        raw_user_input: index < correctCount ? "correct answer" : "review needed",
        score: index < correctCount ? 1.0 : 0.3,
        identified_gaps: index < correctCount ? [] : ["Review the concept anchors and retry."],
      })),
    },
  };
}

function applyDemoSessionState(payload: DemoSessionPayload = DEMO_SESSION_PAYLOAD): GlobalState {
  const nextState = createDemoStateFromPayload(payload);
  stateVault.mutate((s) => {
    s.session = nextState.session;
    s.knowledge_vault = nextState.knowledge_vault;
    s.student_profile = nextState.student_profile;
  }, "Orchestrator injected split-screen demo state");
  return nextState;
}

function buildDemoConfirmationMessage(payload: DemoSessionPayload): string {
  return [
    "> State sync confirmed.",
    `> Milestone: ${payload.current_milestone}`,
    `> Mastered: ${payload.student_profile.mastered_concepts.join(", ")}`,
    `> Struggling: ${payload.student_profile.struggling_concepts.join(", ")}`,
    `> Attempts: ${payload.student_profile.total_questions_attempted} • Accuracy: ${payload.student_profile.accuracy_rate.toFixed(1)}%`,
  ].join("\n");
}

// ─── Agent response generator ─────────────────────────────────────────────────

function getAllConcepts(state: GlobalState): AtomicConcept[] {
  return state.knowledge_vault.hierarchical_syllabus.flatMap((m) => m.atomic_concepts);
}

async function generateAgentResponse(
  userInput: string,
  state: GlobalState,
  addMessage: (msg: ChatMessage) => void,
  setIsTyping: (v: boolean) => void
): Promise<void> {
  setIsTyping(true);

  const lower = userInput.toLowerCase().trim();
  const { knowledge_graph } = state.student_profile;
  const allConcepts = getAllConcepts(state);
  const focusConcept = allConcepts.find((c) => c.concept_id === knowledge_graph.current_focus_node);

  await new Promise((r) => setTimeout(r, 900 + Math.random() * 600));

  // ── Intent: help / what can you do
  if (lower.includes("help") || lower.includes("what can you do") || lower.includes("commands")) {
    setIsTyping(false);
    addMessage(
      createMessage(
        "agent",
        `### 🧠 Adaptive Coach — Available Commands

Here's what I can help you with:

- **assess me** — Start an interactive assessment on your current focus concept
- **explain [concept]** — Get a detailed micro-lesson on any concept
- **what should I study** — Get personalized next-step recommendations
- **show progress** — Summary of your learning journey
- **ingest [topic name]** — Describe a topic to add to your syllabus
- **quiz me** — Get a quick knowledge check question
- **hint** — Get a hint for the current assessment

Or simply type your answer to the current question naturally!`
      )
    );
    return;
  }

  // ── Intent: progress report
  if (lower.includes("progress") || lower.includes("how am i doing") || lower.includes("stats")) {
    const { mastered_nodes, struggling_nodes } = knowledge_graph;
    const total = allConcepts.length;
    const mastered = mastered_nodes.length;
    const pct = total > 0 ? Math.round((mastered / total) * 100) : 0;
    const history = state.student_profile.history;
    const accuracy =
      history.length > 0
        ? Math.round((history.filter((h) => h.score >= 0.8).length / history.length) * 100)
        : 0;

    setIsTyping(false);
    addMessage(
      createMessage(
        "agent",
        `### 📊 Your Learning Progress Report

> You've mastered **${mastered} of ${total} concepts** — that's **${pct}% complete!**

---

**Overall Stats**
- Total Attempts: ${history.length}
- Accuracy Rate: ${accuracy}%
- Concepts Mastered: ${mastered}
- Flagged for Review: ${struggling_nodes.length}

${
  struggling_nodes.length > 0
    ? `**⚠️ Target Areas**\nThe following concepts need more attention:\n${struggling_nodes
        .map((id) => {
          const c = allConcepts.find((x) => x.concept_id === id);
          return `- ${c?.name || id}`;
        })
        .join("\n")}`
    : "**✅ No struggling areas** — you're on track!"
}

${pct >= 80 ? "🎉 Excellent progress! You're almost a **Knowledge Master**." : pct >= 40 ? "🚀 Solid work! Keep pushing forward." : "💡 Great start! Consistent practice will get you there."}`
      )
    );
    return;
  }

  // ── Intent: explain concept
  const explainMatch = lower.match(/explain\s+(.+)/);
  if (explainMatch || lower.includes("what is") || lower.includes("tell me about")) {
    const searchTerm = explainMatch
      ? explainMatch[1]
      : lower.replace("what is", "").replace("tell me about", "").trim();

    const matched = allConcepts.find(
      (c) =>
        c.name.toLowerCase().includes(searchTerm) ||
        c.concept_id.toLowerCase().includes(searchTerm.replace(/\s+/g, "_"))
    );

    if (matched) {
      setIsTyping(false);
      addMessage(
        createMessage(
          "agent",
          `### 📖 Micro-Lesson: ${matched.name}

${matched.content || matched.core_text_anchors.join("\n\n")}

---

> **Key Takeaways**
${matched.core_text_anchors.map((a) => `> - ${a}`).join("\n")}

Ready to test your understanding? Type **"assess me"** to begin an assessment on this concept.`
        )
      );
    } else {
      setIsTyping(false);
      addMessage(
        createMessage(
          "agent",
          `I couldn't find a concept matching **"${searchTerm}"** in your current syllabus.

Try one of these:
${allConcepts.map((c) => `- **${c.name}** — \`explain ${c.name.toLowerCase()}\``).join("\n")}

Or type **"ingest [topic]"** to add a new concept to your learning graph.`
        )
      );
    }
    return;
  }

  // ── Intent: assess / quiz
  if (
    lower.includes("assess me") ||
    lower.includes("quiz me") ||
    lower.includes("test me") ||
    lower.includes("start assessment")
  ) {
    if (!focusConcept) {
      setIsTyping(false);
      addMessage(
        createMessage("agent", "No active focus concept selected. Click a node in the Concept Graph first, or type **\"what should I study\"** for recommendations.")
      );
      return;
    }

    const qList = ASSESSMENT_DATABASE[focusConcept.concept_id];
    if (!qList || qList.length === 0) {
      setIsTyping(false);
      addMessage(
        createMessage(
          "agent",
          `### 🎯 Assessment: ${focusConcept.name}

No pre-seeded question available for this concept. Let me generate one:

> **Fill-in-the-blank:** The primary purpose of **${focusConcept.name}** is to ______ within ______ systems.

Type your answer below and I'll evaluate it!`
        )
      );
      return;
    }

    const q = qList[0];
    let prompt = `### 🎯 Assessment: ${focusConcept.name}\n\n`;
    prompt += `**Type:** ${q.type}\n\n`;
    prompt += `> ${q.instructions}\n\n`;
    prompt += `---\n\n`;

    if (q.type === "CONCEPT_PUZZLE") {
      prompt += `**Complete the sentence:**\n\n${q.questionText}\n\n`;
      prompt += `**Choose from:** ${q.options?.join(", ")}\n\n`;
      prompt += `_Type your answer as: \`word1,word2\`_`;
    } else if (q.type === "CODE_TRACE") {
      prompt += "**Trace this code and find the final variable values:**\n\n";
      prompt += "```python\n" + q.questionText + "\n```\n\n";
      prompt += "_Type your answer as: \`var1=value,var2=value\`_";
    } else if (q.type === "LOGIC_GATE") {
      prompt += `**${q.questionText}**\n\n`;
      prompt += `Set inputs A and B for the **${q.metadata.gateType}** gate to achieve output = **${q.metadata.targetOutput}**.\n\n`;
      prompt += "_Type your answer as: \`A=0,B=1\`_";
    }

    setIsTyping(false);
    addMessage(createMessage("agent", prompt));
    return;
  }

  // ── Intent: hint
  if (lower.includes("hint") || lower.includes("help me") || lower.includes("stuck")) {
    if (focusConcept) {
      setIsTyping(false);
      addMessage(
        createMessage(
          "agent",
          `### 💡 Hint for: ${focusConcept.name}

Here are your study anchors — key passages from the source material:

${focusConcept.core_text_anchors.map((a, i) => `${i + 1}. *"${a}"*`).join("\n\n")}

${
  focusConcept.prerequisites.length > 0
    ? `\n**Prerequisites you should review first:**\n${focusConcept.prerequisites.join(", ")}`
    : ""
}`
        )
      );
    } else {
      setIsTyping(false);
      addMessage(createMessage("agent", "Select a concept node in the graph first, then ask for a hint!"));
    }
    return;
  }

  // ── Intent: what should I study / next steps
  if (
    lower.includes("what should i study") ||
    lower.includes("next") ||
    lower.includes("recommend") ||
    lower.includes("suggestion")
  ) {
    const { unlocked_nodes, mastered_nodes: mn } = knowledge_graph;
    const pendingUnlocked = allConcepts.filter(
      (c) => unlocked_nodes.includes(c.concept_id) && !mn.includes(c.concept_id)
    );
    const locked = allConcepts.filter((c) => !unlocked_nodes.includes(c.concept_id));

    setIsTyping(false);
    addMessage(
      createMessage(
        "agent",
        `### 🗺 Personalized Study Recommendations

${
  pendingUnlocked.length > 0
    ? `**Ready to learn now (unlocked):**\n${pendingUnlocked.map((c) => `- **${c.name}** — type \`assess me\` after selecting it`).join("\n")}`
    : "**All unlocked concepts are mastered** — impressive!"
}

${
  locked.length > 0
    ? `\n**Coming up next (locked — complete prerequisites first):**\n${locked
        .slice(0, 3)
        .map((c) => `- **${c.name}** — requires: ${c.prerequisites.join(", ")}`)
        .join("\n")}`
    : ""
}

> **Current Focus:** ${focusConcept ? `**${focusConcept.name}**` : "None selected"}

Type **"assess me"** to start on your current focus concept!`
      )
    );
    return;
  }

  // ── Intent: looks like an assessment answer (contains = or ,)
  if ((lower.includes("=") || lower.includes(",")) && focusConcept) {
    const qList = ASSESSMENT_DATABASE[focusConcept.concept_id];
    if (qList && qList.length > 0) {
      const q = qList[0];
      setIsTyping(true);

      await OrchestratorAgent.submitAssessment(focusConcept.concept_id, q, userInput.trim());

      const latest = stateVault.getState().student_profile.history.slice(-1)[0];
      setIsTyping(false);

      if (latest) {
        if (latest.score >= 0.8) {
          addMessage(
            createMessage(
              "agent",
              `### ✅ Correct!

Outstanding work. **${focusConcept.name}** has been marked as **mastered** in your Memory Bank.

The Router Agent has updated your learning path. Check the left panel to see your progress update!

Type **"what should I study"** to see what's unlocked next.`
            )
          );
        } else {
          const gapText = latest.identified_gaps.length > 0
            ? latest.identified_gaps.map((g) => `- ${g}`).join("\n")
            : "- Review the concept anchors and try again.";
          addMessage(
            createMessage(
              "agent",
              `### ❌ Not Quite

Here's what the Assessor Agent identified:

${gapText}

> The Router Agent may redirect you to review prerequisites.

Type **"hint"** for a study nudge, or **"assess me"** to try again.`
            )
          );
        }
      }
      return;
    }
  }

  // ── Intent: load test state / simulate state sync (orchestrator debug)
  if (
    lower.includes("load test state") ||
    lower.includes("sync state") ||
    lower.includes("simulate state") ||
    lower.includes("push dummy") ||
    lower.includes("inject state")
  ) {
    setIsTyping(true);
    await new Promise((r) => setTimeout(r, 800));

    applyDemoSessionState();

    setIsTyping(false);
    addMessage(
      createMessage(
        "agent",
        `### 🔄 Orchestrator — State Sync Confirmed

${buildDemoConfirmationMessage(DEMO_SESSION_PAYLOAD)}

The left panel now reflects the updated split-screen demo state.`
      )
    );
    return;
  }

  // ── Intent: ingest new topic
  if (lower.startsWith("ingest ") || lower.includes("add topic") || lower.includes("add concept")) {
    const topicName = userInput.replace(/^ingest\s*/i, "").trim();
    setIsTyping(true);

    const mockContent = `# ${topicName}\n\n## CON_CHAT_${Date.now()}\nName: ${topicName}\nPrerequisites: \n\nContent:\nThis is an auto-generated study concept for ${topicName}. Fill in your own notes or paste actual content to get a richer learning experience.`;

    await OrchestratorAgent.ingestContent(`${topicName.replace(/\s+/g, "_")}.md`, mockContent);

    setIsTyping(false);
    addMessage(
      createMessage(
        "agent",
        `### 📥 Ingestion Complete: *${topicName}*

The **Parser Agent** has extracted and added this topic to your syllabus graph!

- New module added to your **Syllabus Map** _(left panel)_
- First concept node **unlocked** automatically
- **Agent Console** logged the full parsing trace

> For richer content extraction, use the **Knowledge Ingestor** panel and paste full Markdown notes.

Type **"assess me"** to start learning this concept!`
      )
    );
    return;
  }

  // ── Default fallback: conversational response
  const focusName = focusConcept?.name ?? "your current concept";
  setIsTyping(false);
  addMessage(
    createMessage(
      "agent",
      `I understood your message, but I'm not sure of the exact intent.

Here's what you can try:
- **"assess me"** — Start an assessment on *${focusName}*
- **"explain ${focusName.toLowerCase()}"** — Deep dive into the topic
- **"hint"** — Get a study nudge
- **"show progress"** — See your learning stats
- **"what should I study"** — Get personalized recommendations

Is there something specific about **${focusName}** you'd like to explore?`
    )
  );
}

// ─── Typing indicator ─────────────────────────────────────────────────────────

const TypingIndicator: React.FC = () => (
  <div className="flex items-end gap-3 mb-4">
    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shrink-0">
      <Bot className="w-3.5 h-3.5 text-white" />
    </div>
    <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-zinc-800/80 border border-zinc-700/50">
      <div className="flex gap-1 items-center h-3">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce"
            style={{ animationDelay: `${i * 150}ms`, animationDuration: "0.8s" }}
          />
        ))}
      </div>
    </div>
  </div>
);

// ─── File ingest handler ───────────────────────────────────────────────────────

async function handleFileIngest(
  file: File,
  addMessage: (msg: ChatMessage) => void,
  setIsTyping: (v: boolean) => void
) {
  addMessage(createMessage("user", `📎 Uploading file: **${file.name}**`));
  setIsTyping(true);

  const text = await file.text().catch(() => `# ${file.name}\n\nFile content could not be read.`);
  await OrchestratorAgent.ingestContent(file.name, text);

  setIsTyping(false);
  addMessage(
    createMessage(
      "agent",
      `### 📄 File Ingested: *${file.name}*

The **Parser Agent** has processed your document and updated the syllabus graph.

- New modules and concepts have been extracted
- The **Syllabus Map** in the left panel has been updated
- All prerequisite links have been resolved

Type **"what should I study"** to see what's newly unlocked!`
    )
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

const WELCOME_MESSAGE: ChatMessage = createMessage(
  "agent",
  `### 👋 Welcome to your Adaptive Micro-Learning Coach!

I'm your AI-powered study partner, backed by a **4-agent orchestration mesh**:

- 🔍 **Parser Agent** — Ingests and extracts your syllabus
- 📝 **Assessor Agent** — Grades your answers across 3 question types
- 🗺 **Router Agent** — Adapts your learning path based on gaps
- 🎯 **Orchestrator** — Choreographs the entire feedback loop

---

> **Your current focus:** Check the left panel's Syllabus Map to see your starting node.

**Get started:**
- Type **"assess me"** to begin an interactive assessment
- Type **"explain and gate"** for a concept deep-dive
- Type **"help"** to see all available commands
- Or **upload a PDF/Markdown file** using the 📎 icon below`
);

export const WorkspaceChat: React.FC<WorkspaceChatProps> = ({ state }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const demoSyncTriggeredRef = useRef(false);

  const addMessage = useCallback((msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  const syncDemoStateToUi = useCallback(async () => {
    if (demoSyncTriggeredRef.current) return;
    demoSyncTriggeredRef.current = true;

    setIsTyping(true);
    await new Promise((resolve) => setTimeout(resolve, 650));
    applyDemoSessionState();
    setIsTyping(false);
    addMessage(
      createMessage(
        "agent",
        `### 🔄 Orchestrator — State Sync Confirmed

${buildDemoConfirmationMessage(DEMO_SESSION_PAYLOAD)}

The left panel now reflects the updated split-screen demo state.`
      )
    );
  }, [addMessage]);

  const handleAutoMicroLesson = useCallback(
    (conceptName: string) => {
      setIsTyping(true);
      setTimeout(async () => {
        setIsTyping(false);
        addMessage(
          createMessage(
            "agent",
            `### 📖 Micro-Lesson: ${conceptName}

You've selected **${conceptName}** as your focus area. Let me provide a quick introduction.

---

**${conceptName}** is the core mechanism that allows neural networks to learn. Here's the foundation:

> **Key Concept:** During training, we need to compute how much each weight contributes to the final error. This requires propagating the error signal backward through the network.

**The Process:**
1. **Forward Pass** — Calculate the network's prediction
2. **Compute Loss** — Measure the difference from the true answer
3. **Backward Pass** — Propagate gradients back through each layer
4. **Weight Updates** — Adjust weights in the direction that reduces loss

---

**Core Text Anchors:**
- The chain rule of calculus allows us to break down complex derivatives into manageable pieces
- Each layer's gradient depends on the next layer's gradient
- Learning rate controls how aggressively we update weights

> Ready to test your understanding? Type **"assess me"** to begin, or ask **"explain more"** for deeper details!`
          )
        );
      }, 600);
    },
    [addMessage]
  );

  const handleAutoReviewMode = useCallback(() => {
    setIsTyping(true);
    setTimeout(async () => {
      setIsTyping(false);
      addMessage(
        createMessage(
          "agent",
          `### 🎯 Review Mode Activated

Great choice! Let's review the areas where you had trouble. Ready to start?

---

**Your Target Areas for Review:**
- 🔴 **Cost Functions & Optimization** — You scored 30% on this concept
- ⚠️ Focus on understanding gradient descent and optimizer selection

The system has flagged these gaps:
- *Gradient computation unclear*
- *Optimizer selection strategy*

Let's start with a focused question: **"What is the primary role of a cost function in training a neural network?"**

Type your answer, and I'll provide targeted feedback to close these gaps.`
        )
      );
    }, 600);
  }, [addMessage]);

  // Detect navigation triggers from analytics and new subjects
  useEffect(() => {
    const checkLogs = stateVault.getLogs();
    const lastLog = checkLogs[checkLogs.length - 1] ?? "";

    if (lastLog.includes("User navigated to concept:") && !demoSyncTriggeredRef.current) {
      const conceptMatch = lastLog.match(/User navigated to concept: (.+)$/);
      if (conceptMatch) {
        handleAutoMicroLesson(conceptMatch[1]);
      }
    }

    if (lastLog.includes("User initiated review mode") && !demoSyncTriggeredRef.current) {
      handleAutoReviewMode();
    }

    if (lastLog.includes("New subject added:") && !demoSyncTriggeredRef.current) {
      const subjectMatch = lastLog.match(/New subject added: (.+)$/);
      if (subjectMatch) {
        // Clear chat and send tailored welcome
        setMessages([]);
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          addMessage(
            createMessage(
              "agent",
              `### 👋 Welcome to ${subjectMatch[1]}!

Excellent choice! We're starting fresh with a brand new learning journey.

---

**Your First Milestone:** Tokenization & Embeddings

This is where we'll begin. Here's what you can expect:
- 📚 Core concepts and foundational knowledge
- 🧪 Interactive assessments to test your understanding
- 🗺️ A personalized learning path based on your progress
- 💡 Real-time feedback and remediation

---

> Ready to dive in? Type **"assess me"** to start your first assessment, or **"explain tokenization"** to get a detailed introduction to the concept.

Let's make this an amazing learning experience! 🚀`
            )
          );
        }, 800);
      }
    }
  }, [state, handleAutoMicroLesson, handleAutoReviewMode, addMessage]);

  useEffect(() => {
    void syncDemoStateToUi();
  }, [syncDemoStateToUi]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed || isTyping) return;

    addMessage(createMessage("user", trimmed));
    setInputValue("");
    inputRef.current?.focus();

    await generateAgentResponse(trimmed, stateVault.getState(), addMessage, setIsTyping);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleFileIngest(file, addMessage, setIsTyping);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await handleFileIngest(file, addMessage, setIsTyping);
    }
  };

  const handleClearChat = () => {
    setMessages([WELCOME_MESSAGE]);
  };

  const focusConceptName = state.knowledge_vault.hierarchical_syllabus
    .flatMap((module) => module.atomic_concepts)
    .find((concept) => concept.concept_id === state.student_profile.knowledge_graph.current_focus_node)?.name
    ?? state.student_profile.knowledge_graph.current_focus_node.replace(/_/g, " ");

  return (
    <div
      className="flex flex-col flex-1 min-w-0 h-full bg-zinc-950 relative"
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
    >
      {/* Drag overlay */}
      {isDragOver && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-indigo-950/80 backdrop-blur border-2 border-dashed border-indigo-500 rounded-none pointer-events-none">
          <UploadCloud className="w-12 h-12 text-indigo-400 mb-3" />
          <p className="text-indigo-300 font-semibold text-sm">Drop your file to ingest</p>
          <p className="text-indigo-500 text-xs mt-1">Supports .md, .txt, .pdf text content</p>
        </div>
      )}

      {/* ── Top bar ── */}
      <div className="shrink-0 border-b border-zinc-800/70 px-6 py-3.5 flex items-center justify-between bg-zinc-950/80 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-600/20">
            <Bot className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-zinc-100 leading-tight">Adaptive Micro-Learning Coach</h2>
            <p className="text-[10px] text-zinc-500">4-Agent Orchestration Mesh · Antigravity ADK v2.0</p>
          </div>
          <div className="flex items-center gap-1.5 ml-2 px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
            <Sparkles className="w-2.5 h-2.5 text-indigo-400" />
            <span className="text-[9px] font-semibold text-indigo-400">
              Focus: {focusConceptName}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={handleClearChat}
          title="Clear chat"
          className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800/50 text-zinc-500 hover:text-zinc-300 transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ── Message stream ── */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto scrollbar-thin px-6 py-6 space-y-1"
      >
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} state={state} />
        ))}
        {isTyping && <TypingIndicator />}
        <div className="h-2" />
      </div>

      {/* ── Fixed input bar ── */}
      <div className="shrink-0 border-t border-zinc-800/70 bg-zinc-950/90 backdrop-blur px-5 py-4">
        {/* Quick action pills */}
        <div className="flex gap-2 mb-3 flex-wrap">
          {["assess me", "explain concept", "show progress", "what should I study"].map((cmd) => (
            <button
              key={cmd}
              type="button"
              disabled={isTyping}
              onClick={() => {
                setInputValue(cmd);
                inputRef.current?.focus();
              }}
              className="text-[10px] px-2.5 py-1 rounded-full border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800/50 hover:border-zinc-700 text-zinc-500 hover:text-zinc-300 transition-all disabled:opacity-40"
            >
              {cmd}
            </button>
          ))}
        </div>

        <div className="flex gap-3 items-end">
          {/* File upload */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".md,.txt,.pdf"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isTyping}
            title="Upload file to ingest"
            className="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800/50 hover:border-indigo-500/50 text-zinc-500 hover:text-indigo-400 transition-all shrink-0 self-end disabled:opacity-40"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          {/* Text input */}
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              rows={1}
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                // Auto-grow
                e.target.style.height = "auto";
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
              }}
              onKeyDown={handleKeyDown}
              disabled={isTyping}
              placeholder="Ask your coach, submit an answer, or type 'help'…"
              className="w-full bg-zinc-900 border border-zinc-800 focus:border-indigo-500/60 rounded-xl px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none transition-all resize-none leading-relaxed scrollbar-thin disabled:opacity-50"
              style={{ minHeight: "42px", maxHeight: "120px" }}
            />
          </div>

          {/* Send */}
          <button
            type="button"
            onClick={handleSend}
            disabled={isTyping || !inputValue.trim()}
            className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all shrink-0 self-end disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isTyping ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Message Bubble ────────────────────────────────────────────────────────────

const MessageBubble: React.FC<{ message: ChatMessage; state: GlobalState }> = ({ message }) => {
  const isUser = message.role === "user";
  const time = new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  if (isUser) {
    return (
      <div className="flex justify-end mb-4 group">
        <div className="flex items-end gap-2.5 max-w-[75%]">
          <div className="flex flex-col items-end gap-1">
            <div className="px-4 py-2.5 rounded-2xl rounded-br-sm bg-indigo-600 text-white text-sm leading-relaxed shadow-md shadow-indigo-600/15">
              <Markdown content={message.content} />
            </div>
            <span className="text-[9px] text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity">
              {time}
            </span>
          </div>
          <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
            <User className="w-3.5 h-3.5 text-zinc-400" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-end gap-3 mb-4 group">
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shrink-0 shadow-md shadow-indigo-600/20">
        <Bot className="w-3.5 h-3.5 text-white" />
      </div>
      <div className="flex flex-col gap-1 max-w-[82%]">
        <div className="px-4 py-3.5 rounded-2xl rounded-bl-sm bg-zinc-800/70 border border-zinc-700/40 shadow-sm">
          <Markdown content={message.content} />
        </div>
        <span className="text-[9px] text-zinc-600 pl-1 opacity-0 group-hover:opacity-100 transition-opacity">
          Coach · {time}
        </span>
      </div>
    </div>
  );
};
