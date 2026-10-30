import json, pandas as pd, numpy as np
from pathlib import Path
from sklearn.feature_extraction.text import TfidfVectorizer

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "frontend" / "src" / "data"
OUT.mkdir(parents=True, exist_ok=True)

SHORT = {
    0: "Teaching Methodology", 1: "Technical Learning", 2: "Interpersonal Approach",
    3: "Student Support", 4: "Conduct & Fairness", 5: "Classroom Management",
    6: "Subject Knowledge",
}
SENT = {0: "negative", 1: "positive", 2: "neutral"}

df = pd.read_csv(ROOT / "data/processed/final_student_feedback_themes.csv")
raw = pd.read_csv(ROOT / "data/raw/Student_Feedback.csv", encoding="latin-1")
cmp_ = pd.read_csv(ROOT / "results/tables/clustering_comparison.csv")
ari = float(pd.read_csv(ROOT / "results/tables/model_agreement.csv").iloc[0, 1])

df = df.reset_index(drop=True)
df["id"] = df.index + 1
df["cluster"] = df["sbert_cluster_7"].astype(int)

# representative comments: closest to cluster centroid in TF-IDF space
vec = TfidfVectorizer(stop_words="english")
X = vec.fit_transform(df["cleaned_text"])
themes = []
for c, g in df.groupby("cluster"):
    cen = np.asarray(X[g.index].mean(axis=0)).ravel()
    sims = X[g.index].dot(cen)
    g = g.assign(sim=np.asarray(sims).ravel())
    g = g[g.comments.str.len().between(25, 140)].sort_values("sim", ascending=False)
    sc = df.loc[df.cluster == c, "sentiments"].value_counts()
    n = int((df.cluster == c).sum())
    themes.append({
        "cluster": int(c), "name": df.loc[df.cluster == c, "theme"].iloc[0],
        "short": SHORT[int(c)], "count": n, "pct": round(n / len(df) * 100, 2),
        "sentiment": {SENT[k]: int(sc.get(k, 0)) for k in (1, 0, 2)},
        "examples": g.comments.head(5).str.strip().tolist(),
    })
themes.sort(key=lambda t: -t["count"])

best = cmp_.loc[cmp_["SBERT Silhouette"].idxmax()]
summary = {
    "rawRows": int(len(raw)), "analyzed": int(len(df)),
    "themes": len(themes), "largest": themes[0]["name"], "largestPct": themes[0]["pct"],
    "largestCount": themes[0]["count"],
    "k7": {"tfidf": float(cmp_[cmp_.K == 7]["TF-IDF Silhouette"].iloc[0]),
           "sbert": float(cmp_[cmp_.K == 7]["SBERT Silhouette"].iloc[0])},
    "bestSbert": {"k": int(best.K), "score": float(best["SBERT Silhouette"])},
    "ari": ari,
    "sentiment": {SENT[k]: int(v) for k, v in df.sentiments.value_counts().items()},
}
comparison = [{"k": int(r.K), "tfidf": float(r["TF-IDF Silhouette"]), "sbert": float(r["SBERT Silhouette"])}
              for _, r in cmp_.iterrows()]
comments = [{"id": int(r.id), "text": r.comments.strip(), "clean": r.cleaned_text,
             "sentiment": SENT[int(r.sentiments)], "cluster": int(r.cluster),
             "theme": r.theme} for r in df.itertuples()]

for name, obj in [
    ("summary", summary),
    ("themes", themes),
    ("comparison", comparison),
    ("comments", comments)
]:
    output_file = OUT / f"{name}.json"

    output_file.write_text(
        json.dumps(obj, ensure_ascii=False, indent=2),
        encoding="utf-8"
    )

    print(f"Generated: {output_file.name}")

print("Successfully generated", len(comments), "comments;", len(themes), "themes")