import os
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns
from sklearn.decomposition import PCA
import umap


# Set plot aesthetics
sns.set_theme(style="whitegrid", palette="muted")
plt.rcParams.update({
    "font.sans-serif": "Arial",
    "font.family": "sans-serif",
    "figure.titlesize": 16,
    "axes.titlesize": 14,
    "axes.labelsize": 12,
    "xtick.labelsize": 10,
    "ytick.labelsize": 10,
    "figure.autolayout": True
})


def plot_k_evaluation(k_results_df, save_path="results/figures/silhouette_vs_k.png"):
    """
    Plot Silhouette Score and Davies-Bouldin Index vs Number of Clusters (K).
    """
    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    
    fig, ax1 = plt.subplots(figsize=(9, 5))

    color = "tab:blue"
    ax1.set_xlabel("Number of Clusters (K)", fontweight="bold")
    ax1.set_ylabel("Silhouette Score (Higher is Better)", color=color, fontweight="bold")
    line1 = ax1.plot(k_results_df["k"], k_results_df["silhouette"], marker="o", color=color, linewidth=2.5, label="Silhouette Score")
    ax1.tick_params(axis="y", labelcolor=color)
    ax1.grid(True, linestyle="--", alpha=0.6)

    ax2 = ax1.twinx()
    color = "tab:red"
    ax2.set_ylabel("Davies-Bouldin Index (Lower is Better)", color=color, fontweight="bold")
    line2 = ax2.plot(k_results_df["k"], k_results_df["davies_bouldin"], marker="s", linestyle="--", color=color, linewidth=2, label="Davies-Bouldin Index")
    ax2.tick_params(axis="y", labelcolor=color)

    # Title & Legend
    plt.title("Cluster Validation Metrics across K values (TF-IDF Baseline)", pad=15, fontweight="bold")
    lines = line1 + line2
    labels = [l.get_label() for l in lines]
    ax1.legend(lines, labels, loc="upper right")

    plt.tight_layout()
    plt.savefig(save_path, dpi=300, bbox_inches="tight")
    plt.close()
    print(f"Saved: {save_path}")


def plot_umap_clusters(
    X_features,
    labels,
    title="UMAP 2D Cluster Visualization",
    save_path="results/figures/umap_clusters.png",
    cluster_names=None
):
    """
    Project feature matrix into 2D space using UMAP (or PCA fallback) and scatter plot cluster assignments.
    """
    os.makedirs(os.path.dirname(save_path), exist_ok=True)

    # Dense array conversion
    if hasattr(X_features, "toarray"):
        X_dense = X_features.toarray()
    else:
        X_dense = np.array(X_features)

    # Apply UMAP dimensionality reduction
    try:
        reducer = umap.UMAP(n_neighbors=15, min_dist=0.1, n_components=2, random_state=42)
        embedding = reducer.fit_transform(X_dense)
    except Exception:
        # Fallback to PCA if UMAP fails
        reducer = PCA(n_components=2, random_state=42)
        embedding = reducer.fit_transform(X_dense)

    df_plot = pd.DataFrame({
        "UMAP1": embedding[:, 0],
        "UMAP2": embedding[:, 1],
        "Cluster": labels
    })

    plt.figure(figsize=(10, 7))

    unique_labels = sorted(list(set(labels)))
    colors = plt.cm.tab10(np.linspace(0, 1, max(len(unique_labels), 10)))

    for idx, label in enumerate(unique_labels):
        sub_df = df_plot[df_plot["Cluster"] == label]
        if label == -1:
            # Noise / Outliers in HDBSCAN
            plt.scatter(
                sub_df["UMAP1"], sub_df["UMAP2"],
                c="gray", label="Outliers / Noise (-1)",
                alpha=0.3, s=20, marker="x"
            )
        else:
            name = cluster_names.get(label, f"Theme {label}") if cluster_names else f"Cluster {label}"
            plt.scatter(
                sub_df["UMAP1"], sub_df["UMAP2"],
                color=colors[idx % len(colors)], label=f"{name} (n={len(sub_df)})",
                alpha=0.8, s=40
            )

    plt.title(title, fontsize=14, fontweight="bold", pad=12)
    plt.xlabel("Dimension 1", fontweight="bold")
    plt.ylabel("Dimension 2", fontweight="bold")
    plt.legend(bbox_to_anchor=(1.05, 1), loc="upper left", title="Theme Clusters")
    plt.grid(True, linestyle="--", alpha=0.5)

    plt.tight_layout()
    plt.savefig(save_path, dpi=300, bbox_inches="tight")
    plt.close()
    print(f"Saved: {save_path}")


def plot_theme_distribution(
    df,
    cluster_col="cluster",
    theme_names=None,
    title="Distribution of Student Feedback Themes",
    save_path="results/figures/theme_distribution.png"
):
    """
    Plot distribution of comments per theme.
    """
    os.makedirs(os.path.dirname(save_path), exist_ok=True)

    counts = df[cluster_col].value_counts().sort_index()

    labels_text = []
    for c_id in counts.index:
        if c_id == -1:
            labels_text.append("Outliers (-1)")
        elif theme_names and c_id in theme_names:
            labels_text.append(f"Theme {c_id}: {theme_names[c_id]}")
        else:
            labels_text.append(f"Theme {c_id}")

    plt.figure(figsize=(10, 5))
    bars = plt.bar(labels_text, counts.values, color=sns.color_palette("viridis", len(counts)))
    plt.title(title, fontweight="bold", fontsize=14, pad=12)
    plt.ylabel("Number of Comments", fontweight="bold")
    plt.xticks(rotation=25, ha="right")
    plt.grid(axis="y", linestyle="--", alpha=0.7)

    # Add count values on top of bars
    for bar in bars:
        height = bar.get_height()
        plt.annotate(f"{height}",
                    xy=(bar.get_x() + bar.get_width() / 2, height),
                    xytext=(0, 3),  # 3 points vertical offset
                    textcoords="offset points",
                    ha="center", va="bottom", fontweight="bold")

    plt.tight_layout()
    plt.savefig(save_path, dpi=300, bbox_inches="tight")
    plt.close()
    print(f"Saved: {save_path}")
