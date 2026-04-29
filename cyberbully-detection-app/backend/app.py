# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib

app = Flask(__name__)
# Enable CORS so the React frontend can communicate with this backend
CORS(app)

print("Loading trained model...")
model = joblib.load('cyberbully_model.pkl')

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    text = data.get('text', '')
    
    if not text:
        return jsonify({'error': 'No text provided'}), 400

    # Make the prediction (returns an array, so we grab index [0])
    prediction = model.predict([text])[0]
    
    # 1 is Bully, 0 is Safe (Based on your dataset labels)
    result_text = "Cyberbullying Detected" if prediction == 1 else "Safe / Non-Bullying"
    
    return jsonify({
        'prediction': int(prediction),
        'result': result_text
    })

if __name__ == '__main__':
    print("🚀 Backend server running on http://localhost:5000")
    app.run(port=5000, debug=True)