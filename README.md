# Student Feedback Theme Discovery Using Unsupervised NLP

A comprehensive, end-to-end unsupervised Natural Language Processing (NLP) framework designed to discover, cluster, evaluate, and visualize latent educational themes from unstructured student feedback comments without relying on sentiment labels.

---

## 1. Problem Definition & Objectives

Student feedback provides higher education institutions with vital insight into instructional quality, course design, practical laboratory sessions, infrastructure, and administrative support. However, manually categorizing thousands of open-ended text comments is labor-intensive, subjective, and prone to human error.

### Core Objectives
1. **Unsupervised Theme Discovery**: Automatically partition unstructured text comments into coherent thematic clusters without using any supervised sentiment or topic annotations.
2. **Multi-Representation Comparison**: Compare sparse lexical representations (**TF-IDF**) against dense contextual transformer embeddings (**Sentence-BERT / SBERT**).
3. **Multi-Algorithm Evaluation**: Evaluate traditional centroid clustering (**K-Means**) against density-based hierarchical clustering (**HDBSCAN**).
4. **Quantitative Validation**: Assess cluster compactness, separation, and semantic coherence using Silhouette Score, Davies-Bouldin Index, Calinski-Harabasz Score, and Intra-Cluster Cosine Similarity.
5. **Actionable Insights & Artifact Generation**: Automatically extract dominant keywords, select exemplar student quotes, and generate visualizations saved directly to `results/figures/` and `results/tables/`.

---

## 2. Dataset Source & Characteristics

- **Dataset Source**: Real-world higher education student feedback survey dataset (`data/raw/Student_Feedback.csv`).
- **Total Raw Records**: 1,086 feedback comments.
- **Original Schema**: `['comments', 'sentiments']`
- **Data Policy & Unsupervised Constraint**: As specified, the `sentiments` column is explicitly dropped during preprocessing (`src/preprocessing.py`) to guarantee a strictly **unsupervised NLP pipeline**.

### Dataset Summary Statistics (Post-Preprocessing)
| Metric | Value |
| :--- | :--- |
| **Cleaned Comments Count** | 1,051 (35 duplicates/short comments removed) |
| **Mean Word Count** | 7.62 words / comment |
| **Mean Character Count** | 43.59 characters / comment |
| **Vocabulary Size (TF-IDF)** | 752 unique unigram/bigram tokens |
| **Embedding Dimension (SBERT)** | 384 dimensions |

---

## 3. NLP Preprocessing & Feature Engineering

### 3.1 Text Preprocessing Pipeline (`src/preprocessing.py`)
1. **Lowercasing**: Standardized all text to lowercase.
2. **Noise & URL Removal**: Regular expressions removed hyper-links (`http\S+`, `www\S+`) and non-alphabetic special characters/numbers (`[^a-zA-Z\s]`).
3. **Whitespace Normalization**: Collapsed consecutive spaces into single space tokens.
4. **Length Filtering**: Filtered out empty or trivial comments ($< 10$ characters, e.g., "ok", "good").
5. **Deduplication**: Removed duplicate feedback entries to prevent cluster skew.

### 3.2 Feature Representation Techniques (`src/features.py`)
- **Sparse Lexical Features (TF-IDF)**:
  - Vectorized text using $1$-$2$ n-grams, English stop-word removal, $min\_df=2$, and $max\_features=3000$. Resulting matrix shape: $(1051, 752)$.
- **Dense Contextual Embeddings (SBERT)**:
  - Encoded comments using `sentence-transformers/all-MiniLM-L6-v2`. Maps comments into a $384$-dimensional dense vector space capturing deep semantic similarities beyond exact keyword overlap. All embeddings were $L2$-normalized.

---

## 4. Methodology & Clustering Techniques

```
                         Student Feedback Comments (1,051)
                                         │
                   ┌─────────────────────┴─────────────────────┐
                   ▼                                           ▼
          TF-IDF Vectorization                      SBERT Embeddings
             (1051 x 752)                             (1051 x 384)
                   │                                           │
                   ▼                                    ┌──────┴──────┐
        Baseline: TF-IDF + K-Means                      ▼             ▼
          (Hyperparameter sweep K)               SBERT + K-Means  SBERT + UMAP + HDBSCAN
                   │                                    │             │
                   └─────────────────────┬──────────────┘             │
                                         ▼                            ▼
                            Theme Keyword Extraction         Density Outlier Filtering
                                  (c-TF-IDF)                     & Theme Clustering
```

