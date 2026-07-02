import React, { useState, useCallback, useMemo } from "react";
import {
  Brain,
  House,
  BarChart3,
  Plus,
  Trash2,
  PlayCircle,
  Send,
  Paperclip,
  RotateCcw,
  Sparkles,
  UploadCloud,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Target,
  TrendingUp,
  Zap,
  Bot,
  User,
  Loader2,
  X,
} from "lucide-react";

const AdaptiveMicroLearningCoach = () => {
  // ─── GLOBAL STATE ─────────────────────────────────────────────────────────
  const [courses, setCourses] = useState([
    {
      id: "neural-networks",
      title: "Neural Network Foundations",
      description: "Deep learning essentials and backprop mechanics.",
      current_milestone: "Backpropagation Mechanics",
      mastery: 50,
      accent: "#818cf8",
      statusLabel: "Active",
      student_profile: {
        mastered_concepts: ["Introduction to Neural Networks", "Activation Functions"],
        struggling_concepts: ["Cost Functions & Optimization"],
        total_questions_attempted: 8,
        accuracy_rate: 75.0,
      },
      syllabus_hierarchy: [
        "Introduction to Neural Networks",
        "Backpropagation Mechanics",
        "Activation Functions",
        "Cost Functions & Optimization",
      ],
      chat_history: [
        { sender: "agent", text: "Welcome to your adaptive learning dashboard!", time: "09:00" },
      ],
    },
    {
      id: "language-models",
      title: "Language Models",
      description: "Embeddings, tokens, and transformer architectures.",
      current_milestone: "Transformer Architecture",
      mastery: 41,
      accent: "#f59e0b",
      statusLabel: "In Review",
      student_profile: {
        mastered_concepts: ["Tokenization & Embeddings"],
        struggling_concepts: ["Attention Mechanisms"],
        total_questions_attempted: 5,
        accuracy_rate: 62.0,
      },
      syllabus_hierarchy: [
        "Tokenization & Embeddings",
        "Transformer Architecture",
        "Attention Mechanisms",
        "Fine-Tuning & RLHF",
      ],
      chat_history: [
        { sender: "agent", text: "Let's explore large language models together!", time: "08:30" },
      ],
    },
  ]);

  const [currentView, setCurrentView] = useState("courses"); // 'courses', 'study', 'analytics'
  const [activeSubjectId, setActiveSubjectId] = useState("neural-networks");
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [expandedModules, setExpandedModules] = useState(new Set());
  const [newSubjectForm, setNewSubjectForm] = useState({
    title: "",
    milestone: "",
    syllabus: "",
  });

  const activeCourse = useMemo(
    () => courses.find((c) => c.id === activeSubjectId) ?? courses[0],
    [courses, activeSubjectId]
  );

  // ─── HANDLERS ─────────────────────────────────────────────────────────────
  const handleNavigate = useCallback((view) => {
    setCurrentView(view);
  }, []);

  const handleStudyCourse = useCallback((courseId) => {
    setActiveSubjectId(courseId);
    setCurrentView("study");
    setMessages([]);
  }, []);

  const handleAddNewSubject = useCallback(() => {
    const nodes = newSubjectForm.syllabus
      .split(",")
      .map((n) => n.trim())
      .filter(Boolean);

    const newCourse = {
      id: `subj-${Date.now()}`,
      title: newSubjectForm.title || "Untitled Subject",
      description: `Focus: ${newSubjectForm.milestone}`,
      current_milestone: newSubjectForm.milestone || nodes[0] || "Concept 1",
      mastery: 0,
      accent: `hsl(${Math.random() * 360}, 70%, 50%)`,
      statusLabel: "New",
      student_profile: {
        mastered_concepts: [],
        struggling_concepts: [],
        total_questions_attempted: 0,
        accuracy_rate: 0,
      },
      syllabus_hierarchy: nodes.length > 0 ? nodes : ["Concept 1"],
      chat_history: [],
    };

    setCourses((prev) => [...prev, newCourse]);
    setActiveSubjectId(newCourse.id);
    setCurrentView("study");
    setShowAddModal(false);
    setNewSubjectForm({ title: "", milestone: "", syllabus: "" });
    setMessages([
      {
        sender: "agent",
        text: `Welcome to ${newCourse.title}! Let's start with "${newCourse.current_milestone}". Ready to dive in?`,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  }, [newSubjectForm]);

  const handleDeleteCourse = useCallback((courseId) => {
    if (!window.confirm("Are you sure? This will permanently delete all progress.")) return;

    setCourses((prev) => prev.filter((c) => c.id !== courseId));
    if (activeSubjectId === courseId) {
      setActiveSubjectId(courses[0]?.id ?? null);
      setCurrentView("courses");
    }
    setPendingDelete(null);
  }, [activeSubjectId, courses]);

  const handleSendMessage = useCallback(async () => {
    const trimmed = inputValue.trim();
    if (!trimmed || isTyping) return;

    setMessages((prev) => [
      ...prev,
      {
        sender: "user",
        text: trimmed,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setInputValue("");
    setIsTyping(true);

    await new Promise((r) => setTimeout(r, 800));

    const lower = trimmed.toLowerCase();
    let response = "";

    if (lower.includes("assess me")) {
      response = `Great! Let's test your understanding of "${activeCourse.current_milestone}".\n\n**Question:** What is the primary purpose of ${activeCourse.current_milestone.toLowerCase()}?\n\nA) To optimize weights\nB) To compute gradients\nC) To measure loss\n\nType your answer!`;
    } else if (lower.includes("explain")) {
      response = `### Deep Dive: ${activeCourse.current_milestone}\n\n${activeCourse.current_milestone} is a fundamental concept that enables neural networks to learn effectively. Here are the key principles...\n\nType **"assess me"** when ready to test your knowledge!`;
    } else if (lower.includes("progress")) {
      response = `### Your Progress Report\n\n✅ **Mastery:** ${activeCourse.mastery}%\n📊 **Attempted:** ${activeCourse.student_profile.total_questions_attempted} questions\n🎯 **Accuracy:** ${activeCourse.student_profile.accuracy_rate.toFixed(1)}%\n\n**Mastered:** ${activeCourse.student_profile.mastered_concepts.join(", ") || "None yet"}\n**Target Areas:** ${activeCourse.student_profile.struggling_concepts.join(", ") || "All clear!"}`;
    } else {
      response = `I understand! That's a great observation about ${activeCourse.current_milestone}. Let me elaborate...\n\nFeel free to ask me to **"assess me"**, **"explain"** a concept, or **"show progress"**!`;
    }

    setIsTyping(false);
    setMessages((prev) => [
      ...prev,
      {
        sender: "agent",
        text: response,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  }, [inputValue, isTyping, activeCourse]);

  const handleNavigateToConcept = useCallback(() => {
    setCurrentView("study");
    setMessages((prev) => [
      ...prev,
      {
        sender: "agent",
        text: `### Focused Study: ${activeCourse.current_milestone}\n\nYou've selected this as your focus area. Let's explore it in depth with targeted exercises and real-world examples.`,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  }, [activeCourse]);

  const handleReviewMode = useCallback(() => {
    setCurrentView("study");
    const targets = activeCourse.student_profile.struggling_concepts.join(", ") || "these areas";
    setMessages((prev) => [
      ...prev,
      {
        sender: "agent",
        text: `### Remediation Mode\n\nLet's focus on strengthening your understanding of: **${targets}**\n\nType **"assess me"** to start a targeted review session!`,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  }, [activeCourse]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  // ─── RENDER: COURSES VIEW ─────────────────────────────────────────────────
  const renderCoursesView = () => (
    <div className="h-full overflow-y-auto p-6 md:p-8 bg-slate-950">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-500">Course Manager</p>
          <h1 className="text-3xl font-bold text-slate-100 mt-1">
            📚 All Courses | Active Syllabi ({courses.length})
          </h1>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-white font-medium transition"
        >
          <Plus className="w-5 h-5" />
          Add New Subject
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <button
          onClick={() => setShowAddModal(true)}
          className="flex min-h-64 flex-col justify-between rounded-2xl border-2 border-dashed border-indigo-500/40 bg-gradient-to-br from-indigo-500/10 to-violet-500/5 p-6 text-left hover:border-indigo-400 hover:shadow-lg hover:shadow-indigo-500/10 transition"
        >
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-300 mb-4">
              <Plus className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-semibold text-slate-100">Create New Subject</h2>
            <p className="text-sm text-slate-400 mt-2">Define your own syllabus and start learning</p>
          </div>
          <span className="inline-flex items-center gap-2 text-indigo-300 text-sm font-medium">
            Start Now <PlayCircle className="w-4 h-4" />
          </span>
        </button>

        {courses.map((course) => {
          const ringCircum = 2 * Math.PI * 24;
          const ringLength = ringCircum * (1 - course.mastery / 100);

          return (
            <div
              key={course.id}
              className="flex min-h-64 flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-md shadow-black/30 hover:border-slate-700 transition"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-slate-500">{course.statusLabel}</p>
                    <h3 className="text-lg font-semibold text-slate-100 mt-1">{course.title}</h3>
                  </div>
                  <span className="text-sm font-mono font-semibold text-slate-300 bg-slate-800 px-2 py-1 rounded">
                    {course.mastery}%
                  </span>
                </div>
                <p className="text-sm text-slate-400 line-clamp-2">{course.description}</p>
              </div>

              <div className="flex items-center gap-4 mt-5">
                <svg viewBox="0 0 64 64" className="h-16 w-16 -rotate-90">
                  <circle cx="32" cy="32" r="24" stroke="#334155" strokeWidth="6" fill="none" />
                  <circle
                    cx="32"
                    cy="32"
                    r="24"
                    stroke={course.accent}
                    strokeWidth="6"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={ringCircum}
                    strokeDashoffset={ringLength}
                  />
                </svg>

                <div className="flex-1">
                  <p className="text-xs uppercase tracking-widest text-slate-500">Milestone</p>
                  <p className="text-sm font-semibold text-slate-200 truncate">{course.current_milestone}</p>
                </div>
              </div>

              <div className="flex gap-2 mt-5">
                <button
                  onClick={() => handleStudyCourse(course.id)}
                  className="flex-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-3 py-2 text-sm font-medium text-white transition"
                >
                  Study
                </button>
                <button
                  onClick={() => setPendingDelete(course.id)}
                  className="rounded-lg border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/20 p-2 text-rose-400 transition"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ─── RENDER: STUDY VIEW ───────────────────────────────────────────────────
  const renderStudyView = () => (
    <div className="h-full flex gap-0 bg-slate-950">
      {/* Left Sidebar: Nav Rail */}
      <div className="w-16 shrink-0 border-r border-slate-800 bg-slate-900/50 flex flex-col items-center py-4 gap-4">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
          <Brain className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 flex flex-col gap-3">
          <button
            onClick={() => handleNavigate("courses")}
            className="p-2.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
            title="Home"
          >
            <House className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleNavigate("analytics")}
            className="p-2.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
            title="Analytics"
          >
            <BarChart3 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Memory Bank Sidebar */}
      <div className="w-72 shrink-0 border-r border-slate-800 bg-slate-900/30 overflow-y-auto p-5 space-y-5">
        <div>
          <h3 className="text-xs uppercase tracking-widest text-slate-500 font-semibold">Learner Core Memory</h3>
          <p className="text-sm font-semibold text-slate-200 mt-2">{activeCourse.title}</p>
        </div>

        <div className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-slate-500">Progress</p>
          <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-violet-500 transition-all"
              style={{ width: `${activeCourse.mastery}%` }}
            />
          </div>
          <p className="text-sm font-semibold text-slate-200">{activeCourse.mastery}% Mastery</p>
        </div>

        {activeCourse.student_profile.mastered_concepts.length > 0 && (
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-500 flex items-center gap-1 mb-2">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Mastered
            </p>
            <div className="flex flex-wrap gap-2">
              {activeCourse.student_profile.mastered_concepts.map((c) => (
                <span
                  key={c}
                  className="text-xs px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}

        {activeCourse.student_profile.struggling_concepts.length > 0 && (
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-500 flex items-center gap-1 mb-2">
              <AlertTriangle className="w-3 h-3 text-amber-400" /> Target Areas
            </p>
            <div className="flex flex-wrap gap-2">
              {activeCourse.student_profile.struggling_concepts.map((c) => (
                <span
                  key={c}
                  className="text-xs px-2 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}

        <div>
          <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold flex items-center gap-1 mb-3">
            <BookOpen className="w-3 h-3" /> Syllabus Map
          </p>
          <div className="space-y-2">
            {activeCourse.syllabus_hierarchy.map((node, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setCourses((prev) =>
                    prev.map((c) =>
                      c.id === activeCourse.id ? { ...c, current_milestone: node } : c
                    )
                  );
                  setMessages((prev) => [
                    ...prev,
                    {
                      sender: "agent",
                      text: `Now focusing on: **${node}**\n\nLet's dive into this concept. Type "assess me" or "explain" to learn more!`,
                      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                    },
                  ]);
                }}
                className={`p-3 rounded-lg cursor-pointer transition ${
                  activeCourse.current_milestone === node
                    ? "bg-indigo-500/20 border border-indigo-500/40 text-indigo-200"
                    : "bg-slate-800/40 border border-slate-800 text-slate-400 hover:bg-slate-800/60"
                }`}
              >
                <p className="text-sm font-medium truncate">{node}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-950">
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 shrink-0">
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-500">Active Subject</p>
            <h2 className="text-lg font-semibold text-slate-100">{activeCourse.title}</h2>
          </div>
          <button
            onClick={() => setCurrentView("courses")}
            className="rounded-lg border border-slate-800 bg-slate-900/50 hover:bg-slate-800 px-3 py-2 text-sm text-slate-300 transition"
          >
            Back
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <Sparkles className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">Start a conversation with your coach!</p>
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : ""}`}>
                {msg.sender === "agent" && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-md rounded-lg px-4 py-3 ${
                    msg.sender === "user"
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-800 text-slate-100"
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  <p className="text-xs opacity-60 mt-1">{msg.time}</p>
                </div>
              </div>
            ))
          )}
          {isTyping && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-slate-800 px-4 py-3 rounded-lg flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce"
                    style={{ animationDelay: `${i * 150}ms` }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-slate-800 bg-slate-900/50 p-4 shrink-0">
          <div className="flex gap-2 mb-3 flex-wrap">
            {["assess me", "explain", "show progress", "help"].map((cmd) => (
              <button
                key={cmd}
                onClick={() => setInputValue(cmd)}
                className="text-xs px-3 py-1 rounded-full border border-slate-700 bg-slate-800/50 hover:bg-slate-700 text-slate-300 transition"
              >
                {cmd}
              </button>
            ))}
          </div>
          <div className="flex gap-3 items-end">
            <button className="p-2.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-400 transition">
              <Paperclip className="w-5 h-5" />
            </button>
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask your coach..."
              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
              rows="2"
            />
            <button
              onClick={handleSendMessage}
              disabled={isTyping || !inputValue.trim()}
              className="p-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white transition"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // ─── RENDER: ANALYTICS VIEW ───────────────────────────────────────────────
  const renderAnalyticsView = () => (
    <div className="h-full overflow-y-auto p-6 md:p-8 bg-slate-950">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-500">Analytics</p>
          <h1 className="text-2xl font-bold text-slate-100 mt-1">{activeCourse.title}</h1>
        </div>
        <button
          onClick={() => setCurrentView("courses")}
          className="rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 px-4 py-2 text-sm text-slate-300 transition"
        >
          Back to Courses
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
          <p className="text-xs uppercase tracking-widest text-slate-500">Mastery</p>
          <p className="text-3xl font-bold text-emerald-400 mt-2">{activeCourse.mastery}%</p>
        </div>

        <div
          onClick={handleNavigateToConcept}
          className="cursor-pointer rounded-xl border border-slate-800 bg-slate-900/60 p-6 hover:border-indigo-500/50 hover:bg-slate-900 transition"
        >
          <p className="text-xs uppercase tracking-widest text-slate-500">Focus</p>
          <p className="text-lg font-bold text-indigo-300 mt-2 hover:text-indigo-200">{activeCourse.current_milestone}</p>
        </div>

        <div
          onClick={handleReviewMode}
          className="cursor-pointer rounded-xl border border-slate-800 bg-slate-900/60 p-6 hover:border-violet-500/50 hover:bg-slate-900 transition"
        >
          <p className="text-xs uppercase tracking-widest text-slate-500">Next Step</p>
          <p className="text-lg font-bold text-violet-300 mt-2 hover:text-violet-200">Revisit weak concepts</p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
        <h3 className="text-lg font-semibold text-slate-100 mb-4">Performance Summary</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm text-slate-400">Total Attempts</p>
            <p className="text-2xl font-bold text-slate-100">{activeCourse.student_profile.total_questions_attempted}</p>
          </div>
          <div>
            <p className="text-sm text-slate-400">Accuracy Rate</p>
            <p className="text-2xl font-bold text-slate-100">{activeCourse.student_profile.accuracy_rate.toFixed(1)}%</p>
          </div>
        </div>
      </div>
    </div>
  );

  // ─── RENDER: DELETE CONFIRMATION ──────────────────────────────────────────
  const renderDeleteModal = () =>
    pendingDelete ? (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur">
        <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
          <p className="text-xs uppercase tracking-widest text-rose-400">Delete Course</p>
          <h3 className="text-xl font-semibold text-slate-100 mt-3">
            Delete "{courses.find((c) => c.id === pendingDelete)?.title}"?
          </h3>
          <p className="text-sm text-slate-400 mt-2">All progress and data will be permanently removed.</p>
          <div className="flex gap-3 mt-6 justify-end">
            <button
              onClick={() => setPendingDelete(null)}
              className="rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 px-4 py-2 text-sm text-slate-300 transition"
            >
              Cancel
            </button>
            <button
              onClick={() => handleDeleteCourse(pendingDelete)}
              className="rounded-lg bg-rose-600 hover:bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    ) : null;

  // ─── RENDER: ADD SUBJECT MODAL ────────────────────────────────────────────
  const renderAddModal = () =>
    showAddModal ? (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur">
        <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-slate-100">Create New Subject</h3>
            <button
              onClick={() => setShowAddModal(false)}
              className="text-slate-500 hover:text-slate-300 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs uppercase tracking-widest text-slate-500 block mb-2">Subject Title</label>
              <input
                type="text"
                value={newSubjectForm.title}
                onChange={(e) => setNewSubjectForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Advanced Neural Networks"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-widest text-slate-500 block mb-2">First Milestone</label>
              <input
                type="text"
                value={newSubjectForm.milestone}
                onChange={(e) => setNewSubjectForm((prev) => ({ ...prev, milestone: e.target.value }))}
                placeholder="e.g., Foundations"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-widest text-slate-500 block mb-2">Syllabus Nodes (comma-separated)</label>
              <textarea
                value={newSubjectForm.syllabus}
                onChange={(e) => setNewSubjectForm((prev) => ({ ...prev, syllabus: e.target.value }))}
                placeholder="e.g., Concept A, Concept B, Concept C"
                rows="4"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6 justify-end">
            <button
              onClick={() => setShowAddModal(false)}
              className="rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 px-4 py-2 text-sm text-slate-300 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleAddNewSubject}
              className="rounded-lg bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition"
            >
              Create Subject
            </button>
          </div>
        </div>
      </div>
    ) : null;

  // ─── MAIN RENDER ──────────────────────────────────────────────────────────
  return (
    <div className="h-screen w-screen bg-slate-950 overflow-hidden flex flex-col">
      {currentView === "courses" && renderCoursesView()}
      {currentView === "study" && renderStudyView()}
      {currentView === "analytics" && renderAnalyticsView()}
      {renderDeleteModal()}
      {renderAddModal()}
    </div>
  );
};

export default AdaptiveMicroLearningCoach;
