# Student Feedback Theme Discovery Using Unsupervised NLP

An unsupervised NLP project that discovers meaningful themes in student feedback using **TF-IDF** and **Sentence-BERT (SBERT)** embeddings with **K-Means clustering**. The project compares traditional lexical representations with semantic embeddings and performs qualitative theme interpretation and error analysis.

---

## Overview

Student feedback often contains valuable information about teaching quality, classroom practices, teacher behaviour, and learning experiences. However, manually analysing a large collection of feedback comments is time-consuming.

This project applies **unsupervised Natural Language Processing** to automatically discover recurring themes in student feedback without using predefined topic labels.

Two text representation approaches are evaluated:

- **TF-IDF** — traditional lexical representation
- **SBERT (`all-MiniLM-L6-v2`)** — semantic sentence embeddings

Both representations are clustered using **K-Means**, and their clustering quality is compared using the **Silhouette Score**.

The resulting SBERT clusters are then interpreted using representative feedback comments, theme distributions, sentiment distributions, and boundary-based error analysis.

---

## Objectives

- Explore and understand student feedback data.
- Preprocess textual feedback for NLP analysis.
- Establish a TF-IDF + K-Means baseline.
- Generate semantic embeddings using SBERT.
- Apply K-Means clustering to discover feedback themes.
- Compare TF-IDF and SBERT representations quantitatively.
- Interpret the discovered clusters using representative comments.
- Analyse the relationship between discovered themes and sentiment labels.
- Perform error analysis on ambiguous and overlapping feedback.
- Identify limitations and possible directions for future research.

---

## Dataset

The project uses the **Student Feedback Dataset** containing student comments and sentiment labels.

**Source:**  
https://github.com/mbalvi/student_feedback_data/blob/main/Student_Feedback.csv

### Dataset characteristics

| Property | Value |
|---|---:|
| Rows | 1,086 |
| Columns | 2 |
| File size | ~51 KB |
| Text column | `comments` |
| Sentiment column | `sentiments` |
| Missing values | None in the original dataset |

### Columns

| Column | Type | Description |
|---|---|---|
| `comments` | String | Student feedback text |
| `sentiments` | Integer | Sentiment label associated with the feedback |

The sentiment labels are used for **post-clustering analysis and interpretation**, not as inputs to the unsupervised clustering process.

---

## Methodology

```text
                    Student Feedback
                           │
                           ▼
                   Data Understanding
                           │
                           ▼
                     Preprocessing
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
           TF-IDF                      SBERT
             │                           │
             ▼                           ▼
          K-Means                    K-Means
             │                           │
             ▼                           ▼
       Silhouette Score           Silhouette Score
             │                           │
             └─────────────┬─────────────┘
                           ▼
                       Comparison
                           │
                           ▼
                  Theme Interpretation
                           │
                           ▼
                     Error Analysis
                           │
                           ▼
                      Limitations
                           │
                           ▼
                    Future Research
```

---

## Text Preprocessing

The preprocessing pipeline includes:

- Handling missing or invalid text entries
- Removing duplicate feedback
- Text normalization
- Cleaning unnecessary characters
- Tokenization
- Stopword handling
- Basic linguistic normalization
- Calculation of text statistics such as word and character counts

The processed dataset is stored under:

```text
data/processed/
```

---

## Feature Representation

### 1. TF-IDF

TF-IDF is used as the traditional baseline representation.

The implementation uses:

- Word-level features
- Unigrams and bigrams
- Maximum of 3,000 features

TF-IDF represents comments based primarily on their lexical content and word importance.

### 2. SBERT

The project uses:

```text
all-MiniLM-L6-v2
```

to generate dense sentence embeddings.

Unlike TF-IDF, SBERT captures semantic relationships between sentences, allowing comments with different wording but similar meanings to be represented closer together in embedding space.

---

## Clustering

**K-Means clustering** is applied independently to the TF-IDF and SBERT representations.

Multiple values of `K` are evaluated using the **Silhouette Score** to examine cluster separation.

The final SBERT clustering is additionally interpreted qualitatively to identify meaningful feedback themes.

---

## Results

### TF-IDF vs SBERT

