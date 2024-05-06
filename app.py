import csv
from flask import Flask, request, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy
# from flask_cors import CORS

app = Flask(__name__)
# CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///questions.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

class Question(db.Model):
    __tablename__ = 'question'
    id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.String(50))  # 'single' or 'multiple'
    content = db.Column(db.Text, nullable=False)

class Option(db.Model):
    __tablename__ = 'option'
    id = db.Column(db.Integer, primary_key=True)
    question_id = db.Column(db.Integer, db.ForeignKey('question.id'), nullable=False)
    content = db.Column(db.String(200), nullable=False)
    is_correct = db.Column(db.Boolean, default=False)  # 标记正确答案
    question = db.relationship('Question', backref=db.backref('options', lazy=True))

def import_csv(csv_filename):
    with open(csv_filename, 'r', encoding='utf-8') as csvfile:
        # 读取第一行，以获取并处理列标题
        reader = csv.reader(csvfile)
        columns = [col.strip() for col in next(reader)]
        
        # 使用处理过的列标题创建DictReader
        csvfile.seek(0)  # 将文件指针移回文件开始处
        next(csvfile)  # 跳过第一行的原始列标题
        dict_reader = csv.DictReader(csvfile, fieldnames=columns)

        for row in dict_reader:
            # 检查题目内容是否已经存在
            existing_question = Question.query.filter_by(content=row['content'].strip()).first()
            if existing_question:
                print(f"题目已存在: {existing_question.content}")
                continue  # 如果题目已存在，则跳过此题目

            question = Question(
                type=row['type'].strip(),
                content=row['content'].strip()
            )
            db.session.add(question)
            db.session.flush()  # 刷新会话以获取新题目的ID

            # 处理选项和答案
            answers = row['answer'].strip().split(';')
            for i in range(1, 6):
                option_content = row.get(f'option{i}', '').strip()
                if option_content:  # 确保选项非空
                    option = Option(
                        question_id=question.id,
                        content=option_content,
                        is_correct=str(i).strip() in answers
                    )
                    db.session.add(option)

            db.session.commit()

@app.route('/api/search', methods=['GET'])
def search_questions():
    query_params = request.args
    question_type = query_params.get('type')
    question_content = query_params.get('content')
    option_content = query_params.get('option')

    query = Question.query

    if question_type in ['single', 'multiple']:
        query = query.filter(Question.type == question_type)
    
    if question_content:
        query = query.filter(Question.content.like(f'%{question_content}%'))
    
    if option_content:
        query = query.join(Question.options).filter(Option.content.like(f'%{option_content}%'))

    questions = query.all()
    results = []
    for question in questions:
        options = [{'content': option.content, 'is_correct': option.is_correct} for option in question.options]
        results.append({
            'id': question.id,
            'type': question.type,
            'content': question.content,
            'options': options
        })

    return jsonify(results)

@app.route('/')
def index():
    return render_template('search.html')

if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # 创建数据库表
        import_csv('data.csv')  # 导入CSV数据
    app.run(debug=True, port=1754)