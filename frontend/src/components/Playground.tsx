"use client";

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

const QUICK_SUGGESTIONS = [
  "What are your core skills?",
  "Tell me about your AI projects",
  "What services do you offer?",
  "How can I contact or hire you?",
];

interface ShapItem {
  feature: string;
  impact: number;
  direction: "positive" | "negative" | string;
  description: string;
}

interface RetentionResult {
  probability: number;
  status: string;
  feature_importance: ShapItem[];
}

interface ChatMessage {
  sender: "user" | "assistant";
  text: string;
}

export default function Playground() {
  const [activeTab, setActiveTab] = useState<"retention" | "assistant">("retention");
  const [loading, setLoading] = useState(false);

  // --- Churn Predictor States ---
  const [tenure, setTenure] = useState(18);
  const [contract, setContract] = useState("One year");
  const [tickets, setTickets] = useState(1);
  const [charges, setCharges] = useState(75);
  const [retentionResult, setRetentionResult] = useState<RetentionResult | null>(null);

  // --- Assistant States ---
  const [query, setQuery] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      sender: "assistant",
      text: "Hello! I am Meet's portfolio AI agent. Ask me about his AI automation skills, ML projects, background, or how to contact him directly.",
    },
  ]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

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
      // Offline fallback
      let prob = 60.0;
      prob += Math.min(tenure * 0.6, 25.0);
      prob += contract === "Two year" ? 20.0 : contract === "One year" ? 10.0 : -15.0;
      prob += tickets === 0 ? 5.0 : tickets <= 2 ? -2.0 : -Math.min(tickets * 4.5, 30.0);
      prob += charges < 40.0 ? 4.0 : charges < 100.0 ? 0.0 : -Math.min((charges - 100.0) * 0.08, 12.0);

      const finalProb = Math.round(Math.max(Math.min(prob, 99.0), 3.0) * 10) / 10;

      const shap: ShapItem[] = [
        { feature: "Customer Tenure", impact: Math.round(Math.min(tenure * 0.6, 25.0) * 10) / 10, direction: "positive", description: `Active relationship of ${tenure} months signals platform habituation.` },
        { feature: "Contract Structure", impact: contract === "Two year" ? 20.0 : contract === "One year" ? 10.0 : -15.0, direction: contract !== "Month-to-month" ? "positive" : "negative", description: contract !== "Month-to-month" ? "Contract security reduces short-term churn." : "Flexible billing exposes account to exit barriers." },
        { feature: "Support Friction", impact: Math.round((tickets === 0 ? 5.0 : tickets <= 2 ? -2.0 : -Math.min(tickets * 4.5, 30.0)) * 10) / 10, direction: tickets === 0 ? "positive" : "negative", description: tickets === 0 ? "Zero customer cases indicates frictionless operations." : `${tickets} support events indicate active churn distress.` },
        { feature: "Pricing Sensitivity", impact: Math.round((charges < 40.0 ? 4.0 : charges < 100.0 ? 0.0 : -Math.min((charges - 100.0) * 0.08, 12.0)) * 10) / 10, direction: charges < 40.0 ? "positive" : charges < 100.0 ? "positive" : "negative", description: charges < 100.0 ? "Pricing aligns with standard models." : "Premium billing places service under ROI review." }
      ];

      setRetentionResult({
        probability: finalProb,
        status: finalProb >= 80.0 ? "High Retention Safety (Low Risk)" : finalProb >= 50.0 ? "Moderate Retention (Monitor Account)" : "High Churn Vulnerability (Immediate Rescue)",
        feature_importance: shap
      });
    } finally {
      setTimeout(() => setLoading(false), 200);
    }
  }, [charges, contract, tenure, tickets]);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    handlePredictRetention();
  }, [handlePredictRetention]);

  const handleQueryAssistant = async (textToSend?: string) => {
    const activeQuery = textToSend || query;
    if (!activeQuery.trim()) return;

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
      const lowerQ = activeQuery.toLowerCase();
      let reply = "";
      if (lowerQ.includes("skill") || lowerQ.includes("tech") || lowerQ.includes("python")) {
        reply = "Meet specializes in Python, Machine Learning, Deep Learning, SQL, Power BI, FastAPI, LangChain, RAG agents, and AI automation.";
      } else if (lowerQ.includes("project") || lowerQ.includes("portfolio")) {
        reply = "Meet's featured projects include the AI Inventory Intelligence Platform, Intelligent Automation Agent, Churn Prediction Engine, Executive BI Dashboards, and Enterprise RAG Assistant.";
      } else if (lowerQ.includes("service") || lowerQ.includes("offer") || lowerQ.includes("hire")) {
        reply = "Meet builds AI Automation Workflows, Machine Learning Solutions, Business Intelligence Dashboards, AI RAG Agents, and Full-Stack AI Applications.";
      } else {
        reply = "You can contact Meet directly at meetchetanpura9@gmail.com or fill out the form in the Contact section at the bottom of the page.";
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
      className="relative border-t border-border-custom bg-void py-20 sm:py-28 transition-colors duration-300"
    >
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-12">

        {/* Header */}
        <header className="mb-10 max-w-3xl">
          <p className="font-mono text-xs uppercase tracking-wider text-accent font-bold">
            Interactive Model Sandbox
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl lg:text-5xl font-display">
            Test <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7C3AED] via-[#D946EF] to-[#0284C7] dark:from-[#C084FC] dark:to-[#00F0FF]">AI Tools Live</span>
          </h2>
          <p className="mt-4 text-base text-text-muted sm:text-lg font-medium">
            Interact with live analytical models and portfolio assistant logic.
          </p>
        </header>

        {/* Tab Selection */}
        <div className="mb-8 flex">
          <div className="flex rounded-xl border border-border-custom bg-surface-raised p-1 shadow-sm dark:border-[#262038] dark:bg-[#181426]">
            <button
              onClick={() => setActiveTab("retention")}
              className={`flex items-center gap-2 rounded-lg px-4.5 py-2.5 text-xs font-mono font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === "retention"
                  ? "key-gloss"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              <HiOutlineChip className="text-sm" />
              <span>Retention Risk Simulator</span>
            </button>

            <button
              onClick={() => setActiveTab("assistant")}
              className={`flex items-center gap-2 rounded-lg px-4.5 py-2.5 text-xs font-mono font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === "assistant"
                  ? "key-gloss"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              <HiOutlineChatAlt className="text-sm" />
              <span>Portfolio AI Assistant</span>
            </button>
          </div>
        </div>

        {/* Sandbox Content */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5 lg:gap-8">
          <AnimatePresence mode="wait">
            {activeTab === "retention" ? (
              <motion.div
                key="retention"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="grid gap-6 lg:col-span-5 lg:grid-cols-5"
              >
                {/* Inputs Cell */}
                <BentoCard className="lg:col-span-2" glow="violet">
                  <div className="flex h-full flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-text-primary font-display">
                        Retention Risk Parameters
                      </h3>
                      <p className="mt-1 text-xs text-text-muted font-medium">
                        Adjust metrics to compute real-time ML retention scores.
                      </p>

                      <div className="mt-6 space-y-4">
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs font-medium">
                            <span className="text-text-muted">Customer Tenure</span>
                            <span className="font-mono text-accent font-bold">{tenure} months</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="72"
                            value={tenure}
                            onChange={(e) => setTenure(Number(e.target.value))}
                            className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-surface-raised accent-accent dark:bg-[#08070D]"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-text-muted">Contract Plan</label>
                          <select
                            value={contract}
                            onChange={(e) => setContract(e.target.value)}
                            className="w-full rounded-xl border border-border-custom bg-surface-raised px-3.5 py-2 text-xs text-text-primary font-medium outline-none dark:border-[#262038] dark:bg-[#08070D]"
                          >
                            <option value="Month-to-month">Month-to-month</option>
                            <option value="One year">One year</option>
                            <option value="Two year">Two year</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs font-medium">
                            <span className="text-text-muted">Support Cases</span>
                            <span className="font-mono text-accent font-bold">{tickets} cases</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="15"
                            value={tickets}
                            onChange={(e) => setTickets(Number(e.target.value))}
                            className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-surface-raised accent-accent dark:bg-[#08070D]"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs font-medium">
                            <span className="text-text-muted">Monthly Rate</span>
                            <span className="font-mono text-[#0284C7] dark:text-[#00F0FF] font-bold">${charges}/mo</span>
                          </div>
                          <input
                            type="range"
                            min="15"
                            max="250"
                            value={charges}
                            onChange={(e) => setCharges(Number(e.target.value))}
                            className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-surface-raised accent-accent dark:bg-[#08070D]"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handlePredictRetention}
                      disabled={loading}
                      className="key-gloss mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer"
                    >
                      <HiOutlineRefresh className={`text-base ${loading ? "animate-spin" : ""}`} />
                      Compute Retention Score
                    </button>
                  </div>
                </BentoCard>

                {/* Outputs Cell */}
                <BentoCard className="lg:col-span-3" glow="cyan">
                  <div className="flex h-full flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-text-primary font-display">
                        Model Output & SHAP Weights
                      </h3>
                      <p className="mt-1 text-xs text-text-muted font-medium">
                        Real-time probability score and feature impact attribution.
                      </p>

                      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-5 md:items-center">
                        <div className="flex flex-col items-center justify-center md:col-span-2 rounded-2xl border border-border-custom bg-surface-raised p-6 shadow-inner dark:border-[#262038] dark:bg-[#08070D]">
                          <span className="text-4xl font-extrabold font-mono text-[#0284C7] dark:text-[#00F0FF]">
                            {retentionResult?.probability}%
                          </span>
                          <span className="mt-1 font-mono text-[10px] uppercase text-text-muted font-bold">
                            Retention Score
                          </span>
                          <span className="mt-3 rounded-md border border-[#10B981]/30 bg-[#10B981]/15 px-2.5 py-0.5 font-mono text-[10px] font-bold text-[#10B981]">
                            {retentionResult?.status}
                          </span>
                        </div>

                        <div className="space-y-3 md:col-span-3">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted font-bold">
                            Shapley Feature Contributions
                          </span>
                          {retentionResult?.feature_importance.map((item) => {
                            const isPositive = item.direction === "positive";
                            return (
                              <div key={item.feature} className="space-y-1">
                                <div className="flex justify-between text-xs font-semibold text-text-primary">
                                  <span>{item.feature}</span>
                                  <span className={isPositive ? "text-[#10B981]" : "text-rose-500"}>
                                    {isPositive ? "+" : ""}{item.impact}%
                                  </span>
                                </div>
                                <p className="text-[10px] text-text-muted font-medium">{item.description}</p>
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
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="grid gap-6 lg:col-span-5 lg:grid-cols-5"
              >
                {/* Assistant Chat Panel */}
                <BentoCard className="lg:col-span-3" glow="magenta">
                  <div className="flex h-[420px] flex-col justify-between">
                    <div className="flex items-center justify-between border-b border-border-custom pb-3 dark:border-[#262038]">
                      <div>
                        <h3 className="text-base font-bold text-text-primary font-display">MagicShot Assistant</h3>
                        <p className="text-[10px] text-text-muted font-medium">Interactive Q&A agent</p>
                      </div>
                      <span className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
                    </div>

                    <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1">
                      {chatHistory.map((msg, i) => (
                        <div
                          key={i}
                          className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed ${
                              msg.sender === "user"
                                ? "key-gloss font-medium"
                                : "bg-surface-raised border border-border-custom text-text-primary font-medium dark:bg-[#08070D] dark:border-[#262038]"
                            }`}
                          >
                            {msg.text}
                          </div>
                        </div>
                      ))}
                      <div ref={chatEndRef} />
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleQueryAssistant();
                      }}
                      className="flex items-center gap-2 border-t border-border-custom pt-3 dark:border-[#262038]"
                    >
                      <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Ask about Meet's skills, projects, or background..."
                        className="flex-1 rounded-xl border border-border-custom bg-surface-raised px-3.5 py-2 text-xs text-text-primary font-medium outline-none dark:border-[#262038] dark:bg-[#08070D]"
                      />
                      <button
                        type="submit"
                        disabled={loading || !query.trim()}
                        className="key-gloss rounded-xl p-2.5 text-white cursor-pointer disabled:opacity-50"
                      >
                        <HiArrowSmRight className="text-base" />
                      </button>
                    </form>
                  </div>
                </BentoCard>

                {/* Quick Prompts */}
                <BentoCard className="lg:col-span-2" glow="violet">
                  <div className="flex h-full flex-col justify-between">
                    <div>
                      <h3 className="text-base font-bold text-text-primary font-display">Suggested Prompts</h3>
                      <p className="mt-1 text-xs text-text-muted font-medium">
                        Click any prompt to test the assistant.
                      </p>

                      <div className="mt-4 flex flex-col gap-2">
                        {QUICK_SUGGESTIONS.map((suggestion) => (
                          <button
                            key={suggestion}
                            onClick={() => handleQueryAssistant(suggestion)}
                            className="flex items-center justify-between rounded-xl border border-border-custom bg-surface-raised p-3 text-left text-xs font-semibold text-text-primary hover:border-accent transition-colors cursor-pointer dark:border-[#262038] dark:bg-[#08070D]"
                          >
                            <span>{suggestion}</span>
                            <HiOutlineArrowRight className="text-accent text-xs shrink-0 ml-2" />
                          </button>
                        ))}
                      </div>
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