SBERT produced higher Silhouette Scores than TF-IDF across the tested cluster counts.

The strongest observed results were:

| Representation | K | Silhouette Score |
|---|---:|---:|
| TF-IDF | 7 | 0.0129 |
| SBERT | 2 | 0.0807 |

At **K = 7**:

| Representation | Silhouette Score |
|---|---:|
| TF-IDF | 0.0129 |
| SBERT | 0.0393 |

This indicates that SBERT provides better semantic separation than the TF-IDF baseline on this dataset.

However, the absolute Silhouette Scores remain relatively low. Therefore, the clustering should **not** be interpreted as producing sharply separated topics. Quantitative evaluation was combined with qualitative inspection of representative comments.

---

## Discovered Themes

The final SBERT-based analysis identified seven semantically interpretable themes:

| Cluster | Theme |
|---:|---|
| 0 | Teaching Methodology & Teaching Style |
| 1 | Technical & Programming Learning |
| 2 | Teacher Approach & Interpersonal Qualities |
| 3 | Teacher Performance & Student Support |
| 4 | Teacher Behaviour, Fairness & Professional Conduct |
| 5 | Classroom Management & Academic Practices |
| 6 | Subject Knowledge & Practical Learning |

Cluster sizes ranged from **56 to 253 comments**, indicating that some themes were substantially more common than others.

The largest discovered theme was:

**Teacher Performance & Student Support**

with **253 comments**.

---

## Sentiment Analysis by Theme

Although sentiment labels were not used to create the clusters, they were analysed after clustering to understand whether sentiment was associated with particular themes.

The results show that the discovered clusters contain **multiple sentiment categories**. Therefore, the clusters cannot be interpreted as purely positive or negative groups.

For example, the themes with relatively high proportions of negative-labelled feedback included:

| Theme | Negative-labelled feedback |
|---|---:|
| Teacher Performance & Student Support | 58.10% |
| Subject Knowledge & Practical Learning | 52.78% |
| Classroom Management & Academic Practices | 47.85% |

These results suggest that sentiment may contribute to the observed clustering structure, but **theme and sentiment are not equivalent concepts**.

---

## Model Agreement

The **Adjusted Rand Index (ARI)** between the TF-IDF and SBERT K=7 cluster assignments was:

```text
ARI = 0.0710
```

The low agreement indicates that the two representations produced substantially different cluster structures.

This is expected to some extent because TF-IDF primarily captures lexical overlap, while SBERT captures semantic similarity.

---

## Error Analysis

The clustering results also reveal several sources of ambiguity.

### 1. Overlapping Themes

Some comments discuss multiple concepts simultaneously.

For example, a feedback comment may mention both:

- teaching methodology
- practical learning

Assigning such feedback to only one cluster can therefore be ambiguous.

### 2. Generic Feedback

Some comments contain very little topical information.

For example:

> "everything is good about the faculty members"

Such comments provide limited semantic information for identifying a specific theme.

### 3. Short Comments

Very short feedback comments contain less contextual information and can be difficult to place reliably in semantic clusters.

### 4. Mixed Feedback

Some comments combine positive and negative observations or discuss several aspects of teaching within the same sentence.

This makes a single-cluster assignment an imperfect representation of the feedback.

### 5. Boundary Analysis

The difference between cosine similarity to the two cluster centroids was used to identify comments close to the boundary between the discovered SBERT clusters.

| Boundary threshold | Comments | Percentage |
|---|---:|---:|
| Difference < 0.01 | 16 | 1.51% |
| Difference < 0.02 | 32 | 3.01% |
| Difference < 0.05 | 110 | 10.35% |

This demonstrates that a measurable portion of the feedback lies close to cluster boundaries, supporting the observation that student feedback does not always belong to one clearly defined theme.

---

## Key Findings