### 4.1 Baseline Approach: TF-IDF + K-Means
- Evaluated $K \in [2, 10]$ using K-Means++ initialization.
- Determined optimal cluster count $K=10$ based on Silhouette Score maximization.

### 4.2 Improved Approach 1: SBERT Embeddings + K-Means
- Applied K-Means ($K=10$) directly on normalized 384-dimensional SBERT embeddings.
- Leverages contextual semantics to group paraphrased feedback (e.g., "teacher explains well" and "faculty possesses excellent teaching skills").

### 4.3 Improved Approach 2: SBERT Embeddings + UMAP + HDBSCAN
- Reduced SBERT embedding dimension from 384D to 5D using UMAP (`metric='cosine'`, `n_neighbors=15`).
- Fitted HDBSCAN (`min_cluster_size=15`, `min_samples=3`, `cluster_selection_method='eom'`).
- Automatically filters uninformative noise/outliers (assigned label `-1`).

---

## 5. Experimental Evaluation & Results

All models were evaluated using four complementary intrinsic clustering metrics:
- **Silhouette Score ($S$)**: Measures how similar an object is to its own cluster compared to other clusters (range $[-1, 1]$, higher is better).
- **Davies-Bouldin Index ($DB$)**: Ratio of intra-cluster distances to inter-cluster distances (lower is better).
- **Calinski-Harabasz Score ($CH$)**: Ratio of between-cluster dispersion to within-cluster dispersion (higher is better).
- **Intra-Cluster Cosine Similarity**: Mean pairwise cosine similarity among points in the same cluster (range $[0, 1]$, higher is better).

### 5.1 Comparative Experimental Results Table
*(Saved automatically to `results/tables/comparative_model_evaluation.csv`)*

| Model | Clusters ($K$) | Silhouette Score ↑ | Davies-Bouldin Index ↓ | Calinski-Harabasz Score ↑ | Intra-Cluster Cosine Sim ↑ | Noise Ratio (%) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Baseline: TF-IDF + K-Means** | 10 | 0.0361 | 4.5002 | 11.06 | 0.1681 | 0.0% |
| **Improved 1: SBERT + K-Means** | 10 | 0.0381 | 3.4943 | **27.42** | 0.3711 | 0.0% |
| **Improved 2: SBERT + HDBSCAN** | **22** | **0.0447** | **2.9139** | 14.10 | **0.4287** | **21.2%** |

### 5.2 Key Findings & Comparative Analysis
1. **Contextual Superiority of SBERT**: SBERT + K-Means achieved a **2.5x increase in Calinski-Harabasz score** ($27.42$ vs $11.06$) and **more than doubled intra-cluster cosine similarity** ($0.3711$ vs $0.1681$) compared to the TF-IDF baseline.
2. **Davies-Bouldin Improvement**: SBERT + HDBSCAN achieved the lowest (best) Davies-Bouldin index ($2.9139$), demonstrating superior cluster separation.
3. **Density Outlier Filtering**: HDBSCAN successfully isolated $21.2\%$ of noisy/ambiguous feedback into label `-1`, resulting in the highest intra-cluster semantic cohesion ($0.4287$).

---

## 6. Visualizations & Generated Artifacts

All figures are generated in high resolution (300 DPI) and stored in `results/figures/`:

1. **Hyperparameter Tuning Curve (`results/figures/silhouette_vs_k.png`)**:
   - Plots Silhouette Score and Davies-Bouldin index for $K \in [2..10]$.
2. **2D UMAP Cluster Projections**:
   - `results/figures/umap_clusters_tfidf.png`: Sparse baseline cluster projection.
   - `results/figures/umap_clusters_sbert_kmeans.png`: SBERT K-Means cluster projection.
   - `results/figures/umap_clusters_sbert_hdbscan.png`: SBERT HDBSCAN cluster projection highlighting density clusters and noise points.
3. **Theme Size Distributions**:
   - `results/figures/theme_distribution_tfidf.png`
   - `results/figures/theme_distribution_sbert_kmeans.png`
   - `results/figures/theme_distribution_sbert_hdbscan.png`

---

## 7. Discovered Student Feedback Themes & Exemplar Quotes

Extracted via Class-Based TF-IDF (c-TF-IDF) in `src/clustering.py` and saved to `results/tables/theme_keywords_summary.csv`:

