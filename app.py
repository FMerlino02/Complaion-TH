from flask import Flask, render_template
import os

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/files')
def get_files():
    # Mock data for demonstration
    files = [
        "20/02/2024_12:39.mp4",
        "24/02/2024_12:39.mp4", 
        "28/02/2024_12:39.mp4",
        "30/02/2024_12:39.mp4",
        "01/03/2024_12:39.mp4",
        "2/03/2024_12:39.mp4",
        "6/03/2024_12:39.mp4",
        "8/04/2024_12:39.mp4",
        "10/04/2024_12:39.mp4",
        "20/02/2024_12:39.mp4",
        "20/02/2024_12:39.mp4",
        "20/02/2024_12:39.mp4",
        "20/02/2024_12:39.mp4"
    ]
    return {"files": files}

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