- **SBERT outperformed TF-IDF** in Silhouette Score across the tested cluster counts.
- SBERT achieved its highest observed Silhouette Score of **0.0807 at K=2**.
- At K=7, SBERT achieved **0.0393**, compared with **0.0129 for TF-IDF**.
- The absolute Silhouette Scores remained relatively low, indicating considerable overlap between feedback themes.
- SBERT nevertheless produced **semantically interpretable themes**.
- The final analysis identified seven major areas of student feedback.
- Sentiment was distributed across multiple themes rather than forming purely sentiment-based clusters.
- The ARI of **0.0710** indicates low agreement between TF-IDF and SBERT K=7 cluster assignments.
- Boundary analysis showed that **10.35%** of comments had a cosine-similarity difference below 0.05 between the two cluster centroids.
- Qualitative inspection is therefore important when interpreting unsupervised clusters in short student-feedback text.

---

## Limitations

- The dataset is relatively small for general-purpose semantic clustering.
- Student comments are often short and provide limited context.
- A single comment may contain multiple themes.
- K-Means requires selecting the number of clusters in advance.
- Silhouette Scores indicate weak overall separation.
- Cluster names are assigned through human interpretation rather than supervised topic labels.
- Sentiment labels are available for analysis but are not used as clustering targets.
- The discovered themes should therefore be treated as exploratory patterns rather than definitive categories.

---

## Future Research

Possible extensions include:

- Testing additional sentence-embedding models.
- Comparing K-Means with hierarchical clustering, DBSCAN, or HDBSCAN.
- Using BERTopic for topic discovery.
- Applying dimensionality reduction methods such as UMAP for improved visualization.
- Using LLM-assisted cluster naming and validation.
- Exploring multi-label topic assignment for comments containing multiple themes.
- Increasing the dataset size and diversity.
- Evaluating cluster stability across different random seeds and subsets.
- Incorporating aspect-based sentiment analysis.
- Comparing automatically discovered themes against manually annotated topics.

---

## Project Structure

```text
NLP-Feedback-Clustering/
│
├── data/
│   ├── raw/
│   │   └── Student_Feedback.csv
│   │
│   └── processed/
│       ├── cleaned_student_feedback.csv
│       ├── final_student_feedback_themes.csv
│       └── theme_summary.csv
│
├── notebooks/
│   ├── 01_problem_and_eda.ipynb
│   ├── 02_preprocessing.ipynb
│   ├── 03_tfidf_baseline.ipynb
│   ├── 04_sbert_improved.ipynb
│   └── 05_comparison_evaluation.ipynb
│
├── results/
│   ├── figures/
│   │   ├── sentiment_distribution.png
│   │   ├── comment_length_distribution.png
│   │   ├── tfidf_silhouette_scores.png
│   │   ├── sbert_clusters.png
│   │   ├── tfidf_vs_sbert_comparison.png
│   │   ├── theme_distribution.png
│   │   └── sentiment_by_theme.png
│   │
│   └── tables/
│       ├── clustering_comparison.csv
│       ├── theme_distribution.csv
│       └── model_agreement.csv
│
├── requirements.txt
└── README.md
```

---

## Technologies Used

- **Python**
- **Pandas**
- **NumPy**
- **Scikit-learn**
- **Sentence-Transformers**
- **PyTorch**
- **Matplotlib**
- **Seaborn**
- **Jupyter Notebook**

---

## How to Run

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/NLP-Feedback-Clustering.git
cd NLP-Feedback-Clustering
```

### 2. Create a virtual environment

```bash
python -m venv venv
```

Activate it on Windows:

```bash
venv\Scripts\activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Run the notebooks

Open the project in Jupyter Notebook or VS Code and run the notebooks in order:

```text
01_problem_and_eda.ipynb
        ↓
02_preprocessing.ipynb
        ↓
03_tfidf_baseline.ipynb
        ↓
04_sbert_improved.ipynb
        ↓
05_comparison_evaluation.ipynb
```

---

## Conclusion

This project demonstrates how unsupervised NLP can be used to discover latent themes in student feedback.

The comparison shows that **semantic SBERT embeddings capture the structure of this feedback more effectively than the TF-IDF baseline**. However, the relatively low clustering scores and boundary analysis demonstrate that student feedback is inherently overlapping and cannot always be represented by a single discrete theme.

Therefore, the most useful interpretation of the results is not simply which model produces the highest metric, but how well the resulting clusters correspond to **meaningful and interpretable patterns in real student feedback**.

---