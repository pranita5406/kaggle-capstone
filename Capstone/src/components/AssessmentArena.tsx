"use client";

import React, { useState, useEffect } from "react";
import { GlobalState, AtomicConcept, stateVault } from "../lib/stateVault";
import { ASSESSMENT_DATABASE, AssessmentQuestion } from "../lib/agents/assessor";
import { OrchestratorAgent } from "../lib/agents/orchestrator";
import { Award, CheckCircle, HelpCircle, RefreshCw, XCircle } from "lucide-react";

interface AssessmentArenaProps {
  state: GlobalState;
  onAssessmentCompleted: () => void;
}

export const AssessmentArena: React.FC<AssessmentArenaProps> = ({ state, onAssessmentCompleted }) => {
  const { student_profile } = state;
  const { knowledge_graph } = student_profile;
  const focusNodeId = knowledge_graph.current_focus_node;

  // Flatten syllabus to find focus concept
  let focusConcept: AtomicConcept | undefined;
  state.knowledge_vault.hierarchical_syllabus.forEach(mod => {
    const found = mod.atomic_concepts.find(c => c.concept_id === focusNodeId);
    if (found) focusConcept = found;
  });

  const [question, setQuestion] = useState<AssessmentQuestion | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [typedInputs, setTypedInputs] = useState<Record<string, string>>({});
  const [logicInputs, setLogicInputs] = useState<{ A: number; B: number }>({ A: 0, B: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ success: boolean; msg: string } | null>(null);

  // Load questions for focus node
  useEffect(() => {
    setFeedback(null);
    setSelectedAnswers([]);
    setTypedInputs({});
    setLogicInputs({ A: 0, B: 0 });

    if (focusNodeId) {
      const qList = ASSESSMENT_DATABASE[focusNodeId];
      if (qList && qList.length > 0) {
        // Pick first question for simplicity or alternate
        setQuestion(qList[0]);
      } else {
        // Generate dynamic mock question for auto-ingested nodes
        const title = focusConcept?.name || "Ingested Concept";
        const generatedQ: AssessmentQuestion = {
          concept_id: focusNodeId,
          type: "CONCEPT_PUZZLE",
          instructions: "Complete the statement summarizing this custom concept.",
          questionText: `This topic covers ${title}. The primary purpose of this element is to ______ the ______ of the system.`,
          options: ["improve", "run", "structure", "integrity", "performance", "flow"],
          correctAnswer: "improve,performance",
          metadata: {
            blanksCount: 2,
            correctSequence: ["improve", "performance"]
          }
        };
        setQuestion(generatedQ);
      }
    }
  }, [focusNodeId]);

  if (!focusConcept) {
    return (
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 backdrop-blur-xl h-full flex items-center justify-center text-zinc-500">
        No active concept selected. Click an unlocked node on the graph.
      </div>
    );
  }

  // Calculate logic gate output
  const getLogicOutput = (gateType: string, a: number, b: number): number => {
    if (gateType === "AND") return a && b;
    if (gateType === "OR") return a || b;
    if (gateType === "XOR") return a !== b ? 1 : 0;
    if (gateType === "NAND") return !(a && b) ? 1 : 0;
    return 0;
  };

  const getLogicOutputText = (gateType: string, a: number, b: number): string => {
    return getLogicOutput(gateType, a, b).toString();
  };

  const handleSubmit = async () => {
    if (!question) return;
    setIsSubmitting(true);
    setFeedback(null);

    let answerString = "";

    if (question.type === "CONCEPT_PUZZLE") {
      answerString = selectedAnswers.join(",");
    } else if (question.type === "CODE_TRACE") {
      // combine typedInputs as variable string x=15,y=13
      const vars = Object.keys(typedInputs).map(k => `${k}=${typedInputs[k]}`).join(",");
      answerString = vars;
    } else if (question.type === "LOGIC_GATE") {
      answerString = `A=${logicInputs.A},B=${logicInputs.B}`;
    }

    // Submit via Orchestrator (Assessor + Router loop)
    await OrchestratorAgent.submitAssessment(focusNodeId, question, answerString);
    setIsSubmitting(false);

    // Read last graded history item
    const lastAttempt = stateVault.getState().student_profile.history.slice(-1)[0];
    if (lastAttempt) {
      if (lastAttempt.score >= 0.8) {
        setFeedback({
          success: true,
          msg: "Correct! Outstanding performance. You have mastered this concept node."
        });
      } else {
        setFeedback({
          success: false,
          msg: lastAttempt.identified_gaps.join(" ") || "Incorrect answer. Router Agent might reroute you to review prerequisites."
        });
      }
      onAssessmentCompleted();
    }
  };

  // Puzzle interactions
  const handleOptionClick = (opt: string) => {
    if (selectedAnswers.includes(opt)) {
      setSelectedAnswers(selectedAnswers.filter(a => a !== opt));
    } else {
      if (selectedAnswers.length < (question?.metadata.blanksCount || 1)) {
        setSelectedAnswers([...selectedAnswers, opt]);
      }
    }
  };

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 backdrop-blur-xl flex flex-col h-full">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-indigo-400" />
          Assessment Arena
        </h2>
        <span className="text-[10px] bg-indigo-500/10 text-indigo-400 font-mono px-2 py-0.5 border border-indigo-500/20 rounded">
          {question?.type}
        </span>
      </div>

      {/* Concept study reference */}
      <div className="mb-4 p-3 bg-zinc-950/40 border border-zinc-800/80 rounded-xl">
        <h3 className="text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
          Review Anchor Passages:
        </h3>
        <ul className="list-disc pl-4 space-y-1">
          {focusConcept.core_text_anchors.map((anchor, idx) => (
            <li key={idx} className="text-[10.5px] text-zinc-400 leading-relaxed italic">
              "{anchor}"
            </li>
          ))}
        </ul>
      </div>

      {/* Question instructions */}
      <div className="text-xs text-zinc-300 mb-3 font-semibold">
        {question?.instructions}
      </div>

      {/* Question specific layout */}
      <div className="flex-1 flex flex-col justify-center border border-zinc-800/50 bg-zinc-950/65 rounded-xl p-4 mb-4">
        {question?.type === "CONCEPT_PUZZLE" && (
          <div className="flex flex-col gap-4 items-center">
            {/* Sentence puzzle display */}
            <div className="text-sm text-zinc-300 leading-relaxed text-center font-mono">
              {(() => {
                const parts = question.questionText.split("______");
                return (
                  <span>
                    {parts.map((p, idx) => (
                      <React.Fragment key={idx}>
                        {p}
                        {idx < parts.length - 1 && (
                          <span className="mx-1 px-3.5 py-1 border-b border-dashed border-indigo-500 bg-indigo-500/5 text-indigo-300 rounded font-semibold text-xs min-w-[70px] inline-block text-center">
                            {selectedAnswers[idx] || "?"}
                          </span>
                        )}
                      </React.Fragment>
                    ))}
                  </span>
                );
              })()}
            </div>

            {/* Word choices */}
            <div className="flex flex-wrap gap-2 justify-center mt-3">
              {question.options?.map((opt, idx) => {
                const isSelected = selectedAnswers.includes(opt);
                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={feedback?.success || isSubmitting}
                    onClick={() => handleOptionClick(opt)}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                      isSelected
                        ? "bg-indigo-600/25 border-indigo-500 text-indigo-200"
                        : "bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {question?.type === "CODE_TRACE" && (
          <div className="flex flex-col gap-3">
            {/* Code editor pane */}
            <pre className="p-3 bg-black/50 border border-zinc-900 rounded-lg text-[11px] font-mono text-zinc-300 overflow-x-auto leading-relaxed">
              <code>{question.questionText}</code>
            </pre>

            {/* Input boxes for final variable states */}
            <div className="flex flex-col gap-2 mt-2">
              <span className="text-[10px] text-zinc-500 font-semibold font-mono">Track final variable states:</span>
              <div className="flex gap-4">
                {(() => {
                  // extract variables (e.g. x, y, i, total)
                  const variables = question.correctAnswer.split(",").map(v => v.split("=")[0]);
                  return variables.map((varName) => (
                    <div key={varName} className="flex items-center gap-2">
                      <span className="font-mono text-xs text-zinc-400">{varName} =</span>
                      <input
                        type="text"
                        disabled={feedback?.success || isSubmitting}
                        placeholder="Value"
                        value={typedInputs[varName] || ""}
                        onChange={(e) => setTypedInputs({ ...typedInputs, [varName]: e.target.value })}
                        className="w-16 bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1 text-xs text-zinc-200 font-mono text-center focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>
        )}

        {question?.type === "LOGIC_GATE" && (
          <div className="flex flex-col items-center gap-4">
            <div className="text-[11px] text-zinc-400 text-center font-semibold mb-1">
              {question.questionText}
            </div>

            {/* Interactive logic diagram */}
            <div className="flex items-center gap-6 p-4 bg-zinc-900/40 border border-zinc-800/80 rounded-xl max-w-sm w-full justify-between">
              {/* Inputs */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-zinc-400">In A</span>
                  <button
                    type="button"
                    disabled={feedback?.success || isSubmitting}
                    onClick={() => setLogicInputs({ ...logicInputs, A: logicInputs.A === 1 ? 0 : 1 })}
                    className={`w-8 h-8 rounded-lg font-mono text-xs font-bold transition-all border flex items-center justify-center ${
                      logicInputs.A === 1
                        ? "bg-indigo-600 border-indigo-400 text-white shadow-md shadow-indigo-600/30"
                        : "bg-zinc-800 border-zinc-700 text-zinc-400"
                    }`}
                  >
                    {logicInputs.A}
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-zinc-400">In B</span>
                  <button
                    type="button"
                    disabled={feedback?.success || isSubmitting}
                    onClick={() => setLogicInputs({ ...logicInputs, B: logicInputs.B === 1 ? 0 : 1 })}
                    className={`w-8 h-8 rounded-lg font-mono text-xs font-bold transition-all border flex items-center justify-center ${
                      logicInputs.B === 1
                        ? "bg-indigo-600 border-indigo-400 text-white shadow-md shadow-indigo-600/30"
                        : "bg-zinc-800 border-zinc-700 text-zinc-400"
                    }`}
                  >
                    {logicInputs.B}
                  </button>
                </div>
              </div>

              {/* Gate Icon / Label */}
              <div className="px-4 py-2 bg-indigo-950/40 border border-indigo-500/20 rounded-lg text-center font-bold text-indigo-300 font-mono text-sm shadow-inner shadow-black">
                {question.metadata.gateType}
              </div>

              {/* Output indicator */}
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-mono text-xs font-bold shadow-lg transition-all duration-300 ${
                  getLogicOutput(question.metadata.gateType, logicInputs.A, logicInputs.B) === 1
                    ? "bg-emerald-600 border-emerald-400 text-white shadow-emerald-600/20"
                    : "bg-zinc-800 border-zinc-700 text-zinc-500 shadow-transparent"
                }`}>
                  {getLogicOutputText(question.metadata.gateType, logicInputs.A, logicInputs.B)}
                </div>
                <span className="text-xs font-mono text-zinc-400">Out</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Feedback panel */}
      {feedback && (
        <div className={`mb-4 p-3 rounded-xl border flex items-start gap-3 transition-all animate-fadeIn ${
          feedback.success
            ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-300"
            : "bg-rose-950/30 border-rose-500/30 text-rose-300"
        }`}>
          {feedback.success ? (
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <span className="text-[11.5px] leading-relaxed">{feedback.msg}</span>
          </div>
        </div>
      )}

      {/* Submission actions */}
      <div className="flex gap-3">
        {feedback && !feedback.success && (
          <button
            type="button"
            onClick={() => {
              setFeedback(null);
              setSelectedAnswers([]);
              setTypedInputs({});
              setLogicInputs({ A: 0, B: 0 });
            }}
            className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs border border-zinc-800 hover:bg-zinc-800/40 rounded-xl text-zinc-400 hover:text-zinc-200 transition-all font-mono"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        )}

        <button
          type="button"
          disabled={isSubmitting || feedback?.success}
          onClick={handleSubmit}
          className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl py-2.5 text-xs shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Assessor Agent Evaluating...
            </>
          ) : (
            <>
              <Award className="w-4 h-4" /> Submit Attempt
            </>
          )}
        </button>
      </div>
    </div>
  );
};
