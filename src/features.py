from sklearn.feature_extraction.text import TfidfVectorizer
from sentence_transformers import SentenceTransformer


def create_tfidf_features(
    texts,
    max_features=3000,
    ngram_range=(1, 2),
    min_df=2,
    stop_words="english"
):
    """
    Convert text into sparse TF-IDF feature representation.
    """
    vectorizer = TfidfVectorizer(
        max_features=max_features,
        ngram_range=ngram_range,
        min_df=min_df,
        stop_words=stop_words
    )

    X_tfidf = vectorizer.fit_transform(texts)
    return X_tfidf, vectorizer


def create_embeddings(
    texts,
    model_name="all-MiniLM-L6-v2",
    normalize_embeddings=True
):
    """
    Generate dense sentence embeddings using SBERT Transformer models.
    """
    model = SentenceTransformer(model_name)

    embeddings = model.encode(
        texts,
        show_progress_bar=False,
        normalize_embeddings=normalize_embeddings
    )

    return embeddings