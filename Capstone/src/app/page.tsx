"use client";

import React, { useEffect, useMemo, useState } from "react";
import { stateVault, GlobalState } from "../lib/stateVault";
import { MemoryBankSidebar } from "../components/MemoryBankSidebar";
import { WorkspaceChat } from "../components/WorkspaceChat";
import {
  BarChart3,
  BookOpen,
  Brain,
  House,
  Loader2,
  PlayCircle,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";

type PageView = "home" | "study" | "analytics";

type CourseCard = {
  id: string;
  title: string;
  description: string;
  mastery: number;
  accent: string;
  statusLabel: string;
};

const INITIAL_COURSES: CourseCard[] = [
  {
    id: "neural-networks",
    title: "Intro to Neural Networks",
    description: "Foundational models and learning loops.",
    mastery: 75,
    accent: "#818cf8",
    statusLabel: "Active",
  },
  {
    id: "computer-vision",
    title: "Vision Systems",
    description: "Convolutional layers and feature extraction.",
    mastery: 62,
    accent: "#34d399",
    statusLabel: "Growing",
  },
  {
    id: "nlp-fundamentals",
    title: "Language Models",
    description: "Embeddings, tokens, and context windows.",
    mastery: 41,
    accent: "#f59e0b",
    statusLabel: "In Review",
  },
];

export default function Home() {
  const [state, setState] = useState<GlobalState | null>(null);
  const [currentPageState, setCurrentPageState] = useState<PageView>("home");
  const [activeSubjectState, setActiveSubjectState] = useState<string | null>("neural-networks");
  const [courses, setCourses] = useState<CourseCard[]>(INITIAL_COURSES);
  const [pendingDeleteCourse, setPendingDeleteCourse] = useState<CourseCard | null>(null);

  useEffect(() => {
    const unsubscribe = stateVault.subscribe((newState) => {
      setState(JSON.parse(JSON.stringify(newState)));
    });
    return unsubscribe;
  }, []);

  const activeCourse = useMemo(
    () => courses.find((course) => course.id === activeSubjectState) ?? null,
    [courses, activeSubjectState]
  );

  const handleNavigate = (view: PageView) => {
    if (view === "analytics" && !activeSubjectState) {
      setCurrentPageState("analytics");
      return;
    }
    setCurrentPageState(view);
  };

  const handleStudyCourse = (courseId: string) => {
    setActiveSubjectState(courseId);
    setCurrentPageState("study");
  };

  const handleNavigateToConcept = (conceptName: string) => {
    setCurrentPageState("study");
    stateVault.addLog(`[Analytics Router] User clicked on focus concept: ${conceptName}`);
    stateVault.mutate((s) => {
      // Marker for WorkspaceChat to detect and trigger micro-lesson
    }, `User navigated to concept: ${conceptName}`);
  };

  const handleTriggerReviewMode = () => {
    setCurrentPageState("study");
    stateVault.addLog(`[Analytics Router] User triggered review mode for struggling concepts`);
    stateVault.mutate((s) => {
      // Marker for WorkspaceChat to detect and trigger review prompt
    }, "User initiated review mode");
  };

  const handleAddNewSubject = () => {
    const newSubjectId = `subj-${Date.now()}`;
    const newCourse: CourseCard = {
      id: newSubjectId,
      title: "Large Language Models (LLMs)",
      description: "Tokenization, embeddings, transformer architecture, and fine-tuning.",
      mastery: 0,
      accent: "#ec4899",
      statusLabel: "New",
    };

    // 1. Add new course to the list
    setCourses((prev) => [...prev, newCourse]);

    // 2. Immediately switch to study view with the new course active
    setActiveSubjectState(newSubjectId);
    setCurrentPageState("study");

    // 3. Log action and trigger orchestrator welcome message
    stateVault.addLog(`[Orchestrator] New subject initialized: ${newCourse.title}`);
    stateVault.mutate((s) => {
      // Marker for WorkspaceChat to detect and send tailored welcome
    }, `New subject added: ${newCourse.title}`);
  };

  const confirmDeleteCourse = () => {
    if (!pendingDeleteCourse) return;

    setCourses((prev) => prev.filter((course) => course.id !== pendingDeleteCourse.id));

    if (activeSubjectState === pendingDeleteCourse.id) {
      setActiveSubjectState(null);
      setCurrentPageState("home");
    }

    setPendingDeleteCourse(null);
  };

  if (!state) {
    return (
      <div className="h-screen w-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-zinc-500">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-600/20 animate-pulse">
            <Loader2 className="w-5 h-5 text-white animate-spin" />
          </div>
          <p className="text-xs font-mono">Synchronizing Central Vault…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-zinc-950 text-zinc-100">
      <aside className="w-72 shrink-0 border-r border-zinc-800/80 bg-zinc-950/95 p-5 flex flex-col gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-100">Adaptive Micro-Learning Coach</h2>
              <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-500">STU_DEMO</p>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3">
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Session
            </div>
            <p className="mt-2 text-sm text-zinc-300">Course orchestration is active and ready to guide your next study sprint.</p>
          </div>
        </div>

        <nav className="space-y-2">
          <button
            type="button"
            onClick={() => handleNavigate("home")}
            className={`flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition-all ${
              currentPageState === "home"
                ? "border-indigo-500/40 bg-indigo-500/10 text-indigo-200 shadow-lg shadow-indigo-500/10"
                : "border-zinc-800/80 bg-zinc-900/70 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
            }`}
          >
            <House className="w-4 h-4" />
            <span className="text-sm font-medium">Home / All Courses</span>
          </button>

          <button
            type="button"
            onClick={() => handleNavigate("analytics")}
            className={`flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition-all ${
              currentPageState === "analytics"
                ? "border-violet-500/40 bg-violet-500/10 text-violet-200 shadow-lg shadow-violet-500/10"
                : "border-zinc-800/80 bg-zinc-900/70 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span className="text-sm font-medium">Analytics & Performance</span>
          </button>
        </nav>

        {activeCourse ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-3">
            <div className="flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-[0.35em] text-zinc-500">Active Subject</p>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-medium text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </span>
            </div>
            <p className="mt-2 text-sm font-semibold text-zinc-100">{activeCourse.title}</p>
            <p className="mt-1 text-xs text-zinc-500">{activeCourse.description}</p>
          </div>
        ) : null}
      </aside>

      <main className="flex-1 min-w-0">
        {currentPageState === "home" ? (
          <div className="h-full overflow-y-auto p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">Course Manager</p>
                <h1 className="text-2xl font-semibold text-zinc-100">📚 Course Manager | Active Syllabi ({courses.length})</h1>
              </div>
              <button
                type="button"
                onClick={handleAddNewSubject}
                className="inline-flex items-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-900/70 px-3 py-2 text-sm text-zinc-300 transition hover:border-zinc-700 hover:text-white"
              >
                <Plus className="w-4 h-4" />
                Add New Subject
              </button>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
              <button
                type="button"
                onClick={handleAddNewSubject}
                className="flex min-h-[240px] flex-col justify-between rounded-3xl border border-dashed border-indigo-500/40 bg-gradient-to-br from-indigo-500/10 via-zinc-900/80 to-violet-500/10 p-5 text-left transition hover:border-indigo-400/60 hover:shadow-lg hover:shadow-indigo-500/10"
              >
                <div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-300">
                    <Plus className="w-5 h-5" />
                  </div>
                  <h2 className="mt-4 text-lg font-semibold text-zinc-100">Add New Subject</h2>
                  <p className="mt-2 text-sm text-zinc-400">Upload a PDF or paste a link to a new syllabus and let the parser ingest it.</p>
                </div>
                <span className="inline-flex items-center gap-2 text-sm font-medium text-indigo-300">
                  Start ingesting <PlayCircle className="w-4 h-4" />
                </span>
              </button>

              {courses.map((course) => {
                const ringOffset = 2 * Math.PI * 24;
                const ringLength = ringOffset * (1 - course.mastery / 100);

                return (
                  <div
                    key={course.id}
                    className="flex min-h-[240px] flex-col justify-between rounded-3xl border border-zinc-800 bg-zinc-900/80 p-5 shadow-sm shadow-black/20"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">{course.statusLabel}</p>
                          <h2 className="mt-1 text-lg font-semibold text-zinc-100">{course.title}</h2>
                        </div>
                        <span className="rounded-full border border-zinc-700 px-2 py-1 text-[10px] font-medium text-zinc-400">
                          {course.mastery}%
                        </span>
                      </div>

                      <p className="mt-2 text-sm leading-6 text-zinc-400">{course.description}</p>
                    </div>

                    <div className="mt-5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <svg viewBox="0 0 64 64" className="h-14 w-14 -rotate-90">
                          <circle cx="32" cy="32" r="24" stroke="#27272a" strokeWidth="7" fill="none" />
                          <circle
                            cx="32"
                            cy="32"
                            r="24"
                            stroke={course.accent}
                            strokeWidth="7"
                            fill="none"
                            strokeLinecap="round"
                            strokeDasharray={2 * Math.PI * 24}
                            strokeDashoffset={ringLength}
                          />
                        </svg>
                        <div>
                          <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">Mastery</p>
                          <p className="text-lg font-semibold text-zinc-100">{course.mastery}%</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleStudyCourse(course.id)}
                        className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600/90 px-3 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
                      >
                        <PlayCircle className="w-4 h-4" />
                        Study This Subject
                      </button>
                    </div>

                    <div className="mt-5 flex items-center justify-between">
                      <div className="inline-flex items-center gap-2 text-xs text-zinc-500">
                        <BookOpen className="w-3.5 h-3.5" />
                        Parsed syllabus ready
                      </div>
                      <button
                        type="button"
                        onClick={() => setPendingDeleteCourse(course)}
                        className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-2 text-rose-400 transition hover:bg-rose-500/20"
                        aria-label={`Delete ${course.title}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : currentPageState === "analytics" ? (
          <div className="h-full overflow-y-auto p-6 md:p-8">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-8 shadow-sm shadow-black/20">
              {activeCourse ? (
                <>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.35em] text-zinc-500">Analytics</p>
                      <h2 className="mt-2 text-2xl font-semibold text-zinc-100">{activeCourse.title}</h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCurrentPageState("home")}
                      className="rounded-2xl border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-sm text-zinc-300 transition hover:border-zinc-700 hover:text-white"
                    >
                      Back to Courses
                    </button>
                  </div>

                  <div className="mt-8 grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
                      <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Mastery</p>
                      <p className="mt-2 text-2xl font-semibold text-emerald-400">{activeCourse.mastery}%</p>
                    </div>
                    <div
                      onClick={() => handleNavigateToConcept("Backpropagation Mechanics")}
                      className="cursor-pointer rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 transition-all hover:border-indigo-500/50 hover:bg-zinc-900/80"
                    >
                      <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Focus</p>
                      <p className="mt-2 text-xl font-semibold text-zinc-100 hover:text-indigo-300 transition-colors">Backpropagation Mechanics</p>
                    </div>
                    <div
                      onClick={() => handleTriggerReviewMode()}
                      className="cursor-pointer rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 transition-all hover:border-violet-500/50 hover:bg-zinc-900/80"
                    >
                      <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Next Step</p>
                      <p className="mt-2 text-xl font-semibold text-indigo-300 underline-offset-2 hover:underline transition-all">Revisit weak concepts</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex h-64 flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-800 bg-zinc-950/60 text-center">
                  <Sparkles className="w-10 h-10 text-violet-400" />
                  <h2 className="mt-4 text-xl font-semibold text-zinc-100">Please select a subject to see data.</h2>
                  <p className="mt-2 max-w-md text-sm text-zinc-400">Choose a course from the manager grid to unlock analytics and performance insights.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-zinc-800/70 px-5 py-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">Current Subject</p>
                <h2 className="text-lg font-semibold text-zinc-100">{activeCourse?.title ?? "Select a course"}</h2>
              </div>
              <button
                type="button"
                onClick={() => setCurrentPageState("home")}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/70 px-3 py-2 text-sm text-zinc-300 transition hover:border-zinc-700 hover:text-white"
              >
                Back to Courses
              </button>
            </div>
            <div className="flex-1 min-h-0 flex">
              <MemoryBankSidebar state={state} />
              <WorkspaceChat state={state} onNavigateToConcept={handleNavigateToConcept} onTriggerReviewMode={handleTriggerReviewMode} />
            </div>
          </div>
        )}
      </main>

      {pendingDeleteCourse ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl shadow-black/40">
            <p className="text-[10px] uppercase tracking-[0.35em] text-rose-400">Delete subject</p>
            <h3 className="mt-3 text-xl font-semibold text-zinc-100">Delete “{pendingDeleteCourse.title}”?</h3>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              Are you sure you want to delete “{pendingDeleteCourse.title}”? All progress and memory data will be permanently wiped.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setPendingDeleteCourse(null)}
                className="rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm text-zinc-300 transition hover:border-zinc-600 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteCourse}
                className="rounded-2xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
