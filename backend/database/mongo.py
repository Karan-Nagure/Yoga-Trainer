"""
Database initialization and connection handling
"""
from flask_pymongo import PyMongo

mongo = PyMongo()

def init_db(app):
    """Initialize MongoDB connection"""
    mongo.init_app(app)
    return mongo

def get_db():
    return mongo.db
