import { stateVault, SyllabusModule, AtomicConcept } from "../stateVault";

export class RouterAgent {
  /**
   * Evaluates the learning graph state after a grading event, unlocking nodes,
   * flags gaps, updates struggling/mastered status, and sets the next focus node.
   */
  public static routeStudent(conceptId: string, score: number, gaps: string[]): Promise<boolean> {
    return new Promise((resolve) => {
      stateVault.addLog(`[Router Agent] Evaluating learning path for concept "${conceptId}" (Score: ${score})`);

      setTimeout(() => {
        stateVault.mutate((state) => {
          const profile = state.student_profile;
          const graph = profile.knowledge_graph;

          // 1. Update node status based on score
          if (score >= 0.8) {
            // Mastered
            if (!graph.mastered_nodes.includes(conceptId)) {
              graph.mastered_nodes.push(conceptId);
            }
            // Remove from struggling
            graph.struggling_nodes = graph.struggling_nodes.filter(n => n !== conceptId);
            stateVault.addLog(`[Router Agent] Node "${conceptId}" added to mastered_nodes.`);
          } else {
            // Struggling
            if (!graph.struggling_nodes.includes(conceptId)) {
              graph.struggling_nodes.push(conceptId);
            }
            stateVault.addLog(`[Router Agent] Node "${conceptId}" flagged in struggling_nodes due to performance.`);
          }

          // 2. Perform Syllabus-wide dependency check to unlock new nodes
          const allConcepts: AtomicConcept[] = [];
          state.knowledge_vault.hierarchical_syllabus.forEach((mod: SyllabusModule) => {
            mod.atomic_concepts.forEach(c => allConcepts.push(c));
          });

          allConcepts.forEach(concept => {
            // If already unlocked/mastered, skip
            if (graph.unlocked_nodes.includes(concept.concept_id)) {
              return;
            }

            // Check if all prerequisites are mastered
            const prereqsMet = concept.prerequisites.every(prereqId => 
              graph.mastered_nodes.includes(prereqId)
            );

            if (prereqsMet) {
              graph.unlocked_nodes.push(concept.concept_id);
              stateVault.addLog(`[Router Agent] Unlocked new node "${concept.name}" (${concept.concept_id}) as prerequisites are met.`);
            }
          });

          // 3. Determine next focus node
          let nextFocus = graph.current_focus_node;
          let routerReason = "";

          if (score < 0.8) {
            // If student struggled, check if there's a prerequisite we should route them back to
            const currentConcept = allConcepts.find(c => c.concept_id === conceptId);
            if (currentConcept && currentConcept.prerequisites.length > 0) {
              // Find the first prerequisite that is not mastered, or just go back to the first prereq
              const strugglePrereq = currentConcept.prerequisites.find(p => !graph.mastered_nodes.includes(p));
              if (strugglePrereq) {
                nextFocus = strugglePrereq;
                routerReason = `Rerouting student back to prerequisite node "${strugglePrereq}" to address knowledge gaps.`;
                state.session.current_status = "ROUTING_GAP";
              }
            }
            
            if (!routerReason) {
              routerReason = `Keeping focus on "${conceptId}" to re-assess concept.`;
              state.session.current_status = "ACTIVE_ASSESSMENT";
            }
          } else {
            // Find next unlocked node that is not mastered
            const nextPending = graph.unlocked_nodes.find(nodeId => !graph.mastered_nodes.includes(nodeId));
            if (nextPending) {
              nextFocus = nextPending;
              routerReason = `Advancing student to next unlocked node: "${nextPending}".`;
              state.session.current_status = "ACTIVE_ASSESSMENT";
            } else {
              // All unlocked nodes mastered!
              // Are there any locked nodes left?
              const totalNodes = allConcepts.length;
              const masteredCount = graph.mastered_nodes.length;
              
              if (masteredCount >= totalNodes) {
                routerReason = "Congratulations! All concepts in the syllabus have been mastered.";
                state.session.current_status = "COMPLETED";
              } else {
                routerReason = "Syllabus pending further unlocked nodes. Please fulfill outstanding prerequisites or ingest more content.";
                state.session.current_status = "COMPACTED";
              }
            }
          }

          graph.current_focus_node = nextFocus;
          stateVault.addLog(`[Router Agent] Decision: ${routerReason} Current Focus: ${nextFocus}`);
        }, `Routed student focus node`);

        resolve(true);
      }, 1200);
    });
  }
}
