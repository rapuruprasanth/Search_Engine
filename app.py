import os
import math
import re
import time
import random
import sqlite3
from flask import Flask, render_template, request, jsonify, session
from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.config['SECRET_KEY'] = 'prasanthi-algo-search-secret-key-2026'

DB_PATH = "users.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

init_db()

def load_vocab():
    vocab = {}
    with open("vocab.txt", "r", encoding="utf-8", errors="ignore") as f:
        vocab_terms = f.readlines()
    with open("idf-values.txt", "r", encoding="utf-8", errors="ignore") as f:
        idf_values = f.readlines()

    for (term, idf_value) in zip(vocab_terms, idf_values):
        vocab[term.rstrip()] = int(idf_value.rstrip())

    return vocab

def load_document():
    with open("document.txt", "r", encoding="utf-8", errors="ignore") as f:
        documents = f.readlines()
    return documents

def load_inverted_index():
    inverted_index = {}
    with open('inverted_index.txt', 'r', encoding="utf-8", errors="ignore") as f:
        inverted_index_terms = f.readlines()

    for row_num in range(0, len(inverted_index_terms), 2):
        term = inverted_index_terms[row_num].strip()
        documents = inverted_index_terms[row_num+1].strip().split()
        inverted_index[term] = documents

    return inverted_index

def load_link_of_qs():
    with open("Leetcode-Questions-Scrapper/Qindex.txt", "r", encoding="utf-8", errors="ignore") as f:
        links = [line.strip() for line in f.readlines()]
    return links

vocab = load_vocab()
document = load_document()
inverted_index = load_inverted_index()
Qlink = load_link_of_qs()

def get_tf_dict(term):
    tf_dict = {}
    if term in inverted_index:
        for doc in inverted_index[term]:
            if doc not in tf_dict:
                tf_dict[doc] = 1
            else:
                tf_dict[doc] += 1

    for doc in tf_dict:
        try:
            doc_idx = int(doc) - 1
            if 0 <= doc_idx < len(document):
                doc_len = len(document[doc_idx].split())
                if doc_len > 0:
                    tf_dict[doc] /= doc_len
        except (ZeroDivisionError, ValueError, IndexError):
            pass

    return tf_dict

def get_idf_value(term):
    return math.log((1 + len(document)) / (1 + vocab[term]))

def format_title_from_url(url):
    try:
        slug = url.rstrip('/').split('/')[-1]
        words = slug.split('-')
        return ' '.join(word.capitalize() for word in words)
    except Exception:
        return "Algorithm Problem"

CATEGORY_KEYWORDS = {
    'dynamic-programming': ['dp', 'dynamic', 'programming', 'memoization', 'knapsack', 'subsequence'],
    'graph': ['graph', 'node', 'edge', 'bfs', 'dfs', 'path', 'cycle', 'tree', 'shortest'],
    'tree': ['tree', 'binary', 'bst', 'root', 'leaf', 'ancestor', 'traversal', 'depth'],
    'array': ['array', 'matrix', 'element', 'subarray', 'index', 'grid', 'vector', 'list'],
    'string': ['string', 'char', 'character', 'substring', 'palindrome', 'prefix', 'suffix', 'anagram'],
    'binary-search': ['binary', 'search', 'sorted', 'bound', 'target', 'mid'],
    'two-pointers': ['pointer', 'window', 'sliding', 'left', 'right', 'pair', 'two'],
    'greedy': ['greedy', 'min', 'max', 'optimal', 'interval', 'jump', 'profit'],
    'math': ['math', 'prime', 'digit', 'number', 'gcd', 'modulo', 'sum', 'product', 'bit']
}

def detect_categories(title, snippet_tokens):
    detected = set()
    combined_text = (title + " " + " ".join(snippet_tokens)).lower()
    for cat, keywords in CATEGORY_KEYWORDS.items():
        if any(kw in combined_text for kw in keywords):
            detected.add(cat)
    if not detected:
        detected.add('algorithm')
    return list(detected)

def get_difficulty(doc_id):
    rem = int(doc_id) % 3
    if rem == 0:
        return 'Easy'
    elif rem == 1:
        return 'Medium'
    else:
        return 'Hard'

def get_problem_snippet(doc_id):
    try:
        file_path = f"Leetcode-Questions-Scrapper/Qdata/{doc_id}/{doc_id}.txt"
        if os.path.exists(file_path):
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                lines = [line.strip() for line in f.readlines() if line.strip()]
                return " ".join(lines[:3])[:160] + "..."
    except Exception:
        pass
    return "Click to view full problem description and code template..."

def calc_docs_sorted_order(q_terms):
    potential_docs = {}
    term_matches_by_doc = {}

    for term in q_terms:
        if term not in vocab:
            continue

        tf_vals_by_docs = get_tf_dict(term)
        idf_value = get_idf_value(term)

        for doc in tf_vals_by_docs:
            score = tf_vals_by_docs[doc] * idf_value
            if doc not in potential_docs:
                potential_docs[doc] = score
                term_matches_by_doc[doc] = [term]
            else:
                potential_docs[doc] += score
                if term not in term_matches_by_doc[doc]:
                    term_matches_by_doc[doc].append(term)

    if not q_terms:
        return []

    for doc in potential_docs:
        potential_docs[doc] /= len(q_terms)

    potential_docs = dict(sorted(potential_docs.items(), key=lambda item: item[1], reverse=True))

    ans = []
    for doc_index in potential_docs:
        doc_id = int(doc_index)
        url = Qlink[doc_id - 1] if 0 <= doc_id - 1 < len(Qlink) else ""
        title = format_title_from_url(url)
        snippet = get_problem_snippet(doc_id)
        matched_terms = term_matches_by_doc.get(doc_index, [])
        categories = detect_categories(title, matched_terms)
        difficulty = get_difficulty(doc_id)

        ans.append({
            "doc_id": doc_id,
            "Question Link": url,
            "Title": title,
            "Score": round(potential_docs[doc_index], 5),
            "Snippet": snippet,
            "Categories": categories,
            "Difficulty": difficulty,
            "MatchedTerms": matched_terms
        })

    return ans

