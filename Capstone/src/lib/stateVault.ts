// Central state machine definition and manager for the Adaptive Micro-Learning System.

export type CourseStatus = "INIT" | "COMPACTED" | "ACTIVE_ASSESSMENT" | "ROUTING_GAP" | "COMPLETED";
export type AssessmentType = "CONCEPT_PUZZLE" | "CODE_TRACE" | "LOGIC_GATE";

export interface AtomicConcept {
  concept_id: string;
  name: string;
  prerequisites: string[];
  core_text_anchors: string[]; // Key passages/concepts explaining this
  content?: string; // Core learning content
}

export interface SyllabusModule {
  module_id: string;
  title: string;
  description: string;
  atomic_concepts: AtomicConcept[];
}

export interface RawSourceMetadata {
  file_names: string[];
  total_tokens_ingested: number;
}

export interface KnowledgeVault {
  raw_source_metadata: RawSourceMetadata;
  hierarchical_syllabus: SyllabusModule[];
}

export interface KnowledgeGraph {
  unlocked_nodes: string[];
  mastered_nodes: string[];
  struggling_nodes: string[];
  current_focus_node: string;
}

export interface AssessmentHistoryItem {
  timestamp: string;
  concept_id: string;
  assessment_type: AssessmentType;
  raw_user_input: string;
  score: number; // 0.0 to 1.0
  identified_gaps: string[];
}

export interface StudentProfile {
  knowledge_graph: KnowledgeGraph;
  history: AssessmentHistoryItem[];
}

export interface GlobalState {
  session: {
    student_id: string;
    course_title: string;
    current_status: CourseStatus;
  };
  knowledge_vault: KnowledgeVault;
  student_profile: StudentProfile;
}

// Initial placeholder syllabus & concepts
export const INITIAL_SYLLABUS: SyllabusModule[] = [
  {
    module_id: "MOD_001",
    title: "Digital Logic Foundations",
    description: "Learn basic logic gates that power hardware and computing.",
    atomic_concepts: [
      {
        concept_id: "CON_001_AND",
        name: "AND Gate",
        prerequisites: [],
        core_text_anchors: [
          "An AND gate outputs 1 (True) only if BOTH of its inputs are 1 (True).",
          "If either input is 0, the output is 0.",
          "Truth Table: 0 AND 0 = 0, 0 AND 1 = 0, 1 AND 0 = 0, 1 AND 1 = 1."
        ],
        content: `### The AND Gate
The AND gate is a fundamental digital logic gate. Think of it like a safety box that requires **two distinct keys** to turn at the same time to open.

- Input A = 0, Input B = 0 → Output = 0
- Input A = 0, Input B = 1 → Output = 0
- Input A = 1, Input B = 0 → Output = 0
- Input A = 1, Input B = 1 → Output = 1

In code, this is represented by the logical AND operator (e.g., \`A && B\` in Javascript/Java, or \`A and B\` in Python).`
      },
      {
        concept_id: "CON_002_OR",
        name: "OR Gate",
        prerequisites: [],
        core_text_anchors: [
          "An OR gate outputs 1 (True) if AT LEAST ONE of its inputs is 1 (True).",
          "It only outputs 0 if BOTH inputs are 0.",
          "Truth Table: 0 OR 0 = 0, 0 OR 1 = 1, 1 OR 0 = 1, 1 OR 1 = 1."
        ],
        content: `### The OR Gate
The OR gate acts like a door with **two parallel handles**. Pressing down on either handle A OR handle B (or both) will open the door.

- Input A = 0, Input B = 0 → Output = 0
- Input A = 0, Input B = 1 → Output = 1
- Input A = 1, Input B = 0 → Output = 1
- Input A = 1, Input B = 1 → Output = 1

In code, this is represented by the logical OR operator (e.g., \`A || B\` in Javascript, or \`A or B\` in Python).`
      },
      {
        concept_id: "CON_003_XOR",
        name: "XOR (Exclusive OR) Gate",
        prerequisites: ["CON_001_AND", "CON_002_OR"],
        core_text_anchors: [
          "An XOR gate outputs 1 (True) if the inputs are DIFFERENT.",
          "It outputs 0 if the inputs are the SAME (both 0 or both 1).",
          "Truth Table: 0 XOR 0 = 0, 0 XOR 1 = 1, 1 XOR 0 = 1, 1 XOR 1 = 0."
        ],
        content: `### The Exclusive OR (XOR) Gate
The XOR gate outputs True *only* if one input is True and the other is False. If they are the same, it output False. 

Think of it like a light switch at the top and bottom of a staircase. Toggling either switch changes the state of the light, but if both are in the same direction, the light behaves predictably.

- Input A = 0, Input B = 0 → Output = 0
- Input A = 0, Input B = 1 → Output = 1
- Input A = 1, Input B = 0 → Output = 1
- Input A = 1, Input B = 1 → Output = 0

Mathematically, it represents addition modulo 2, which is critical in binary adders.`
      }
    ]
  },
  {
    module_id: "MOD_002",
    title: "Basic Programming & Variable Tracing",
    description: "Master variables, loops, and tracking state changes in code.",
    atomic_concepts: [
      {
        concept_id: "CON_004_VAR",
        name: "Variables and Assignment",
        prerequisites: [],
        core_text_anchors: [
          "Variables are containers for storing data values.",
          "Assignment (=) sets the variable on the left to the value evaluated on the right.",
          "Re-assignment updates the stored value, overwriting the previous one."
        ],
        content: `### Variables and Assignment
A variable is a named storage location in memory. When you write \`x = 5\`, you are storing the value \`5\` inside the label \`x\`.

If you later execute \`x = x + 2\`, the computer:
1. Looks up the current value of \`x\` (which is 5).
2. Adds 2 to it, yielding 7.
3. Overwrites the value in \`x\` with 7.

Understanding how variables update over time is key to writing algorithms.`
      },
      {
        concept_id: "CON_005_LOOP",
        name: "While Loops and Trace Tables",
        prerequisites: ["CON_004_VAR"],
        core_text_anchors: [
          "A while loop repeats a block of code as long as its condition remains True.",
          "A trace table tracks variable values line-by-line during loop execution.",
          "Failing to update loop control variables leads to an infinite loop."
        ],
        content: `### While Loops & Tracing
A \`while\` loop repeatedly executes a block of code as long as a condition is true.

\`\`\`python
count = 1
while count < 4:
    count = count + 1
\`\`\`

Let's trace this step-by-step:
1. \`count = 1\`
2. Check loop condition: \`count < 4\` (1 < 4 is True). Loop enters.
3. \`count = count + 1\` (count becomes 2).
4. Check loop condition: \`count < 4\` (2 < 4 is True). Loop repeats.
5. \`count = count + 1\` (count becomes 3).
6. Check loop condition: \`count < 4\` (3 < 4 is True). Loop repeats.
7. \`count = count + 1\` (count becomes 4).
8. Check loop condition: \`count < 4\` (4 < 4 is False). Loop exits!

End state: \`count\` is 4.`
      }
    ]
  }
];

