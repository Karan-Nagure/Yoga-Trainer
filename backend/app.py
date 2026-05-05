"""
Smart Yoga Trainer - Flask Backend
Main application entry point
"""
import os
from dotenv import load_dotenv
load_dotenv()

from flask import Flask
from flask_cors import CORS
from database.mongo import init_db
from routes.pose_routes import pose_bp
from routes.session_routes import session_bp
from routes.yoga_routes import yoga_bp

def create_app():
    app = Flask(__name__)
    
    # Config
    app.config["MONGO_URI"] = os.getenv("MONGO_URI", "mongodb://localhost:27017/yoga_trainer")
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "yoga-secret-key-2024")
    app.config["MAX_CONTENT_LENGTH"] = 100 * 1024 * 1024  # 100MB

    # CORS
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Database
    init_db(app)

    # Blueprints
    app.register_blueprint(pose_bp, url_prefix="/api/pose")
    app.register_blueprint(session_bp, url_prefix="/api/session")
    app.register_blueprint(yoga_bp, url_prefix="/api/yoga")

    @app.route("/api/health")
    def health():
        return {"status": "ok", "service": "Smart Yoga Trainer API", "version": "1.0.0"}

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, host="0.0.0.0", port=5000)