class SearchForm(FlaskForm):
    search = StringField('Enter algorithm problem topic or query')
    submit = SubmitField('Search')

@app.route("/", methods=['GET', 'POST'])
def home():
    form = SearchForm()
    results = []
    query = ""
    start_time = time.time()

    if form.validate_on_submit() and form.search.data:
        query = form.search.data.strip()
        q_terms = [term.lower() for term in query.split()]
        results = calc_docs_sorted_order(q_terms)[:50]

    latency_ms = round((time.time() - start_time) * 1000, 2)
    return render_template('index.html', form=form, results=results, query=query, latency=latency_ms)

# RESTful API Endpoints
@app.route("/api/search")
def api_search():
    query = request.args.get('q', '').strip()
    category = request.args.get('category', 'all').strip()
    limit = int(request.args.get('limit', 20))
    
    start_time = time.time()
    q_terms = [term.lower() for term in query.split()]
    results = calc_docs_sorted_order(q_terms)

    if category != 'all':
        results = [r for r in results if category in r.get('Categories', [])]

    latency = round((time.time() - start_time) * 1000, 2)
    return jsonify({
        'query': query,
        'count': len(results),
        'latency_ms': latency,
        'results': results[:limit]
    })

@app.route("/api/problem/<int:doc_id>")
def get_problem_details(doc_id):
    file_path = f"Leetcode-Questions-Scrapper/Qdata/{doc_id}/{doc_id}.txt"
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
        url = Qlink[doc_id - 1] if 0 <= doc_id - 1 < len(Qlink) else ""
        title = format_title_from_url(url)
        return jsonify({
            'doc_id': doc_id,
            'title': title,
            'url': url,
            'content': content
        })
    return jsonify({'error': 'Problem not found'}), 404

@app.route("/api/suggest")
def api_suggest():
    term = request.args.get('q', '').lower().strip()
    if not term or len(term) < 2:
        return jsonify({'suggestions': []})
    
    matches = [w for w in vocab.keys() if w.startswith(term)][:8]
    return jsonify({'suggestions': matches})

@app.route("/api/stats")
def api_stats():
    return jsonify({
        'total_docs': len(document),
        'vocab_size': len(vocab),
        'index_size': len(inverted_index),
        'status': 'online'
    })

@app.route("/api/random")
def api_random():
    random_id = random.randint(1, len(Qlink))
    url = Qlink[random_id - 1]
    title = format_title_from_url(url)
    return jsonify({
        'doc_id': random_id,
        'title': title,
        'url': url
    })

@app.route("/api/register", methods=['POST'])
def api_register():
    data = request.get_json() or {}
    username = data.get('username', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '').strip()

    if not username or not email or not password:
        return jsonify({'success': False, 'message': 'All fields are required.'}), 400

    if len(username) < 3:
        return jsonify({'success': False, 'message': 'Username must be at least 3 characters.'}), 400

    if len(password) < 6:
        return jsonify({'success': False, 'message': 'Password must be at least 6 characters.'}), 400

    password_hash = generate_password_hash(password)

    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)", (username, email, password_hash))
        conn.commit()
        user_id = cursor.lastrowid
        conn.close()

        session['user_id'] = user_id
        session['username'] = username
        session['email'] = email

        return jsonify({'success': True, 'message': 'Registration successful!', 'user': {'id': user_id, 'username': username, 'email': email}})
    except sqlite3.IntegrityError:
        return jsonify({'success': False, 'message': 'Username or Email already registered.'}), 400
    except Exception as e:
        return jsonify({'success': False, 'message': 'An error occurred during registration.'}), 500

@app.route("/api/login", methods=['POST'])
def api_login():
    data = request.get_json() or {}
    login_id = data.get('login_id', '').strip().lower()
    password = data.get('password', '').strip()

    if not login_id or not password:
        return jsonify({'success': False, 'message': 'Email/Username and password are required.'}), 400

    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("SELECT id, username, email, password_hash FROM users WHERE LOWER(email) = ? OR LOWER(username) = ?", (login_id, login_id))
        user = cursor.fetchone()
        conn.close()

        if user and check_password_hash(user[3], password):
            session['user_id'] = user[0]
            session['username'] = user[1]
            session['email'] = user[2]
            return jsonify({'success': True, 'message': 'Login successful!', 'user': {'id': user[0], 'username': user[1], 'email': user[2]}})
        else:
            return jsonify({'success': False, 'message': 'Invalid username/email or password.'}), 401
    except Exception as e:
        return jsonify({'success': False, 'message': 'An error occurred during login.'}), 500

@app.route("/api/logout", methods=['POST'])
def api_logout():
    session.clear()
    return jsonify({'success': True, 'message': 'Logged out successfully.'})

@app.route("/api/me")
def api_me():
    if 'user_id' in session:
        return jsonify({
            'authenticated': True,
            'user': {
                'id': session['user_id'],
                'username': session.get('username'),
                'email': session.get('email')
            }
        })
    return jsonify({'authenticated': False})

if __name__ == "__main__":
    app.run(debug=True, port=5000)

