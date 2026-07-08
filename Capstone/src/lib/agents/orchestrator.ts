import { stateVault } from "../stateVault";
import { ParserAgent } from "./parser";
import { AssessorAgent, AssessmentQuestion } from "./assessor";
import { RouterAgent } from "./router";

export class OrchestratorAgent {
  /**
   * Orchestrates the ingestion flow (Parser Agent).
   */
  public static async ingestContent(fileName: string, content: string): Promise<boolean> {
    stateVault.addLog(`[Orchestrator] Ingest request received for file: "${fileName}"`);
    stateVault.mutate((s) => {
      s.session.current_status = "INIT";
    }, "Ingest started");

    try {
      const success = await ParserAgent.parseContent(fileName, content);
      if (success) {
        stateVault.addLog(`[Orchestrator] Content ingestion and syllabus parsing completed successfully.`);
        return true;
      }
    } catch (error) {
      stateVault.addLog(`[Orchestrator] Error during parser ingestion: ${error}`);
    }
    return false;
  }

  /**
   * Orchestrates the sequential assessment feedback loop:
   * 1. Submit answer -> 2. Graded by Assessor -> 3. Evaluated & rerouted by Router.
   */
  public static async submitAssessment(
    conceptId: string, 
    question: AssessmentQuestion, 
    answer: string
  ): Promise<boolean> {
    stateVault.addLog(`[Orchestrator] Assessment submission received for concept "${conceptId}"`);
    
    try {
      // Step 1: Grade the assessment
      const result = await AssessorAgent.evaluateAnswer(conceptId, question, answer);
      
      // Step 2: Route student based on results
      await RouterAgent.routeStudent(conceptId, result.score, result.identified_gaps);
      
      stateVault.addLog(`[Orchestrator] Feedback loop completed for concept "${conceptId}".`);
      return true;
    } catch (error) {
      stateVault.addLog(`[Orchestrator] Error in feedback loop orchestration: ${error}`);
    }
    return false;
  }
}
