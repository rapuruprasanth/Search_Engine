# 🚀 AlgoVector (Prasanthi Algo Search Engine)
> **An Advanced TF-IDF Information Retrieval (IR) Vector Search Engine for 2,181+ LeetCode Algorithm Problems.**

[![Python](https://img.shields.io/badge/Python-3.12-blue.svg)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-3.0-green.svg)](https://flask.palletsprojects.com/)
[![SQLite](https://img.shields.io/badge/SQLite3-Database-lightgrey.svg)](https://www.sqlite.org/)
[![Theme](https://img.shields.io/badge/Theme-Sherwin--Williams%20Dark-purple.svg)](#-design-system--ui-theme)
[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen.svg)](https://algo-search-engine-tf-idf.onrender.com/)

---

## 📌 Table of Contents
1. [Overview & Purpose](#-overview--purpose)
2. [Why We Created This Project](#-why-we-created-this-project)
3. [Key Features](#-key-features)
4. [Technology Stack](#-technology-stack)
5. [Mathematical Formulation (TF-IDF)](#-mathematical-formulation-tf-idf)
6. [Repository & Directory Structure](#-repository--directory-structure)
7. [Installation & Local Setup](#-installation--local-setup)
8. [Design System & UI Theme](#-design-system--ui-theme)
9. [Technical Interview Questions & Detailed Answers](#-technical-interview-questions--detailed-answers)
10. [License & Acknowledgments](#-license--acknowledgments)

---

## 📖 Overview & Purpose

**AlgoVector** (formerly *Prasanthi Algo Search Engine*) is a specialized **Information Retrieval (IR) Search System** engineered to search, rank, and explore over **2,181+ LeetCode algorithm problems** in sub-millisecond execution times. 

Unlike generic keyword search engines that rely on simple substring matching, **AlgoVector** utilizes a mathematical **Vector Space Model (VSM)** powered by **Term Frequency-Inverse Document Frequency (TF-IDF)** to calculate statistical term relevance scores for every indexed document against user queries.

---

## 💡 Why We Created This Project

### The Problem with Traditional Code Search
1. **Keyword Overlap & Noise**: Standard search algorithms treat all matching words equally. Searching for `"find dynamic programming path"` in simple regex search yields thousands of irrelevant matches because common words like `"find"` or `"path"` dilute the actual focus on `"dynamic programming"`.
2. **Lack of Importance Weighting**: Words that appear everywhere in computer science literature (e.g., `"array"`, `"value"`, `"return"`) carry far less discriminatory power than specialized domain terms (e.g., `"memoization"`, `"subsequence"`, `"dijkstra"`).
3. **Execution Latency**: Querying databases via unindexed `LIKE '%query%'` SQL operations scales linearly ($O(N \cdot M)$), making real-time search sluggish.

### The Solution: AlgoVector IR Engine
- **Inverted Index Data Structure**: Inverted token mapping enables $O(K)$ candidate document lookup where $K$ is query length.
- **Statistical Weighting**: Ranks problems by term specificity using Logarithmic IDF scaling.
- **Developer-Centric UX**: Integrates problem description readers, starter Python templates, mathematical score explainers, bookmarking, and user authentication.

---

## ✨ Key Features

### 1. 🔍 Sub-Millisecond TF-IDF Vector Search
- Real-time relevance score calculations across **7,826 vocabulary terms** and **2,181 algorithm documents**.
- Instant search latency (< 5ms average response time).

### 2. 🔐 Built-in User Authentication (SQLite)
- Secure User Registration and Login system backed by `sqlite3` database (`users.db`).
- Industry-standard password hashing using `werkzeug.security` (`pbkdf2:sha256`).
- Session persistence (`session['user_id']`) across page navigation.

### 3. 🎨 Sherwin-Williams (SW) Sleek Dark Palette
- Aesthetic UI designed with curated Sherwin-Williams paint colors:
  - **Tricorn Black (`SW 6258` / `#2B2B2C`)**: Deep background pitch & code containers.
  - **Black Swan (`SW 6279` / `#3B2E35`)**: Header bar, sidebars, cards, and modal dialogs.
  - **Blackberry (`SW 7577` / `#4A2E3B`)**: Buttons, matched tags, active tabs, and highlights.
  - **River Rock (`SW 6026` / `#6D645E`)**: Borders, icons, metadata labels, and subtle text.

### 4. 🚫 Dark Color-Scheme Search Input (Zero White Boxes)
- Search input configured with `color-scheme: dark !important` and WebKit autofill inset shadow overrides.
- Eliminates standard browser white background boxes during typing and autocomplete focus.

### 5. 🧮 Interactive Math Explainer Modal
- Click **"Math"** on any problem card to view the step-by-step TF-IDF vector score calculation matrix, including term-by-term TF, IDF, and product weights.

### 6. 📖 Problem Statement & Python Boilerplate Reader
- Click **"Read Problem"** to open a full modal containing formatted problem descriptions, examples, constraints, and ready-to-copy Python 3 starter templates.

### 7. 🏷️ Multi-Filter & Saved Bookmarks Drawer
- Filter by topic categories (*Dynamic Programming, Graphs, Trees, Arrays, Strings, Binary Search, Two Pointers, Greedy, Math*) or difficulty (*Easy, Medium, Hard*).
- Save problems to local storage bookmarks drawer with one click.

---

## 🛠️ Technology Stack

| Layer | Technology Used | Description |
| :--- | :--- | :--- |
| **Backend Framework** | `Python 3.12`, `Flask` | Lightweight WSGI web framework for route management & API endpoints |
| **Authentication & DB** | `SQLite3`, `Werkzeug Security` | Serverless database (`users.db`) with `pbkdf2:sha256` password hashing |
| **Forms & Security** | `Flask-WTF`, `WTForms` | CSRF-protected form handling and input validation |
| **Frontend Core** | `HTML5`, `Vanilla CSS3` | Semantic HTML with custom CSS CSS variables & responsive layout |
| **Frontend Scripting** | `Vanilla JavaScript (ES6+)` | Asynchronous Fetch API, DOM manipulation, state management |
| **Typography & Icons** | `Google Fonts`, `FontAwesome 6` | Syne (Brand), Inter (Body), Outfit (Headings), JetBrains Mono (Code) |
| **Math Rendering** | `KaTeX / MathJax` | Math equation formatting for vector formulas |
| **Search Engine Core** | Custom TF-IDF Indexer | Built with inverted index, vocabulary dictionary, and precomputed IDF tables |

---

## 📐 Mathematical Formulation (TF-IDF)

The relevance of a document $d$ for a query $Q = \{t_1, t_2, \dots, t_n\}$ is computed using the **Vector Space Model (VSM)** formula:

### 1. Term Frequency (TF)
$$\text{TF}(t, d) = \frac{\text{Count of term } t \text{ in document } d}{\text{Total number of words in document } d}$$

### 2. Inverse Document Frequency (IDF)
$$\text{IDF}(t) = \ln\left( \frac{1 + N}{1 + \text{DF}(t)} \right)$$
*Where $N = 2,181$ (total documents), and $\text{DF}(t)$ is the document frequency of term $t$.*

### 3. Final Relevance Score
$$\text{Score}(d, Q) = \frac{1}{|Q|} \sum_{t \in Q} \left( \text{TF}(t, d) \times \text{IDF}(t) \right)$$

---

## 📁 Repository & Directory Structure

```
Algo-Search-Engine-TF-IDF/
│
├── app.py                          # Primary Flask Application & API Routes
├── document.txt                    # Full corpus text of 2,181 algorithm problems
├── vocab.txt                       # 7,826 unique vocabulary terms
├── idf-values.txt                  # Precomputed IDF values for vocabulary terms
├── inverted_index.txt              # Term-to-Document mapping (Inverted Index)
├── users.db                        # SQLite database for User Authentication
├── prepare.py                      # Offline preprocessing script for Index generation
├── README.md                       # Documentation & Project Guide
│
├── static/                         # Static Assets
│   ├── style.css                   # Custom CSS styling with Sherwin-Williams Dark Palette
│   └── app.js                      # Client-side JavaScript (Fetch API, Modals, Auth)
│
├── templates/                      # Jinja2 Templates
│   └── index.html                  # Main Application Dashboard & Auth Modal UI
│
└── LeetCode-Questions-Scrapper/    # Dataset & Problem Statements
    ├── Qindex.txt                  # Problem URLs index
    └── Qdata/                      # Problem text files indexed by doc_id (1..2181)
        ├── 1/
        │   └── 1.txt
        ├── 2/
        └── ...
```

---

## ⚡ Installation & Local Setup

### Prerequisites
- Python 3.8+ installed on your system.

### Step-by-Step Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/rapuruprasanth/Search_Engine.git
   cd Algo-Search-Engine-TF-IDF
   ```

2. **Create and Activate a Virtual Environment**
   ```bash
   # Windows (PowerShell)
   python -m venv venv
   .\venv\Scripts\Activate.ps1

   # macOS / Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install Dependencies**
   ```bash
   pip install flask flask-wtf werkzeug
   ```

4. **Run the Application**
   ```bash
   python app.py
   ```

5. **Access in Browser**
   Open your browser and navigate to:
   ```
   http://127.0.0.1:5000
   ```

---

## 🎨 Design System & UI Theme

The interface implements a custom **Sherwin-Williams (SW)** dark aesthetic:

| Color Name | Hex Code | UI Component Mapping |
| :--- | :--- | :--- |
| **Tricorn Black (`SW 6258`)** | `#2B2B2C` | Main outer canvas, search input background, code containers |
| **Black Swan (`SW 6279`)** | `#3B2E35` | Header bar, sidebar navigation, result cards, modal containers |
| **Blackberry (`SW 7577`)** | `#4A2E3B` | Search button, matched tags, active menu items, hover highlights |
| **River Rock (`SW 6026`)** | `#6D645E` | Card borders, secondary icons, difficulty pills, muted text |

---

## ❓ Technical Interview Questions & Detailed Answers

Here are key technical interview questions about this project, along with expert answers covering Information Retrieval, Database Design, System Architecture, and Algorithms:

### Q1: What is an Inverted Index and why is it essential for this search engine?
**Answer**:
An **Inverted Index** is a mapping from tokens (words) to the document IDs containing those words (`term -> [doc_1, doc_2, ...]`). 
- **Without an Inverted Index**: A search engine would have to scan every single document word-by-word ($O(N \cdot M)$ time complexity), which is unacceptably slow.
- **With an Inverted Index**: Searching for query terms reduces to a dictionary lookup ($O(1)$) followed by retrieving only the relevant document IDs ($O(K)$), improving query latency from seconds to milliseconds.

---

### Q2: Why use TF-IDF instead of simple word frequency or Boolean search?
**Answer**:
- **Boolean Search** (`AND`/`OR`) treats all terms binary (present or absent), ignoring term importance and relevance ordering.
- **Simple Word Frequency (TF)** penalizes short documents and favors documents that repeat common filler words like `"the"`, `"and"`, or `"array"`.
- **TF-IDF** balances term frequency with term rarety across the entire dataset:
  - Common words receive low IDF weights.
  - Rare, high-signal terms (e.g., `"dijkstra"`, `"knapsack"`, `"trie"`) receive high IDF weights, ensuring that documents containing specific technical terms rank at the top.

---

### Q3: How is user authentication implemented securely in this Flask app?
**Answer**:
- **Password Hashing**: User passwords are stored using Werkzeug's `generate_password_hash()`, which uses **PBKDF2 with SHA-256** and random salt generation. Raw passwords are never stored in plaintext.
- **Database**: SQLite3 (`users.db`) with parameterized SQL queries (`?`) to prevent **SQL Injection** attacks.
- **Session Persistence**: Uses Flask's signed cookie sessions (`session['user_id']`) secured with a secret key (`SECRET_KEY`).

---

### Q4: How does the application prevent browser default white background popups on the search input?
**Answer**:
- Set `color-scheme: dark !important;` across document roots and inputs in CSS.
- Applied `-webkit-box-shadow` inset fill overrides on input `:autofill` states.
- Disabled native browser WebKit search decoration styles.
- Explicitly set `autocomplete="off"`, `autocorrect="off"`, `autocapitalize="off"`, and `spellcheck="false"` in the HTML search form markup.

---

### Q5: How would you scale this search engine to handle 10,000,000 documents?
**Answer**:
1. **Sharding / Partitioning**: Split the Inverted Index across multiple nodes using **Term Partitioning** (each node holds a subset of vocabulary terms) or **Document Partitioning** (each node holds a subset of documents).
2. **In-Memory Caching (Redis)**: Cache frequent search queries and autocomplete suggestions in a distributed Redis cache.
3. **BM25 / Cosine Similarity**: Upgrade relevance scoring to **BM25 (Best Matching 25)** to prevent document length saturation.
4. **Vector Database / Embedding Search**: Combine TF-IDF sparse retrieval with dense vector embeddings (e.g., FAISS, Pinecone) for semantic neural search.

---

## 📜 License & Acknowledgments

- **Dataset**: Scrapped algorithm problems from LeetCode.
- **Author**: **Rapuru Prasanth** ([GitHub](https://github.com/rapuruprasanth))
- **License**: MIT License - Free to use and modify for learning and development.