export const getInitialState = (): GlobalState => ({
  session: {
    student_id: "STU_9982X",
    course_title: "Logic Gates & Variable Tracing Basics",
    current_status: "INIT"
  },
  knowledge_vault: {
    raw_source_metadata: {
      file_names: ["course_intro.md"],
      total_tokens_ingested: 1250
    },
    hierarchical_syllabus: INITIAL_SYLLABUS
  },
  student_profile: {
    knowledge_graph: {
      unlocked_nodes: ["CON_001_AND", "CON_002_OR", "CON_004_VAR"],
      mastered_nodes: [],
      struggling_nodes: [],
      current_focus_node: "CON_001_AND"
    },
    history: []
  }
});

// A simple local storage and event emitter class for state vault sync
type StateListener = (state: GlobalState) => void;
type LogListener = (logs: string[]) => void;

class StateVaultManager {
  private state: GlobalState;
  private listeners: Set<StateListener> = new Set();
  private logs: string[] = [];
  private logListeners: Set<LogListener> = new Set();

  constructor() {
    // Check if window/localStorage is available
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("adaptive_learning_state");
      if (saved) {
        try {
          this.state = JSON.parse(saved);
          const savedLogs = localStorage.getItem("adaptive_learning_logs");
          if (savedLogs) {
            this.logs = JSON.parse(savedLogs);
          }
          return;
        } catch (e) {
          console.error("Failed to parse state from localStorage, resetting", e);
        }
      }
    }
    this.state = getInitialState();
    this.addLog("System initialized. Welcome Student STU_9982X.");
  }

  public getState(): GlobalState {
    return this.state;
  }

  public getLogs(): string[] {
    return this.logs;
  }

  public mutate(updater: (state: GlobalState) => void, actionDescription?: string) {
    updater(this.state);
    if (actionDescription) {
      this.addLog(`[Vault Mutation] ${actionDescription}`);
    }
    this.saveAndNotify();
  }

  public addLog(logMessage: string) {
    const timestamp = new Date().toISOString().substring(11, 19);
    this.logs.push(`[${timestamp}] ${logMessage}`);
    // Cap logs at 100 entries
    if (this.logs.length > 100) {
      this.logs.shift();
    }
    if (typeof window !== "undefined") {
      localStorage.setItem("adaptive_learning_logs", JSON.stringify(this.logs));
    }
    this.logListeners.forEach(l => l([...this.logs]));
  }

  public clearLogs() {
    this.logs = [];
    this.addLog("Logs cleared.");
    this.saveAndNotify();
  }

  public reset() {
    this.state = getInitialState();
    this.logs = [];
    this.addLog("State reset to initial defaults.");
    this.saveAndNotify();
  }

  public subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    // Initial notify
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public subscribeLogs(listener: LogListener): () => void {
    this.logListeners.add(listener);
    listener([...this.logs]);
    return () => {
      this.logListeners.delete(listener);
    };
  }

  private saveAndNotify() {
    if (typeof window !== "undefined") {
      localStorage.setItem("adaptive_learning_state", JSON.stringify(this.state));
    }
    this.listeners.forEach(l => l({ ...this.state }));
  }
}

// Singleton state vault instance
export const stateVault = new StateVaultManager();
