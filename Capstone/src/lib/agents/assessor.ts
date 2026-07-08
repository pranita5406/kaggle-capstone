import { stateVault, AssessmentType, AssessmentHistoryItem } from "../stateVault";

export interface AssessmentQuestion {
  concept_id: string;
  type: AssessmentType;
  instructions: string;
  questionText: string;
  options?: string[]; // Multiple choice options if applicable
  correctAnswer: string; // The correct answer representation
  metadata: any; // Additional specific structure (like trace lines or gate settings)
}

// Seed questions database
export const ASSESSMENT_DATABASE: Record<string, AssessmentQuestion[]> = {
  "CON_001_AND": [
    {
      concept_id: "CON_001_AND",
      type: "CONCEPT_PUZZLE",
      instructions: "Complete the definition of the AND Gate logic by dragging/filling in the missing terms.",
      questionText: "An AND gate outputs 1 (True) only if ______ inputs are ______.",
      options: ["one of the", "both", "either", "0", "1", "different"],
      correctAnswer: "both,1", // User must select both and 1
      metadata: {
        blanksCount: 2,
        correctSequence: ["both", "1"]
      }
    },
    {
      concept_id: "CON_001_AND",
      type: "LOGIC_GATE",
      instructions: "Toggle the inputs A and B to verify the output matches the AND Gate logic.",
      questionText: "Configure inputs A and B so the output is 1 (True).",
      correctAnswer: "A=1,B=1",
      metadata: {
        gateType: "AND",
        targetOutput: 1
      }
    }
  ],
  "CON_002_OR": [
    {
      concept_id: "CON_002_OR",
      type: "CONCEPT_PUZZLE",
      instructions: "Complete the definition of the OR Gate logic.",
      questionText: "An OR gate outputs 0 (False) only if ______ inputs are ______.",
      options: ["one of the", "both", "either", "0", "1", "same"],
      correctAnswer: "both,0",
      metadata: {
        blanksCount: 2,
        correctSequence: ["both", "0"]
      }
    },
    {
      concept_id: "CON_002_OR",
      type: "LOGIC_GATE",
      instructions: "Toggle inputs A and B to verify the output matches the OR Gate logic.",
      questionText: "Configure inputs A and B so the output is 1 (True) and at least one input is 0 (False).",
      correctAnswer: "A=1,B=0|A=0,B=1",
      metadata: {
        gateType: "OR",
        targetOutput: 1
      }
    }
  ],
  "CON_003_XOR": [
    {
      concept_id: "CON_003_XOR",
      type: "CONCEPT_PUZZLE",
      instructions: "Complete the Exclusive OR logic sentence.",
      questionText: "An XOR gate outputs 1 (True) if inputs are ______ and 0 (False) if they are ______.",
      options: ["same", "different", "opposite", "both 1", "0"],
      correctAnswer: "different,same",
      metadata: {
        blanksCount: 2,
        correctSequence: ["different", "same"]
      }
    },
    {
      concept_id: "CON_003_XOR",
      type: "LOGIC_GATE",
      instructions: "Toggle inputs A and B to verify XOR logic.",
      questionText: "Configure inputs A and B so that output is 0 (False) but inputs are not both 0.",
      correctAnswer: "A=1,B=1",
      metadata: {
        gateType: "XOR",
        targetOutput: 0
      }
    }
  ],
  "CON_004_VAR": [
    {
      concept_id: "CON_004_VAR",
      type: "CODE_TRACE",
      instructions: "Trace the execution of this code block line by line.",
      questionText: `1: x = 5
2: y = 10
3: x = x + y
4: y = x - 2`,
      correctAnswer: "x=15,y=13",
      metadata: {
        lines: ["x = 5", "y = 10", "x = x + y", "y = x - 2"],
        expectedTrace: [
          { line: 1, variables: { x: 5 } },
          { line: 2, variables: { x: 5, y: 10 } },
          { line: 3, variables: { x: 15, y: 10 } },
          { line: 4, variables: { x: 15, y: 13 } }
        ]
      }
    }
  ],
  "CON_005_LOOP": [
    {
      concept_id: "CON_005_LOOP",
      type: "CODE_TRACE",
      instructions: "Complete the trace table values for the while loop iteration.",
      questionText: `1: i = 1
2: total = 0
3: while i < 4:
4:     total = total + i
5:     i = i + 1`,
      correctAnswer: "i=4,total=6",
      metadata: {
        lines: [
          "i = 1",
          "total = 0",
          "while i < 4:",
          "    total = total + i",
          "    i = i + 1"
        ],
        expectedTrace: [
          { line: 1, variables: { i: 1 } },
          { line: 2, variables: { i: 1, total: 0 } },
          { line: 4, variables: { i: 1, total: 1 } },
          { line: 5, variables: { i: 2, total: 1 } },
          { line: 4, variables: { i: 2, total: 3 } },
          { line: 5, variables: { i: 3, total: 3 } },
          { line: 4, variables: { i: 3, total: 6 } },
          { line: 5, variables: { i: 4, total: 6 } }
        ]
      }
    }
  ]
};

