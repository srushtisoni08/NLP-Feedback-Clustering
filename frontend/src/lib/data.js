import summary from "../data/summary.json";
import themes from "../data/themes.json";
import comparison from "../data/comparison.json";
import comments from "../data/comments.json";

export { summary, themes, comparison, comments };

// One fixed color per cluster id (consistent across every chart/page)
export const THEME_COLORS = {
  3: "#4f46e5", // Student Support
  5: "#0ea5e9", // Classroom Management
  4: "#14b8a6", // Conduct & Fairness
  0: "#f59e0b", // Teaching Methodology
  6: "#ec4899", // Subject Knowledge
  2: "#8b5cf6", // Interpersonal Approach
  1: "#64748b", // Technical Learning
};

export const SENTIMENT = {
  positive: { label: "Positive", color: "#10b981", soft: "#d1fae5" },
  negative: { label: "Negative", color: "#ef4444", soft: "#fee2e2" },
  neutral: { label: "Neutral", color: "#94a3b8", soft: "#e2e8f0" },
};

export const MODEL_COLORS = { tfidf: "#94a3b8", sbert: "#4f46e5" };

export const themeByCluster = Object.fromEntries(themes.map((t) => [t.cluster, t]));
export const fmt = (n) => n.toLocaleString("en-US");
export const fmtScore = (n, d = 4) => n.toFixed(d);