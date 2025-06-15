from flask import Flask, render_template, jsonify, request
from flask_bootstrap import Bootstrap5
import os,dotenv
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import relationship, DeclarativeBase, Mapped, mapped_column
from sqlalchemy import Integer, String, Boolean
from flask_migrate import Migrate

app = Flask(__name__)

dotenv.load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv("SECRET_KEY")
Bootstrap5(app)

# CREATE DATABASE
class Base(DeclarativeBase):
    pass

app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get("DB_URI", "sqlite:///posts.db")
db = SQLAlchemy(model_class=Base)
db.init_app(app)
migrate = Migrate(app, db)

# CONFIGURE TABLES
class Task(db.Model):
    __tablename__ = "tasks"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    # Create Foreign Key, "lists.id" the lists refers to the tablename of List.
    list_id: Mapped[int] = mapped_column(Integer, db.ForeignKey("lists.id"))
    # Create reference to the List object. The "name" refers to the posts property in the List class.
    list = relationship("List", back_populates="task")
    todo: Mapped[str] = mapped_column(String(100), nullable=False)
    due_to: Mapped[str] = mapped_column(String(10))
    is_completed: Mapped[str] = mapped_column(String(5), nullable=False)
    color: Mapped[str] = mapped_column(String(10))
    highlighted: Mapped[bool] = mapped_column(Boolean, default=False)
    # Add a column for order
    order = db.Column(db.Integer, nullable=True, default=0)


class List(db.Model):
    __tablename__ = "lists"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(50), nullable=False)
    # This will act like a list of Task objects attached to each List.
    # The "list" refers to the list property in the Task class.
    task = relationship("Task", back_populates="list", cascade="all, delete-orphan") # Added cascade for proper deletion


with app.app_context():
    db.create_all()

@app.route("/")
def home():
    result = db.session.execute(db.select(List))
    lists = result.scalars().all()
    return render_template('index.html', lists=lists)

@app.route("/new_list", methods=['POST'])
def new_list():
    name = ""
    if request.method == "POST":
        name = request.form["name"]
    else:
        return jsonify({"error":"No name provided"}), 400
    new_list = List(
            name=name
        )
    db.session.add(new_list)
    db.session.commit()
    return jsonify({"success":"Added new List","name":name,"id":new_list.id})

@app.route("/api/tasks/<int:list_id>")
def get_tasks(list_id):
    tasks = Task.query.filter_by(list_id=list_id).order_by(Task.order).all()
    task_data = [{
        "id": task.id,
        "todo": task.todo,
        "due_to": task.due_to,
        "is_completed": task.is_completed,
        "highlighted": task.highlighted,
        "color": task.color,
        'order': task.order # It's good practice to send the order back too, for verification or future use
    } for task in tasks]
    return jsonify(task_data)

@app.route("/api/tasks", methods=["POST"])
def create_task():
    data = request.get_json()
    new_task = Task(
        todo=data["todo"],
        due_to=data.get("due_to", ""),
        is_completed="False",
        color=data.get("color", "#6e2a9b"),
        list_id=data["list_id"]
    )
    db.session.add(new_task)
    db.session.commit()
    return jsonify({"success": True, "id": new_task.id})

@app.route('/delete-task/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    task = Task.query.get(task_id)
    if task:
        db.session.delete(task)
        db.session.commit()
        return jsonify({'success': True})
    return jsonify({'success': False}), 404

@app.route('/edit-task/<int:task_id>', methods=['PUT'])
def edit_task(task_id):
    # task = db.session.execute(db.select(Task).where(Task.id == task_id)).scalar()
    task = Task.query.get(task_id)
    if not task:
        return jsonify({'success': False}), 404
    data = request.get_json()
    print(data)
    task.todo = data['todo']
    task.due_to = data['due_to']
    task.color = data['color']
    db.session.commit()
    return jsonify({'success': True})

@app.route('/highlight-task/<int:task_id>', methods=['PUT'])
def highlight_task(task_id):
    task = Task.query.get(task_id)
    if not task:
        return jsonify({'success': False}), 404
    task.highlighted = not task.highlighted
    db.session.commit()
    return jsonify({'success': True, 'highlighted': task.highlighted})

@app.route('/toggle-task/<int:task_id>', methods=['PUT'])
def toggle_task(task_id):
    task = Task.query.get(task_id)
    if not task:
        return jsonify({'success': False}), 404
    if task.is_completed == "True":
        task.is_completed = "False"
    else:
        task.is_completed = "True"
    db.session.commit()
    return jsonify({'success': True, 'completed': task.is_completed})

@app.route('/update_list_name/<int:list_id>', methods=['POST'])
def update_list_name(list_id):
    data = request.get_json()
    name = data.get('name', '')
    todo_list = db.session.get(List, list_id)
    if todo_list:
        todo_list.name = name
        db.session.commit()
        return jsonify(success=True)
    return jsonify(success=False), 404

@app.route('/delete_lists', methods=['POST'])
def delete_lists():
    data = request.get_json()
    ids = data.get('ids', [])
    for list_id in ids:
        todo_list = db.session.get(List, int(list_id))
        if todo_list:
            db.session.delete(todo_list)
    db.session.commit()
    return jsonify(success=True)

@app.route('/api/move_task/<int:task_id>', methods=['PUT'])
def move_task(task_id):
    task = Task.query.get(task_id)
    if not task:
        return jsonify({'success': False, 'message': 'Task not found'}), 404
    
    data = request.get_json()
    new_list_id = data.get('list_id')

    if new_list_id is None:
        return jsonify({'success': False, 'message': 'New list ID not provided'}), 400

    # Optional: Check if the new_list_id actually exists
    target_list = List.query.get(new_list_id)
    if not target_list:
        return jsonify({'success': False, 'message': 'Target list not found'}), 404

    task.list_id = new_list_id
    db.session.commit()
    return jsonify({'success': True, 'message': 'Task moved successfully'})

@app.route('/update_task_order', methods=['POST'])
def update_task_order():
    try:
        data = request.get_json()
        new_order_ids = data.get('new_order') # This will be a list of task IDs in the new order

        if not new_order_ids:
            return jsonify({'success': False, 'message': 'No new order provided'}), 400

        # Update the 'order' for each task based on its position in the new_order_ids list
        for index, task_id in enumerate(new_order_ids):
            task = Task.query.get(task_id)
            if task:
                task.order = index # Set the order to its new index
        
        db.session.commit()
        return jsonify({'success': True, 'message': 'Task order updated successfully'})

    except Exception as e:
        db.session.rollback() # Rollback changes if an error occurs
        return jsonify({'success': False, 'message': f'Error updating task order: {str(e)}'}), 500



if __name__ == '__main__':
    app.run(debug=True,port=5002)