export class AssessorAgent {
  /**
   * Evaluates student's answer for a specific question.
   * Mutates the student profile history and reports details.
   */
  public static evaluateAnswer(
    conceptId: string, 
    question: AssessmentQuestion, 
    userInput: string
  ): Promise<AssessmentHistoryItem> {
    return new Promise((resolve) => {
      stateVault.addLog(`[Assessor Agent] Starting evaluation for concept "${conceptId}", type "${question.type}"`);

      setTimeout(() => {
        let score = 0.0;
        const gaps: string[] = [];

        // Grade checking logic
        if (question.type === "CONCEPT_PUZZLE") {
          // input should match correctAnswer (comma-separated sequence)
          const formatInput = userInput.trim().toLowerCase().replace(/\s+/g, "");
          const formatCorrect = question.correctAnswer.toLowerCase().replace(/\s+/g, "");
          if (formatInput === formatCorrect) {
            score = 1.0;
          } else {
            score = 0.0;
            gaps.push("Misunderstanding core logic description/definition.");
          }
        } else if (question.type === "LOGIC_GATE") {
          // input like 'A=1,B=1'
          const alternatives = question.correctAnswer.split("|");
          const formatInput = userInput.trim().replace(/\s+/g, "");
          
          if (alternatives.includes(formatInput)) {
            score = 1.0;
          } else {
            score = 0.0;
            gaps.push(`Failed to trace truth output for ${question.metadata.gateType} gate.`);
          }
        } else if (question.type === "CODE_TRACE") {
          // trace input like 'x=15,y=13'
          const formatInput = userInput.trim().toLowerCase().replace(/\s+/g, "");
          const formatCorrect = question.correctAnswer.toLowerCase().replace(/\s+/g, "");
          
          if (formatInput === formatCorrect) {
            score = 1.0;
          } else {
            score = 0.0;
            // specific diagnostics
            const inputVariables = this.parseVars(formatInput);
            const correctVariables = this.parseVars(formatCorrect);
            
            Object.keys(correctVariables).forEach(key => {
              if (inputVariables[key] !== correctVariables[key]) {
                gaps.push(`Incorrect final value tracked for variable '${key}' (got ${inputVariables[key] || "nothing"}, expected ${correctVariables[key]}).`);
              }
            });
            if (gaps.length === 0) {
              gaps.push("Incorrect trace state sequence.");
            }
          }
        }

        stateVault.addLog(`[Assessor Agent] Grading complete. Score: ${score.toFixed(1)}. Gaps identified: [${gaps.join(", ")}]`);

        const historyItem: AssessmentHistoryItem = {
          timestamp: new Date().toISOString(),
          concept_id: conceptId,
          assessment_type: question.type,
          raw_user_input: userInput,
          score: score,
          identified_gaps: gaps
        };

        // Mutate state with history item
        stateVault.mutate((state) => {
          state.student_profile.history.push(historyItem);
        }, `Graded attempt for ${conceptId}: score ${score}`);

        resolve(historyItem);
      }, 1000);
    });
  }

  private static parseVars(str: string): Record<string, string> {
    const res: Record<string, string> = {};
    str.split(",").forEach(part => {
      const sides = part.split("=");
      if (sides.length === 2) {
        res[sides[0]] = sides[1];
      }
    });
    return res;
  }
}
