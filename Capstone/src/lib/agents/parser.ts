import { stateVault, AtomicConcept, SyllabusModule } from "../stateVault";

export class ParserAgent {
  /**
   * Emulates parsing a raw text file and adding the extracted modules/concepts to the syllabus.
   */
  public static parseContent(fileName: string, textContent: string): Promise<boolean> {
    return new Promise((resolve) => {
      stateVault.addLog(`[Parser Agent] Starting ingestion of raw text source: "${fileName}"`);
      
      // Simulate asynchronous parsing delay
      setTimeout(() => {
        const tokenEstimate = Math.ceil(textContent.length / 4);
        stateVault.addLog(`[Parser Agent] Ingested ${tokenEstimate} tokens. Analyzing semantic anchors...`);

        // Simple heuristic extraction based on markdown headings
        const lines = textContent.split("\n");
        let currentModuleName = "Dynamic Extracted Module";
        let concepts: AtomicConcept[] = [];
        let tempConcept: Partial<AtomicConcept> | null = null;

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          if (line.startsWith("# ")) {
            currentModuleName = line.replace("# ", "");
          } else if (line.startsWith("## ")) {
            // Save previous concept
            if (tempConcept && tempConcept.concept_id && tempConcept.name) {
              concepts.push(tempConcept as AtomicConcept);
            }
            const name = line.replace("## ", "");
            const id = "CON_EXT_" + name.toUpperCase().replace(/[^A-Z0-9]/g, "_").substring(0, 10) + "_" + Math.floor(Math.random() * 1000);
            tempConcept = {
              concept_id: id,
              name: name,
              prerequisites: [],
              core_text_anchors: [],
              content: ""
            };
          } else if (line.toLowerCase().startsWith("prerequisites:") || line.toLowerCase().startsWith("requires:")) {
            if (tempConcept) {
              const reqs = line.split(":")[1].split(",").map(r => r.trim());
              tempConcept.prerequisites = reqs;
            }
          } else if (line.length > 10 && tempConcept) {
            // Add as content and anchor
            tempConcept.content += line + "\n";
            if (tempConcept.core_text_anchors!.length < 3 && line.length > 30 && !line.includes("###")) {
              tempConcept.core_text_anchors!.push(line);
            }
          }
        }

        // Push last concept
        if (tempConcept && tempConcept.concept_id && tempConcept.name) {
          concepts.push(tempConcept as AtomicConcept);
        }

        // If no concepts extracted, make a default one
        if (concepts.length === 0) {
          const id = "CON_EXT_GEN_" + Math.floor(Math.random() * 1000);
          concepts.push({
            concept_id: id,
            name: currentModuleName || "Custom Ingested Topic",
            prerequisites: [],
            core_text_anchors: ["Ingested general learning anchor. Read details in content."],
            content: textContent,
          });
        }

        // Mutate global state
        stateVault.mutate((state) => {
          // Add metadata
          if (!state.knowledge_vault.raw_source_metadata.file_names.includes(fileName)) {
            state.knowledge_vault.raw_source_metadata.file_names.push(fileName);
          }
          state.knowledge_vault.raw_source_metadata.total_tokens_ingested += tokenEstimate;

          // Create new module
          const moduleId = "MOD_EXT_" + Math.floor(Math.random() * 1000);
          const newModule: SyllabusModule = {
            module_id: moduleId,
            title: currentModuleName,
            description: `Auto-extracted learning module from ${fileName}`,
            atomic_concepts: concepts
          };

          state.knowledge_vault.hierarchical_syllabus.push(newModule);

          // Unlock the first concept of this module automatically
          const firstConceptId = concepts[0].concept_id;
          if (!state.student_profile.knowledge_graph.unlocked_nodes.includes(firstConceptId)) {
            state.student_profile.knowledge_graph.unlocked_nodes.push(firstConceptId);
          }
          
          state.session.current_status = "ACTIVE_ASSESSMENT";
          stateVault.addLog(`[Parser Agent] Created Module "${currentModuleName}" containing ${concepts.length} concepts.`);
          concepts.forEach(c => {
            stateVault.addLog(`[Parser Agent] Concept Extracted: ${c.name} (${c.concept_id}), Requires: [${c.prerequisites.join(", ")}]`);
          });
        }, `Ingested "${fileName}" adding module "${currentModuleName}"`);

        resolve(true);
      }, 1500);
    });
  }
}
