# todo-list-py

A simple and effective To-Do List application built with Python.

## Features

- Add, edit, and delete tasks
- Mark tasks as completed or pending
- View all tasks in a list
- Simple and clean command-line interface (CLI)
- Lightweight and easy to set up

## Getting Started

### Prerequisites

- Python 3.7 or above

### Installation

1. **Clone this repository:**
   ```bash
   git clone https://github.com/blainesilva16/todo-list-py.git
   cd todo-list-py
   ```

2. **(Optional) Create and activate a virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

   The main dependencies are:
   - Flask
   - Flask-SQLAlchemy
   - dotenv
   - SQLAlchemy
   - Bootstrap-Flask
   - Flask-Migrate

   (See `requirements.txt` for the full list and versions.)

### Usage

1. **Run the application:**
   ```bash
   python main.py
   ```

2. **Open your browser:**  
   Navigate to `http://127.0.0.1:5000/` to start using your To-Do List app.

3. **Using the App:**
   - Add new tasks through the interface
   - Mark tasks as completed or delete them
   - View your list of pending and completed tasks

## Project Structure

```
todo-list-py/
├── main.py
├── requirements.txt
├── README.md
├── .gitignore
├── static/
│   └── [static files, e.g., CSS, JS, images]
├── templates/
│   └── [HTML templates]
```

- `main.py`: Main application file, contains the entry-point and routes.
- `requirements.txt`: List of required Python dependencies.
- `static/`: Static assets such as CSS and JavaScript.
- `templates/`: HTML template files for rendering the UI.

## Contributing

Contributions are welcome!  
Please open an issue or submit a pull request for improvements or bug fixes.

## License

This project is licensed under the MIT License.

---

Made with ❤️ by [@blainesilva16](https://github.com/blainesilva16)
