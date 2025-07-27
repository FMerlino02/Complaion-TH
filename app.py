from flask import Flask, render_template, jsonify
from pymongo import MongoClient
from bson import ObjectId
import json
import os
from flask import send_from_directory

# Custom JSON encoder to handle MongoDB's ObjectId
class JSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, ObjectId):
            return str(o)
        return super(JSONEncoder, self).default(o)

app = Flask(__name__, static_folder='static', static_url_path='/static')
app.json_encoder = JSONEncoder

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME")

client = MongoClient(MONGO_URI)
db = client[DB_NAME]
riunioni_collection = db.riunioni

@app.route('/static/<path:filename>')
def static_files(filename):
    return send_from_directory(app.static_folder, filename)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/riunioni')
def get_riunioni():
    if riunioni_collection is None:
        return jsonify({"error": "Database connection not available"}), 500
    try:
        riunioni_list = list(
            riunioni_collection
            .find({}, {"_id": 0, "id_chiamata": 1, "titolo_chiamata": 1, "video_riunione": 1})
            .sort("id_chiamata", 1)
        )
        return jsonify(riunioni_list)
    except Exception:
        return jsonify({"error": "An error occurred while fetching meetings"}), 500

@app.route('/api/riunioni/<int:id_chiamata>')
def get_riunione_details(id_chiamata):
    if riunioni_collection is None:
        return jsonify({"error": "Database connection not available"}), 500
    try:
        riunione = riunioni_collection.find_one({"id_chiamata": id_chiamata}, {"_id": 0})
        if riunione:
            return jsonify(riunione)
        return jsonify({"error": "Meeting not found"}), 404
    except Exception:
        return jsonify({"error": "An error occurred while fetching meeting details"}), 500

if __name__ == '__main__':
    app.run(
        debug=(os.getenv("FLASK_ENV") == "development"),
        host=os.getenv("FLASK_RUN_HOST"),
        port=int(os.getenv("FLASK_RUN_PORT"))
    )