| Cluster ID | Extracted Top Keywords (c-TF-IDF) | Exemplar Student Quote |
| :---: | :--- | :--- |
| **Theme 0** | `knowledge`, `subject`, `technical`, `deep` | *"Teachers have good knowledge about their taught subjects."* |
| **Theme 1** | `practical`, `knowledge`, `give`, `labs` | *"Teacher should give us the practical knowledge instead of theoretical..."* |
| **Theme 2** | `career`, `building`, `help`, `future` | *"TEACHERS HELP US IN CAREER BUILDING AND FUTURE PLANNING"* |
| **Theme 3** | `communication`, `skills`, `english`, `improve` | *"Teacher needs to improve communication skills during lecture."* |
| **Theme 4** | `time`, `syllabus`, `complete`, `punctual` | *"Syllabus should be completed on time before exams."* |
| **Theme 5** | `friendly`, `interactive`, `nature`, `approachable` | *"Faculty behavior is very friendly and cooperative."* |
| **Theme 6** | `teaching`, `style`, `method`, `understand` | *"Teaching methodology is very good and easy to understand."* |

---

## 8. Error Analysis & System Limitations

1. **Short Text Ambiguity**: Student comments under 5 words (e.g., *"good teacher"*, *"no issues"*) lack sufficient contextual tokens, causing them to hover near cluster boundaries or get flagged as noise in HDBSCAN.
2. **Overlapping Themes**: Comments touching multiple topics (e.g., *"Teacher has good knowledge but needs to improve lab practicals"*) create boundary confusion in hard partitioning algorithms (K-Means).
3. **Domain Vocabulary Specificity**: General stop-word lists do not filter domain-specific generic terms like *"teacher"*, *"student"*, or *"class"*, requiring custom c-TF-IDF weight adjustments.

---

## 9. Conclusion & Future Research Directions

### Conclusion
This project successfully implemented an unsupervised NLP pipeline for Student Feedback Theme Discovery. Dense contextual embeddings (SBERT) combined with density-based clustering (HDBSCAN) significantly outperformed traditional TF-IDF + K-Means in cluster separation ($DB = 2.9139$) and semantic cohesion ($0.4287$).

### Future Research Directions
1. **Guided Topic Modeling (BERTopic / Seeded Topic Models)**: Incorporate seed words (e.g., `["infrastructure", "curriculum", "pedagogy"]`) to guide cluster formation toward institutional priority areas.
2. **Aspect-Based Sentiment & Theme Fusion**: Combine unsupervised theme discovery with zero-shot transformer classification to evaluate sentiment polarity within each specific theme.
3. **Longitudinal Trend Tracking**: Track shifts in student feedback theme distributions across different academic semesters to evaluate administrative interventions.

---

## 10. Reproducibility & File Structure Guide

### Directory Layout
```
d:\nlp\Student Feedback Theme Discovery
├── data/
│   ├── raw/
│   │   └── Student_Feedback.csv              # Raw input dataset
│   └── processed/
│       ├── cleaned_student_feedback.csv       # Preprocessed text data
│       └── final_student_feedback_clusters.csv# Final clustered outputs
├── results/
│   ├── figures/                              # Generated 300 DPI plots
│   │   ├── silhouette_vs_k.png
│   │   ├── umap_clusters_tfidf.png
│   │   ├── umap_clusters_sbert_kmeans.png
│   │   ├── umap_clusters_sbert_hdbscan.png
│   │   └── theme_distribution_*.png
│   └── tables/                               # Generated CSV tables
│       ├── kmeans_k_evaluation.csv
│       ├── comparative_model_evaluation.csv
│       └── theme_keywords_summary.csv
├── src/
│   ├── preprocessing.py                      # Text cleaning & filtering
│   ├── features.py                           # TF-IDF & SBERT vectorizers
│   ├── clustering.py                         # K-Means & HDBSCAN algorithms
│   ├── evaluation.py                         # Intrinsic metric formulas
│   └── visualization.py                      # UMAP & bar plot utilities
├── main.py                                   # Main pipeline execution script
└── requirements.txt                          # Python dependencies
```

### How to Run the Project
```bash
# 1. Activate virtual environment (Windows)
.\venv\Scripts\activate

# 2. Run the main execution pipeline
python main.py
```

---
*Maintained as part of the Unsupervised NLP Student Feedback Theme Discovery Project.*
