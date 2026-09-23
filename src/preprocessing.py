import re
import pandas as pd


def clean_text(text):
    """
    Basic text preprocessing for student feedback.
    """

    text = str(text)

    # Convert to lowercase
    text = text.lower()

    # Remove URLs
    text = re.sub(r"http\S+|www\S+", "", text)

    # Remove special characters and numbers
    text = re.sub(r"[^a-zA-Z\s]", "", text)

    # Remove extra whitespace
    text = re.sub(r"\s+", " ", text)

    return text.strip()


def preprocess_dataframe(df):
    """
    Clean the comments column, explicitly exclude sentiment label,
    and remove invalid/duplicate feedback.
    """
    df = df.copy()

    # Explicitly drop sentiment column if present to ensure strictly unsupervised handling
    if "sentiments" in df.columns:
        df = df.drop(columns=["sentiments"])

    # Keep original feedback
    df["original_text"] = df["comments"].astype(str)

    # Clean text
    df["clean_text"] = df["comments"].apply(clean_text)

    # Remove empty comments
    df = df[df["clean_text"].str.len() > 0]

    # Remove very short comments (less than 10 characters)
    df = df[df["clean_text"].str.len() > 10]

    # Remove duplicate cleaned comments
    df = df.drop_duplicates(subset="clean_text")

    # Compute text length characteristics
    df["char_count"] = df["clean_text"].str.len()
    df["word_count"] = df["clean_text"].apply(lambda x: len(x.split()))

    # Reset index
    df = df.reset_index(drop=True)

    return df