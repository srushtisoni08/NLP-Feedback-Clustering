import numpy as np
from scipy.sparse import issparse
from sklearn.metrics import (
    silhouette_score,
    davies_bouldin_score,
    calinski_harabasz_score
)
from sklearn.metrics.pairwise import cosine_similarity


def evaluate_clustering(X, labels):
    """
    Calculate intrinsic clustering evaluation metrics:
    - Silhouette Score (higher is better, range [-1, 1])
    - Davies-Bouldin Index (lower is better, range [0, inf))
    - Calinski-Harabasz Score (higher is better)
    - Intra-cluster Cosine Similarity (higher is better, range [0, 1])
    - Noise Ratio (% of points assigned to -1 in density algorithms)
    """
    labels = np.array(labels)
    total_samples = len(labels)
    noise_count = np.sum(labels == -1)
    noise_ratio = noise_count / total_samples if total_samples > 0 else 0.0

    # Filter out noise points (e.g., HDBSCAN -1)
    valid_mask = labels != -1
    labels_valid = labels[valid_mask]

    if len(set(labels_valid)) < 2:
        return {
            "n_clusters": len(set(labels_valid)),
            "silhouette": None,
            "davies_bouldin": None,
            "calinski_harabasz": None,
            "mean_intra_cosine_sim": None,
            "noise_ratio": noise_ratio
        }

    # Convert sparse to dense if needed for Davies-Bouldin and Calinski-Harabasz
    if issparse(X):
        X_valid_sparse = X[valid_mask]
        X_valid_dense = X_valid_sparse.toarray()
    else:
        X_valid_sparse = X[valid_mask]
        X_valid_dense = X[valid_mask]

    silhouette = float(silhouette_score(X_valid_sparse, labels_valid))
    davies_bouldin = float(davies_bouldin_score(X_valid_dense, labels_valid))
    calinski_harabasz = float(calinski_harabasz_score(X_valid_dense, labels_valid))

    # Compute Intra-cluster Cosine Similarity
    intra_sims = []
    for label in set(labels_valid):
        cluster_mask = labels_valid == label
        cluster_vecs = X_valid_dense[cluster_mask]
        if len(cluster_vecs) > 1:
            sim_matrix = cosine_similarity(cluster_vecs)
            # Upper triangle off-diagonal elements
            triu_indices = np.triu_indices_from(sim_matrix, k=1)
            if len(triu_indices[0]) > 0:
                intra_sims.append(np.mean(sim_matrix[triu_indices]))

    mean_intra_cosine_sim = float(np.mean(intra_sims)) if intra_sims else 1.0

    return {
        "n_clusters": len(set(labels_valid)),
        "silhouette": silhouette,
        "davies_bouldin": davies_bouldin,
        "calinski_harabasz": calinski_harabasz,
        "mean_intra_cosine_sim": mean_intra_cosine_sim,
        "noise_ratio": noise_ratio
    }