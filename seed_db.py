# seed_db.py
"""
Seed the MongoDB collection 'riunioni' with 20 motivational business quotes and sample YouTube links.
This script clears the existing collection and inserts new records.
"""
import os
from datetime import datetime, timezone
from pymongo import MongoClient
from dotenv import load_dotenv  # type: ignore

# Load environment variables
load_dotenv()
MONGO_URI = os.getenv('MONGO_URI')
DB_NAME = os.getenv('DB_NAME')

# Connect to MongoDB
client = MongoClient(MONGO_URI)
db = client[DB_NAME]
collection = db.riunioni

# Clear existing data
collection.delete_many({})

# List of 20 motivational business quotes and sample video URLs
data = [
    { 'titolo_chiamata': "Success is not final, failure is not fatal: it is the courage to continue that counts.",
      'video_riunione': "https://www.youtube.com/watch?v=ZXsQAXx_ao0" },
    { 'titolo_chiamata': "The way to get started is to quit talking and begin doing.",
      'video_riunione': "https://www.youtube.com/watch?v=UF8uR6Z6KLc" },
    { 'titolo_chiamata': "Don't watch the clock; do what it does. Keep going.",
      'video_riunione': "https://www.youtube.com/watch?v=HAnw168huqA" },
    { 'titolo_chiamata': "The secret of getting ahead is getting started.",
      'video_riunione': "https://www.youtube.com/watch?v=6s-hIylOTJk" },
    { 'titolo_chiamata': "It always seems impossible until it's done.",
      'video_riunione': "https://www.youtube.com/watch?v=AR7MmO0wrw4" },
    { 'titolo_chiamata': "Opportunities don't happen. You create them.",
      'video_riunione': "https://www.youtube.com/watch?v=J1QSXolMOrm" },
    { 'titolo_chiamata': "Don't wait. The time will never be just right.",
      'video_riunione': "https://www.youtube.com/watch?v=p6PjzV_1BFs" },
    { 'titolo_chiamata': "Action is the foundational key to all success.",
      'video_riunione': "https://www.youtube.com/watch?v=PHH7m-Rt04Y" },
    { 'titolo_chiamata': "The harder I work, the luckier I get.",
      'video_riunione': "https://www.youtube.com/watch?v=BG2Re5H0kno" },
    { 'titolo_chiamata': "Don't be afraid to give up the good to go for the great.",
      'video_riunione': "https://www.youtube.com/watch?v=Hgm6EqhFh2g" },
    { 'titolo_chiamata': "Success usually comes to those who are too busy to be looking for it.",
      'video_riunione': "https://www.youtube.com/watch?v=qX0pO617pKg" },
    { 'titolo_chiamata': "If you really look closely, most overnight successes took a long time.",
      'video_riunione': "https://www.youtube.com/watch?v=INeFJvzy2qU" },
    { 'titolo_chiamata': "The only way to do great work is to love what you do.",
      'video_riunione': "https://www.youtube.com/watch?v=O4L7Zztzyc0" },
    { 'titolo_chiamata': "The future belongs to those who believe in the beauty of their dreams.",
      'video_riunione': "https://www.youtube.com/watch?v=WpkDN1HVY9I" },
    { 'titolo_chiamata': "Don't limit your challenges. Challenge your limits.",
      'video_riunione': "https://www.youtube.com/watch?v=bJ66Mg7P7Lo" },
    { 'titolo_chiamata': "The only limit to our realization of tomorrow is our doubts of today.",
      'video_riunione': "https://www.youtube.com/watch?v=OFzRS0uSdSA" },
    { 'titolo_chiamata': "You miss 100% of the shots you don't take.",
      'video_riunione': "https://www.youtube.com/watch?v=3w7LltB_z2Q" },
    { 'titolo_chiamata': "I find that the harder I work, the more luck I seem to have.",
      'video_riunione': "https://www.youtube.com/watch?v=ZyK6d7C5IrE" },
    { 'titolo_chiamata': "Success is walking from failure to failure with no loss of enthusiasm.",
      'video_riunione': "https://www.youtube.com/watch?v=UlarpHkn4cc" },
    { 'titolo_chiamata': "The road to success and the road to failure are almost exactly the same.",
      'video_riunione': "https://www.youtube.com/watch?v=H0eG2cYm20I" }
]

# Insert documents with incremental IDs
docs = []
for idx, item in enumerate(data, start=1):
    doc = {
        'id_chiamata': idx,
        'titolo_chiamata': item['titolo_chiamata'],
        'video_riunione': item['video_riunione'],
        # ...existing code...
        'note_riunione': f"Initial note: Remember \"{item['titolo_chiamata']}\"",
        'trascrizione': {
            'testo_completo': item['titolo_chiamata'],
            'descrizione': f"Sample transcript for meeting {idx}.",
            'segmenti': [
                {
                    'start_time': 0,
                    'end_time': 5,
                    'testo': item['titolo_chiamata']
                }
            ]
        },
        'created_at': datetime.now(timezone.utc)
    }
    docs.append(doc)

# Bulk insert
collection.insert_many(docs)
print(f"Inserted {len(docs)} sample meetings into 'riunioni' collection.")
