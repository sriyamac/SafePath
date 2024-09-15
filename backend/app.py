from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np

app = Flask(__name__)
CORS(app)

start_coords = None
safe_zone_coords = None
tornado_coords = None

@app.route('/api/start-coordinates', methods=['POST'])
def start_coordinates():
    global start_coords
    data = request.get_json()
    start_coords = (data.get('latitude'), data.get('longitude'))
    print(f'Received start coordinates: {start_coords}')
    return jsonify({'status': 'success', 'message': 'Start coordinates received'})

@app.route('/api/update-tornado', methods=['POST'])
def update_tornado():
    global tornado_coords
    data = request.get_json()
    tornado_coords = (data.get('latitude'), data.get('longitude'))
    print(f'Received tornado coordinates: {tornado_coords}')
    path = compute_path()
    return jsonify({'status': 'success', 'path': path})

def compute_path():
    path = [
        {'lat': start_coords[0], 'lng': start_coords[1]},
        {'lat': safe_zone_coords[0], 'lng': safe_zone_coords[1]},
    ]
    return path

if __name__ == '__main__':
    app.run(debug=True)