import pandas as pd

df = pd.read_csv(
    "data/raw/Student_Feedback.csv",
    encoding="latin1"
)

print(df.head())
print(df.shape)
print(df.columns)
print(df.info())
print(df["sentiments"].value_counts())

import matplotlib.pyplot as plt

# Sentiment distribution
df["sentiments"].value_counts().sort_index().plot(kind="bar")

plt.xlabel("Sentiment Label")
plt.ylabel("Number of Feedbacks")
plt.title("Sentiment Distribution")
plt.show()


# Character count
df["text_length"] = df["comments"].str.len()

df["text_length"].hist()

plt.xlabel("Text Length (characters)")
plt.ylabel("Number of Feedbacks")
plt.title("Feedback Length Distribution")
plt.show()


# Word count
df["word_count"] = df["comments"].str.split().str.len()

df["word_count"].hist()

plt.xlabel("Word Count")
plt.ylabel("Number of Feedbacks")
plt.title("Feedback Word Count Distribution")
plt.show()


# Basic statistics
print("\nText Statistics:")
print(df[["text_length", "word_count"]].describe())


#clean text
import re

def clean_text(text):

    text = str(text).lower()

    text = re.sub(r"http\S+|www\S+", "", text)

    text = re.sub(r"[^a-zA-Z\s]", "", text)

    text = re.sub(r"\s+", " ", text)

    return text.strip()

df["clean_text"] = df["feedback"].apply(clean_text)