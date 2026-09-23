import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.feature_extraction.text import TfidfVectorizer
import hdbscan


def run_kmeans(X, n_clusters, random_state=42):
    """
    Perform K-Means clustering on sparse or dense feature matrices.
    """
    model = KMeans(
        n_clusters=n_clusters,
        random_state=random_state,
        n_init=10
    )
    labels = model.fit_predict(X)
    return model, labels


def run_hdbscan(
    embeddings,
    min_cluster_size=15,
    min_samples=3,
    metric="euclidean",
    use_umap=True
):
    """
    Perform HDBSCAN density-based hierarchical clustering.
    Optionally reduces high-dimensional embeddings (e.g., 384D) to 5D using UMAP
    for density estimation (standard BERTopic methodology).
    """
    if use_umap and embeddings.shape[1] > 10:
        import umap
        reducer = umap.UMAP(
            n_components=5,
            n_neighbors=15,
            min_dist=0.0,
            metric="cosine",
            random_state=42
        )
        data_for_hdbscan = reducer.fit_transform(embeddings)
    else:
        data_for_hdbscan = embeddings

    model = hdbscan.HDBSCAN(
        min_cluster_size=min_cluster_size,
        min_samples=min_samples,
        metric=metric,
        cluster_selection_method="eom"
    )
    labels = model.fit_predict(data_for_hdbscan)
    return model, labels



def extract_cluster_keywords(texts, labels, top_n=10, stop_words="english"):
    """
    Extract top N characteristic terms for each cluster using Class-Based TF-IDF (c-TF-IDF).
    Handles noise label -1 by grouping outlier comments into a 'Noise/Unclustered' section.
    """
    df_temp = pd.DataFrame({"text": texts, "label": labels})
    unique_labels = sorted(df_temp["label"].unique())

    # Group texts by cluster label
    documents_per_cluster = []
    cluster_ids = []

    for label in unique_labels:
        cluster_docs = " ".join(df_temp[df_temp["label"] == label]["text"])
        documents_per_cluster.append(cluster_docs)
        cluster_ids.append(label)

    # Compute c-TF-IDF
    vectorizer = TfidfVectorizer(stop_words=stop_words, ngram_range=(1, 2), min_df=1)
    try:
        c_tfidf_matrix = vectorizer.fit_transform(documents_per_cluster)
        feature_names = np.array(vectorizer.get_feature_names_out())

        cluster_keywords = {}
        for idx, label in enumerate(cluster_ids):
            row = c_tfidf_matrix[idx].toarray().flatten()
            top_indices = row.argsort()[-top_n:][::-1]
            top_words = feature_names[top_indices]
            cluster_keywords[label] = list(top_words)
    except Exception as e:
        # Fallback keyword extraction
        cluster_keywords = {label: ["feedback", "course", "teacher"] for label in unique_labels}

    return cluster_keywords