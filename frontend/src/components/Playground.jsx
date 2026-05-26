import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlineChip,
  HiOutlineChatAlt,
  HiOutlineRefresh,
  HiArrowSmRight,
  HiOutlineArrowRight,
} from "react-icons/hi";
import { api } from "../lib/api";
import BentoCard from "./BentoCard";
import Revealer from "./motion/Revealer";

// Standard questions visitors can click to prompt the assistant
const QUICK_SUGGESTIONS = [
  "What are your core skills?",
  "Tell me about your AI projects",
  "What services do you offer?",
  "How can I contact or hire you?",
];

export default function Playground() {
  const [activeTab, setActiveTab] = useState("retention"); // "retention" or "assistant"
  const [loading, setLoading] = useState(false);

  // --- Churn Predictor States ---
  const [tenure, setTenure] = useState(18);
  const [contract, setContract] = useState("One year");
  const [tickets, setTickets] = useState(1);
  const [charges, setCharges] = useState(75);
  const [retentionResult, setRetentionResult] = useState(null);

  // --- Assistant States ---
  const [query, setQuery] = useState("");
  const [chatHistory, setChatHistory] = useState([
    {
      sender: "assistant",
      text: "Hello! I am Meet's interactive portfolio agent. Ask me about his AI automation skills, projects, services, education, or how to contact him directly.",
    },
  ]);
  const chatEndRef = useRef(null);
  const initializedRef = useRef(false);

  // Scroll to bottom of chat history when it updates
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  // --- Churn Prediction Axios/Local Call ---
  const handlePredictRetention = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.post("/playground/predict-retention", {
        tenure_months: Number(tenure),
        contract_type: contract,
        support_tickets: Number(tickets),
        monthly_charges: Number(charges),
      });
      setRetentionResult(response.data);
    } catch {
      // Offline fallback in case backend is not running - matches backend logic exactly!
      let prob = 60.0;
      prob += Math.min(tenure * 0.6, 25.0);
      prob += contract === "Two year" ? 20.0 : contract === "One year" ? 10.0 : -15.0;
      prob += tickets === 0 ? 5.0 : tickets <= 2 ? -2.0 : -Math.min(tickets * 4.5, 30.0);
      prob += charges < 40.0 ? 4.0 : charges < 100.0 ? 0.0 : -Math.min((charges - 100.0) * 0.08, 12.0);
      
      const finalProb = Math.round(Math.max(Math.min(prob, 99.0), 3.0) * 10) / 10;
      
      const shap = [
        { feature: "Customer Tenure", impact: Math.min(tenure * 0.6, 25.0), direction: "positive", description: `Active relationship of ${tenure} months signals strong platform habituation.` },
        { feature: "Contract Structure", impact: contract === "Two year" ? 20.0 : contract === "One year" ? 10.0 : -15.0, direction: contract !== "Month-to-month" ? "positive" : "negative", description: contract !== "Month-to-month" ? "Contract security reduces short-term churn." : "Flexible billing exposes account to exit barriers." },
        { feature: "Support Case Friction", impact: tickets === 0 ? 5.0 : tickets <= 2 ? -2.0 : -Math.min(tickets * 4.5, 30.0), direction: tickets === 0 ? "positive" : "negative", description: tickets === 0 ? "Zero customer cases indicates frictionless operations." : `${tickets} support events indicate active churn distress.` },
        { feature: "Pricing Sensitivity", impact: charges < 40.0 ? 4.0 : charges < 100.0 ? 0.0 : -Math.min((charges - 100.0) * 0.08, 12.0), direction: charges < 40.0 ? "positive" : charges < 100.0 ? "positive" : "negative", description: charges < 100.0 ? "Pricing aligns with standard models." : "Premium billing places service under ROI review." }
      ];

      setRetentionResult({
        probability: finalProb,
        status: finalProb >= 80.0 ? "High Retention Safety (Low Risk)" : finalProb >= 50.0 ? "Moderate Retention (Monitor Account)" : "High Churn Vulnerability (Immediate Rescue)",
        feature_importance: shap
      });
    } finally {
      setTimeout(() => setLoading(false), 300); // Add micro-delay for smooth layout transition
    }
  }, [charges, contract, tenure, tickets]);

  // Run initial retention calculation on load
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    handlePredictRetention();
  }, [handlePredictRetention]);

  // --- Assistant Axios/Local Call ---
  const handleQueryAssistant = async (textToSend) => {
    const activeQuery = textToSend || query;
    if (!activeQuery.trim()) return;

    // Add user query to chat history
    setChatHistory((prev) => [...prev, { sender: "user", text: activeQuery }]);
    setQuery("");
    setLoading(true);

    try {
      const response = await api.post("/playground/query-assistant", {
        query: activeQuery,
      });
      setChatHistory((prev) => [
        ...prev,
        { sender: "assistant", text: response.data.answer },
      ]);
    } catch {
      // Offline fallback in case backend is not running - parses standard answers
      const lowerQ = activeQuery.toLowerCase();
      let reply = "";
      if (lowerQ.includes("skill") || lowerQ.includes("tech") || lowerQ.includes("python")) {
        reply = "Meet specializes in **Python, Machine Learning, Deep Learning, SQL, Power BI, Business Intelligence, AI Automation, API integration, data pipelines, predictive analytics, and dashboard development**.";
      } else if (lowerQ.includes("project") || lowerQ.includes("portfolio")) {
        reply = "Meet's featured projects are:\n1. **AI Business Analytics Dashboard**: Power BI, SQL, and Python analytics for KPIs and forecasting.\n2. **Intelligent Automation System**: Python workflow automation for operational efficiency.\n3. **Machine Learning Prediction Model**: Scikit-learn and TensorFlow models for business forecasting.\n4. **AI-Powered Data Processing Pipeline**: Automated data cleaning, transformation, and visualization.";
      } else if (lowerQ.includes("service") || lowerQ.includes("offer") || lowerQ.includes("hire")) {
        reply = "Meet offers **AI Automation, Machine Learning Solutions, Business Intelligence Dashboards, Data Analytics, Deep Learning Applications, and Custom AI Tools** for business automation and smarter decision-making.";
      } else if (lowerQ.includes("degree") || lowerQ.includes("education")) {
        reply = "Meet's education details are shown in the About section. His current focus is AI, automation engineering, data science, and business intelligence.";
      } else {
        reply = "You can contact Meet directly at **meetchetanpura9@gmail.com** or fill out the form in the **Let's Connect** section at the bottom of the page.";
      }

      setChatHistory((prev) => [
        ...prev,
        { sender: "assistant", text: reply },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Revealer
      id="playground"
      className="relative overflow-hidden border-t border-white/5 bg-surface py-20 sm:py-28"
    >
      {/* Background Orbs */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute left-1/4 top-1/4 h-[380px] w-[380px] rounded-full bg-violet-600/5 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 h-[350px] w-[350px] rounded-full bg-cyan-600/5 blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-12">
        <header className="mb-12 max-w-3xl">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-cyan-400 sm:text-sm">
            Interactive Sandbox
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl font-display">
            Test the{" "}
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
              AI systems
            </span>{" "}
            live
          </h2>
          <p className="mt-4 text-base text-gray-400 sm:text-lg">
            Interact with analytical models and portfolio assistant logic that reflect
            Meet&apos;s AI automation, analytics, and intelligent system capabilities.
          </p>
        </header>

        {/* Tab Selection */}
        <div className="mb-8 flex justify-center sm:justify-start">
          <div className="relative flex rounded-xl border border-white/5 bg-white/[0.03] p-1 backdrop-blur-md">
            <button
              onClick={() => setActiveTab("retention")}
              className={`relative flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors duration-300 sm:text-sm ${
                activeTab === "retention" ? "text-white" : "text-gray-400 hover:text-gray-200"
              }`}
            >
              {activeTab === "retention" && (
                <motion.div
                  layoutId="activeTabBg"
                  className="absolute inset-0 rounded-lg bg-gradient-to-r from-violet-600/60 to-fuchsia-600/40"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <HiOutlineChip className="relative z-10 text-sm sm:text-base" />
              <span className="relative z-10">Retention Predictor</span>
            </button>

            <button
              onClick={() => setActiveTab("assistant")}
              className={`relative flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors duration-300 sm:text-sm ${
                activeTab === "assistant" ? "text-white" : "text-gray-400 hover:text-gray-200"
              }`}
            >
              {activeTab === "assistant" && (
                <motion.div
                  layoutId="activeTabBg"
                  className="absolute inset-0 rounded-lg bg-gradient-to-r from-fuchsia-600/50 to-cyan-600/50"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <HiOutlineChatAlt className="relative z-10 text-sm sm:text-base" />
              <span className="relative z-10">AI Assistant</span>
            </button>
          </div>
        </div>

        {/* Dynamic Sandbox Display */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5 lg:gap-8">
          <AnimatePresence mode="wait">
            {activeTab === "retention" ? (
              <motion.div
                key="retention"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4 }}
                className="grid gap-6 lg:col-span-5 lg:grid-cols-5"
              >
                {/* Inputs Bento Cell */}
                <BentoCard className="lg:col-span-2" glow="violet">
                  <div className="flex h-full flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white sm:text-xl">
                        Retention Simulator
                      </h3>
                      <p className="mt-1 text-xs text-gray-500">
                        Adjust parameters to evaluate real-time churn metrics.
                      </p>

                      <div className="mt-6 space-y-5">
                        {/* Sliders and Dropdowns */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs font-medium">
                            <span className="text-gray-300">Customer Tenure</span>
                            <span className="text-violet-300">{tenure} months</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="72"
                            value={tenure}
                            onChange={(e) => setTenure(Number(e.target.value))}
                            className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-white/10 accent-violet-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-medium text-gray-300">Contract Plan</label>
                          <select
                            value={contract}
                            onChange={(e) => setContract(e.target.value)}
                            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-gray-300 outline-none backdrop-blur-md focus:border-violet-500/50"
                          >
                            <option value="Month-to-month" className="bg-surface">Month-to-month</option>
                            <option value="One year" className="bg-surface">One year</option>
                            <option value="Two year" className="bg-surface">Two year</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-xs font-medium">
                            <span className="text-gray-300">Support Tickets (Last 30d)</span>
                            <span className="text-fuchsia-300">{tickets} tickets</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="15"
                            value={tickets}
                            onChange={(e) => setTickets(Number(e.target.value))}
                            className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-white/10 accent-fuchsia-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-xs font-medium">
                            <span className="text-gray-300">Monthly billing rate</span>
                            <span className="text-cyan-300">${charges}/mo</span>
                          </div>
                          <input
                            type="range"
                            min="15"
                            max="250"
                            value={charges}
                            onChange={(e) => setCharges(Number(e.target.value))}
                            className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-white/10 accent-cyan-500"
                          />
                        </div>
                      </div>
                    </div>

                    <motion.button
                      onClick={handlePredictRetention}
                      disabled={loading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl border border-violet-500/30 bg-violet-600/20 py-3 text-sm font-semibold text-violet-200 shadow-[0_0_24px_rgba(139,92,246,0.15)] hover:bg-violet-600/30"
                    >
                      <HiOutlineRefresh className={`text-base ${loading ? "animate-spin" : ""}`} />
                      Compute Decision Score
                    </motion.button>
                  </div>
                </BentoCard>

                {/* Outputs Bento Cell */}
                <BentoCard className="lg:col-span-3" glow="cyan">
                  <div className="flex h-full flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white sm:text-xl">
                        AI Output & Explainability
                      </h3>
                      <p className="mt-1 text-xs text-gray-500">
                        Computed model predictions and Shapley Feature Importance weights.
                      </p>

                      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-5 md:items-center">
                        {/* Radial Gauge */}
                        <div className="flex flex-col items-center justify-center md:col-span-2">
                          <div className="relative flex h-36 w-36 items-center justify-center">
                            {/* Inner ambient shadow circle */}
                            <div className="absolute h-28 w-28 rounded-full bg-cyan-600/5 blur-md" />
                            
                            {/* Radial Track SVG */}
                            <svg className="absolute top-0 left-0 h-full w-full -rotate-90">
                              <circle
                                cx="72"
                                cy="72"
                                r="56"
                                className="fill-transparent stroke-white/[0.04] stroke-[10]"
                              />
                              {retentionResult && (
                                <motion.circle
                                  cx="72"
                                  cy="72"
                                  r="56"
                                  className="fill-transparent stroke-url(#violetCyanGrad) stroke-[10] [stroke-dasharray:351.8] [stroke-linecap:round]"
                                  initial={{ strokeDashoffset: 351.8 }}
                                  animate={{
                                    strokeDashoffset: 351.8 - (351.8 * (retentionResult.probability || 0)) / 100,
                                  }}
                                  transition={{ duration: 0.8, ease: "easeOut" }}
                                />
                              )}
                              <defs>
                                <linearGradient id="violetCyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                  <stop offset="0%" stopColor="#8B5CF6" />
                                  <stop offset="100%" stopColor="#22D3EE" />
                                </linearGradient>
                              </defs>
                            </svg>

                            <div className="relative text-center">
                              {loading ? (
                                <span className="h-6 w-6 border-2 border-cyan-400 border-t-transparent animate-spin rounded-full inline-block" />
                              ) : (
                                <>
                                  <span className="text-3xl font-bold bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent">
                                    {retentionResult?.probability}%
                                  </span>
                                  <span className="block text-[9px] uppercase tracking-widest text-gray-500 font-medium mt-1">
                                    Retention
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="mt-4 text-center">
                            <span className="inline-flex rounded-lg border border-white/5 bg-white/[0.02] px-3 py-1 text-xs text-cyan-300 font-medium">
                              {retentionResult?.status}
                            </span>
                          </div>
                        </div>

                        {/* SHAP Chart */}
                        <div className="space-y-4 md:col-span-3">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 block mb-1">
                            Shapley Feature Weights
                          </span>
                          {retentionResult?.feature_importance.map((item) => {
                            const isPositive = item.direction === "positive";
                            const barPct = Math.min((Math.abs(item.impact) / 30) * 100, 100);
                            
                            return (
                              <div key={item.feature} className="space-y-1.5">
                                <div className="flex justify-between text-[11px] font-semibold text-gray-300">
                                  <span>{item.feature}</span>
                                  <span className={isPositive ? "text-emerald-400" : "text-rose-400"}>
                                    {isPositive ? "+" : ""}
                                    {item.impact}%
                                  </span>
                                </div>
                                <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/[0.04]">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${barPct}%` }}
                                    transition={{ duration: 0.6, delay: 0.15 }}
                                    className={`h-full rounded-full ${
                                      isPositive
                                        ? "bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_12px_rgba(52,211,153,0.3)]"
                                        : "bg-gradient-to-r from-rose-500 to-fuchsia-500 shadow-[0_0_12px_rgba(244,63,94,0.3)]"
                                    }`}
                                  />
                                </div>
                                <p className="text-[10px] leading-relaxed text-gray-500">
                                  {item.description}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </BentoCard>
              </motion.div>
            ) : (
              <motion.div
                key="assistant"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4 }}
                className="grid gap-6 lg:col-span-5 lg:grid-cols-5"
              >
                {/* Chat Display Panel */}
                <BentoCard className="lg:col-span-3" glow="fuchsia">
                  <div className="flex h-[420px] flex-col justify-between">
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                      <div>
                        <h3 className="text-base font-bold text-white">AI Portfolio Assistant</h3>
                        <p className="text-[10px] text-gray-500">Local inference / pattern-matching fallback enabled</p>
                      </div>
                      <div className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    </div>

                    {/* Chat Bubble History */}
                    <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 [scrollbar-width:thin]">
                      {chatHistory.map((msg, i) => (
                        <div
                          key={i}
                          className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                              msg.sender === "user"
                                ? "bg-gradient-to-r from-fuchsia-600/30 to-violet-600/25 border border-fuchsia-500/20 text-white rounded-br-none"
                                : "bg-white/[0.04] border border-white/5 text-gray-300 rounded-bl-none"
                            }`}
                          >
                            <p className="whitespace-pre-line">{msg.text}</p>
                          </div>
                        </div>
                      ))}
                      <div ref={chatEndRef} />
                    </div>

                    {/* Chat input form */}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleQueryAssistant();
                      }}
                      className="flex items-center gap-2 border-t border-white/5 pt-3"
                    >
                      <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Ask about skills, experience, projects..."
                        className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs text-white placeholder-gray-500 outline-none backdrop-blur-md focus:border-fuchsia-500/50"
                      />
                      <button
                        type="submit"
                        disabled={loading || !query.trim()}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-fuchsia-600/20 border border-fuchsia-500/30 text-fuchsia-200 transition-shadow hover:shadow-[0_0_16px_rgba(217,70,239,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <HiArrowSmRight className="text-lg" />
                      </button>
                    </form>
                  </div>
                </BentoCard>

                {/* Quick Prompts Panel */}
                <BentoCard className="lg:col-span-2" glow="violet">
                  <div className="flex h-full flex-col justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white">Quick Prompts</h3>
                      <p className="mt-1 text-xs text-gray-500">
                        Select one of these pre-built prompts to test assistant responsiveness.
                      </p>

                      <div className="mt-6 flex flex-col gap-2.5">
                        {QUICK_SUGGESTIONS.map((suggestion) => (
                          <button
                            key={suggestion}
                            onClick={() => handleQueryAssistant(suggestion)}
                            className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-3.5 text-left text-xs font-semibold text-gray-300 transition-all duration-300 hover:border-violet-500/30 hover:bg-white/[0.05] hover:text-white"
                          >
                            <span>{suggestion}</span>
                            <HiOutlineArrowRight className="text-violet-400 text-sm shrink-0 ml-2" />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6 border-t border-white/5 pt-4 text-center">
                      <p className="text-[10px] text-gray-500 font-mono leading-relaxed">
                        Features lightweight dynamic semantic logic. Fully integrated with Axios requests.
                      </p>
                    </div>
                  </div>
                </BentoCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Revealer>
  );
}
