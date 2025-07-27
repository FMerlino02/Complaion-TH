 # Complaion

 **Live demo:** https://complaion-th.vercel.app/

 Complaion is a simple meeting review application that lets you:
 - Browse and play meeting videos (MP4 or YouTube)
 - View or generate a basic transcript
 - Take notes with automatic saving
 - Add new meetings and delete existing ones via a clean UI

 ## Architecture

 **Backend**
 - Flask handles routing and a RESTful API
 - MongoDB Atlas stores meetings, notes, and transcripts
 - `python-dotenv` loads environment variables (`MONGO_URI`, `DB_NAME`, etc.)
 - Custom JSON encoder converts Mongo `ObjectId` to string

 **Frontend**
 - Tailwind CSS for a responsive, modern look
 - Vanilla JavaScript with fetch calls to the API
 - Debounced note-saving (1.5s delay) so every keystroke isn’t sent
 - YouTube embed detection (supports `youtu.be/`, `watch?v=`, `embed/`, `shorts/`)
 - Fallback HTML5 `<video>` player for MP4 links
 - Add & delete modals for meeting management

 **Data Seeding**
 We mock meeting records and transcripts in `seed_db.py` because the TLDV transcription API is paid only. Running this script clears any existing data and populates 20 sample meetings with motivational business quotes and placeholder transcript segments.

 ## Project Structure
 ```
 Complaion-TH/
 ├── app.py            # Flask app and API endpoints
 ├── seed_db.py        # Populate MongoDB with sample data
 ├── requirements.txt  # Python dependencies
 ├── .env              # Environment variables for local dev
 ├── templates/
 │   └── index.html    # Main HTML template with Jinja
 ├── static/
 │   ├── script.js     # Frontend logic (fetch, embeds, modals)
 │   └── images/       # Logos and favicons
 └── README.md         # This file
 ```

 ## Environment Variables
 Create a `.env` file in the project root with:
 ```ini
 MONGO_URI="<your MongoDB connection string>"
 DB_NAME="complaion_db"
 FLASK_ENV="development"
 FLASK_RUN_HOST="127.0.0.1"
 FLASK_RUN_PORT="5000"
 ```

 ## Setup & Run Locally
 1. Install dependencies:
    ```sh
    pip install -r requirements.txt
    ```
 2. Seed the database:
    ```sh
    python seed_db.py
    ```
 3. Start the server:
    ```sh
    flask run
    ```
 4. Open `http://127.0.0.1:5000` in your browser.

 ## API Endpoints
 - **GET** `/api/riunioni` – list all meetings
 - **POST** `/api/riunioni` – add a meeting (`titolo_chiamata`, `video_riunione`, `note_riunione`)
 - **GET** `/api/riunioni/<id>` – get details (notes, video URL, transcript)
 - **PUT** `/api/riunioni/<id>` – update notes and/or transcript
 - **DELETE** `/api/riunioni/<id>` – remove a meeting

 ## Deployment
 This project is set up for serverless deployment on Vercel. The production site runs at:
 
 **https://complaion-th.vercel.app/**

 ## License
 MIT License
