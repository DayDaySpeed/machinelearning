from flask import Flask, request, jsonify
from flask_cors import CORS

import pickle
import numpy as np

app = Flask(__name__)
CORS(app)

model = pickle.load(
open("../../models/house_price_model.pkl","rb")
)

@app.route("/predict", methods=["POST"])
def predict():

    data = request.json

    features=np.array([[
        data["OverallQual"],
        data["GrLivArea"],
        data["GarageCars"],
        data["TotalBsmtSF"],
        data["YearBuilt"]
    ]])

    pred=model.predict(features)

    return jsonify({
        "predicted_price":float(pred[0])
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)