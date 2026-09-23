import os
import pandas as pd
import numpy as np

from src.preprocessing import preprocess_dataframe
from src.features import create_tfidf_features, create_embeddings
from src.clustering import run_kmeans, run_hdbscan, extract_cluster_keywords
from src.evaluation import evaluate_clustering
from src.visualization import (
    plot_k_evaluation,
    plot_umap_clusters,
    plot_theme_distribution
)


def main():
    print("=" * 70)
    print("      STUDENT FEEDBACK THEME DISCOVERY USING UNSUPERVISED NLP")
    print("=" * 70)

    # Ensure output directories exist
    os.makedirs("data/processed", exist_ok=True)
    os.makedirs("results/tables", exist_ok=True)
    os.makedirs("results/figures", exist_ok=True)

    # ============================================================
    # 1. LOAD DATASET
    # ============================================================
    raw_data_path = "data/raw/Student_Feedback.csv"
    print(f"\n[1] Loading dataset from: {raw_data_path}")
    
    df_raw = pd.read_csv(raw_data_path, encoding="latin1")
    print(f"    - Raw Dataset Shape: {df_raw.shape}")
    print(f"    - Raw Columns: {df_raw.columns.tolist()}")

    # ============================================================
    # 2. PREPROCESSING & CLEANING
    # ============================================================
    print("\n[2] Executing NLP Text Preprocessing Pipeline...")
    df = preprocess_dataframe(df_raw)
    
    print(f"    - Preprocessed Dataset Shape: {df.shape}")
    print("    - Sentiments column explicitly excluded: True")
    print(f"    - Mean Word Count: {df['word_count'].mean():.2f} words/comment")
    print(f"    - Mean Character Count: {df['char_count'].mean():.2f} chars/comment")

    # Save cleaned dataframe
    cleaned_csv_path = "data/processed/cleaned_student_feedback.csv"
    df.to_csv(cleaned_csv_path, index=False)
    print(f"    -> Saved preprocessed data to: {cleaned_csv_path}")

    texts = df["clean_text"].tolist()

    # ============================================================
    # 3. FEATURE REPRESENTATION
    # ============================================================
    print("\n[3] Extracting Text Feature Representations...")
    
    # 3.1 Sparse TF-IDF Vectorization
    print("    - Computing TF-IDF (1-2 N-grams, max 3000 features)...")
    X_tfidf, tfidf_vectorizer = create_tfidf_features(texts, max_features=3000, ngram_range=(1, 2), min_df=2)
    print(f"      TF-IDF Matrix Shape: {X_tfidf.shape}")

    # 3.2 Dense SBERT Sentence Embeddings
    print("    - Generating Dense SBERT Embeddings (all-MiniLM-L6-v2)...")
    X_sbert = create_embeddings(texts, model_name="all-MiniLM-L6-v2", normalize_embeddings=True)
    print(f"      SBERT Embedding Shape: {X_sbert.shape}")

    # ============================================================
    # 4. BASELINE MODEL: TF-IDF + K-MEANS
    # ============================================================
    print("\n[4] Running Baseline Model: TF-IDF + K-Means...")
    
    # Grid search for optimal K
    k_range = range(2, 11)
    k_eval_results = []

    for k in k_range:
        kmeans_tmp, labels_tmp = run_kmeans(X_tfidf, n_clusters=k)
        metrics_tmp = evaluate_clustering(X_tfidf, labels_tmp)
        k_eval_results.append({
            "k": k,
            "silhouette": metrics_tmp["silhouette"],
            "davies_bouldin": metrics_tmp["davies_bouldin"],
            "calinski_harabasz": metrics_tmp["calinski_harabasz"]
        })

    k_results_df = pd.DataFrame(k_eval_results)
    k_eval_csv = "results/tables/kmeans_k_evaluation.csv"
    k_results_df.to_csv(k_eval_csv, index=False)
    print(f"    -> Saved K-evaluation table to: {k_eval_csv}")

    # Plot K-evaluation curve
    plot_k_evaluation(k_results_df, save_path="results/figures/silhouette_vs_k.png")

    # Select best K based on Silhouette Score
    best_k = int(k_results_df.loc[k_results_df["silhouette"].idxmax(), "k"])
    print(f"    - Selected Optimal K (by max Silhouette Score): K = {best_k}")

    # Fit final TF-IDF K-Means model
    model_tfidf_km, labels_tfidf_km = run_kmeans(X_tfidf, n_clusters=best_k)
    metrics_tfidf_km = evaluate_clustering(X_tfidf, labels_tfidf_km)
    df["cluster_tfidf_kmeans"] = labels_tfidf_km

    # Extract keywords for Baseline
    keywords_tfidf_km = extract_cluster_keywords(df["clean_text"], labels_tfidf_km, top_n=8)

    # Plot Baseline UMAP & Theme Distribution
    plot_umap_clusters(
        X_tfidf, labels_tfidf_km,
        title=f"Baseline: TF-IDF + K-Means (K={best_k}) UMAP Projection",
        save_path="results/figures/umap_clusters_tfidf.png"
    )
    plot_theme_distribution(
        df, cluster_col="cluster_tfidf_kmeans",
        title=f"Baseline: TF-IDF + K-Means (K={best_k}) Theme Distribution",
        save_path="results/figures/theme_distribution_tfidf.png"
    )

    # ============================================================
    # 5. IMPROVED MODEL 1: SBERT EMBEDDINGS + K-MEANS
    # ============================================================
    print("\n[5] Running Improved Model 1: SBERT Embeddings + K-Means...")
    
    model_sbert_km, labels_sbert_km = run_kmeans(X_sbert, n_clusters=best_k)
    metrics_sbert_km = evaluate_clustering(X_sbert, labels_sbert_km)
    df["cluster_sbert_kmeans"] = labels_sbert_km

    # Extract keywords for Improved Model 1
    keywords_sbert_km = extract_cluster_keywords(df["clean_text"], labels_sbert_km, top_n=8)

    # Plot Improved Model 1 UMAP & Theme Distribution
    plot_umap_clusters(
        X_sbert, labels_sbert_km,
        title=f"Improved Model 1: SBERT + K-Means (K={best_k}) UMAP Projection",
        save_path="results/figures/umap_clusters_sbert_kmeans.png"
    )
    plot_theme_distribution(
        df, cluster_col="cluster_sbert_kmeans",
        title=f"Improved Model 1: SBERT + K-Means (K={best_k}) Theme Distribution",
        save_path="results/figures/theme_distribution_sbert_kmeans.png"
    )

    # ============================================================
    # 6. IMPROVED MODEL 2: SBERT EMBEDDINGS + HDBSCAN
    # ============================================================
    print("\n[6] Running Improved Model 2: SBERT Embeddings + HDBSCAN...")
    
    model_sbert_hdb, labels_sbert_hdb = run_hdbscan(X_sbert, min_cluster_size=15, min_samples=3, use_umap=True)
    metrics_sbert_hdb = evaluate_clustering(X_sbert, labels_sbert_hdb)
    df["cluster_sbert_hdbscan"] = labels_sbert_hdb

    # Extract keywords for HDBSCAN
    keywords_sbert_hdb = extract_cluster_keywords(df["clean_text"], labels_sbert_hdb, top_n=8)

    # Plot HDBSCAN UMAP & Theme Distribution
    plot_umap_clusters(
        X_sbert, labels_sbert_hdb,
        title=f"Improved Model 2: SBERT + HDBSCAN UMAP Projection (Clusters={metrics_sbert_hdb['n_clusters']})",
        save_path="results/figures/umap_clusters_sbert_hdbscan.png"
    )
    plot_theme_distribution(
        df, cluster_col="cluster_sbert_hdbscan",
        title=f"Improved Model 2: SBERT + HDBSCAN Theme Distribution (Noise={metrics_sbert_hdb['noise_ratio']*100:.1f}%)",
        save_path="results/figures/theme_distribution_sbert_hdbscan.png"
    )

    # ============================================================
    # 7. COMPARATIVE EVALUATION & METRIC EXPORT
    # ============================================================
    print("\n[7] Generating Comparative Model Evaluation Table...")

    comparative_data = [
        {
            "Model": "Baseline: TF-IDF + K-Means",
            "Clusters (K)": metrics_tfidf_km["n_clusters"],
            "Silhouette Score": f"{metrics_tfidf_km['silhouette']:.4f}",
            "Davies-Bouldin Index": f"{metrics_tfidf_km['davies_bouldin']:.4f}",
            "Calinski-Harabasz Score": f"{metrics_tfidf_km['calinski_harabasz']:.2f}",
            "Intra-Cluster Cosine Sim": f"{metrics_tfidf_km['mean_intra_cosine_sim']:.4f}",
            "Noise Ratio (%)": "0.0%"
        },
        {
            "Model": "Improved 1: SBERT + K-Means",
            "Clusters (K)": metrics_sbert_km["n_clusters"],
            "Silhouette Score": f"{metrics_sbert_km['silhouette']:.4f}",
            "Davies-Bouldin Index": f"{metrics_sbert_km['davies_bouldin']:.4f}",
            "Calinski-Harabasz Score": f"{metrics_sbert_km['calinski_harabasz']:.2f}",
            "Intra-Cluster Cosine Sim": f"{metrics_sbert_km['mean_intra_cosine_sim']:.4f}",
            "Noise Ratio (%)": "0.0%"
        },
        {
            "Model": "Improved 2: SBERT + HDBSCAN",
            "Clusters (K)": metrics_sbert_hdb["n_clusters"],
            "Silhouette Score": f"{metrics_sbert_hdb['silhouette']:.4f}" if metrics_sbert_hdb['silhouette'] else "N/A",
            "Davies-Bouldin Index": f"{metrics_sbert_hdb['davies_bouldin']:.4f}" if metrics_sbert_hdb['davies_bouldin'] else "N/A",
            "Calinski-Harabasz Score": f"{metrics_sbert_hdb['calinski_harabasz']:.2f}" if metrics_sbert_hdb['calinski_harabasz'] else "N/A",
            "Intra-Cluster Cosine Sim": f"{metrics_sbert_hdb['mean_intra_cosine_sim']:.4f}" if metrics_sbert_hdb['mean_intra_cosine_sim'] else "N/A",
            "Noise Ratio (%)": f"{metrics_sbert_hdb['noise_ratio']*100:.1f}%"
        }
    ]

    comp_df = pd.DataFrame(comparative_data)
    comp_csv_path = "results/tables/comparative_model_evaluation.csv"
    comp_df.to_csv(comp_csv_path, index=False)
    
    print("\n--- COMPARATIVE RESULTS TABLE ---")
    print(comp_df.to_string(index=False))
    print(f"\n    -> Saved comparative table to: {comp_csv_path}")

    # ============================================================
    # 8. THEME KEYWORDS SUMMARY EXPORT
    # ============================================================
    print("\n[8] Exporting Theme Keywords & Exemplar Feedback Quotes...")

    theme_rows = []
    for model_name, kw_dict, label_col in [
        ("TF-IDF + K-Means", keywords_tfidf_km, "cluster_tfidf_kmeans"),
        ("SBERT + K-Means", keywords_sbert_km, "cluster_sbert_kmeans"),
        ("SBERT + HDBSCAN", keywords_sbert_hdb, "cluster_sbert_hdbscan")
    ]:
        for cluster_id, top_words in kw_dict.items():
            cluster_comments = df[df[label_col] == cluster_id]["original_text"].tolist()
            sample_quote = cluster_comments[0] if cluster_comments else ""
            theme_rows.append({
                "Model": model_name,
                "Cluster_ID": cluster_id,
                "Count": len(cluster_comments),
                "Top_Keywords": ", ".join(top_words),
                "Sample_Quote": sample_quote[:120] + "..." if len(sample_quote) > 120 else sample_quote
            })

    theme_df = pd.DataFrame(theme_rows)
    theme_csv_path = "results/tables/theme_keywords_summary.csv"
    theme_df.to_csv(theme_csv_path, index=False)
    print(f"    -> Saved theme keywords summary to: {theme_csv_path}")

    # Save final output dataframe with all clusters
    final_data_path = "data/processed/final_student_feedback_clusters.csv"
    df.to_csv(final_data_path, index=False)
    print(f"    -> Saved final dataset with cluster assignments to: {final_data_path}")

    print("\n" + "=" * 70)
    print("         SUCCESS: ALL DATA & FIGURES SAVED TO RESULTS/ & DATA/")
    print("=" * 70)


if __name__ == "__main__":
    main()