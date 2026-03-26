from flask import Flask, send_from_directory, jsonify, request, abort
from pathlib import Path
import json

app = Flask(__name__, static_folder='static', template_folder='')

BASE_DIR = Path(__file__).parent
DATA_DIR = BASE_DIR / 'data'
DATA_DIR.mkdir(exist_ok=True)

PROJECTS_FILE = DATA_DIR / 'projects.json'
CONTACTS_FILE = DATA_DIR / 'contacts.json'

def load_json(path, default):
    if not path.exists():
        path.write_text(json.dumps(default, ensure_ascii=False, indent=2), encoding='utf-8')
    with path.open('r', encoding='utf-8') as f:
        return json.load(f)

def save_json(path, data):
    with path.open('w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

@app.route('/')
def index():
    return send_from_directory(str(BASE_DIR), 'index.html')

@app.route('/static/<path:filename>')
def static_files(filename):
    return send_from_directory(str(BASE_DIR / 'static'), filename)

@app.route('/assets/<path:filename>')
def assets_files(filename):
    # Serve images/files referenced from the root `assets/` folder.
    return send_from_directory(str(BASE_DIR / 'assets'), filename)

@app.route('/evidencias ts/<path:filename>')
def evidencias_files(filename):
    # Serve evidence images/videos referenced from the root `evidencias ts/` folder.
    return send_from_directory(str(BASE_DIR / 'evidencias ts'), filename)

@app.route('/api/projects', methods=['GET'])
def get_projects():
    projects = load_json(PROJECTS_FILE, [])
    return jsonify(projects)

@app.route('/api/contact', methods=['POST'])
def post_contact():
    data = request.get_json() or {}
    name = data.get('name')
    email = data.get('email')
    message = data.get('message')
    if not name or not email or not message:
        return jsonify({'error': 'Faltan campos requeridos'}), 400

    contacts = load_json(CONTACTS_FILE, [])
    contact = {'name': name, 'email': email, 'message': message}
    contacts.append(contact)
    save_json(CONTACTS_FILE, contacts)
    return jsonify({'status': 'ok'})

@app.route('/<path:filename>')
def root_html_files(filename):
    # Allow navigation to local project pages like `/almacen.html` when running Flask.
    if filename.endswith(('.html', '.css', '.js')):
        return send_from_directory(str(BASE_DIR), filename)
    abort(404)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
