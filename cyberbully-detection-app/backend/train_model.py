# train_model.py
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline
import joblib

print("Loading dataset...")
df = pd.read_csv('CyberBullying Comments Dataset.csv')
df = df.rename({"CB_Label": "Text_label"}, axis='columns')
df.dropna(inplace=True) # Clean missing values

X = df['Text']
y = df['Text_label']

# Recreating the exact pipeline from your Jupyter Notebook
pipe = Pipeline([
    ('tfidf', TfidfVectorizer(max_features=2500)),
    ('rf_model', RandomForestClassifier(n_estimators=128, random_state=42))
])

print("Training model... (This might take a minute)")
pipe.fit(X, y)

# Save the trained model so we don't have to train it on every request!
joblib.dump(pipe, 'cyberbully_model.pkl')
print("✅ Model successfully trained and saved as cyberbully_model.pkl")