"""
主应用文件 - 集成所有模块
"""
from flask import Flask, send_from_directory, request, jsonify
import os
from database import create_tables

# 创建Flask应用实例
app = Flask(__name__)

# 配置应用
app.config['UPLOAD_FOLDER'] = 'static/uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB

# 创建上传文件夹（如果不存在）
upload_folder = app.config['UPLOAD_FOLDER']
if not os.path.exists(upload_folder):
    os.makedirs(upload_folder)

# 导入并注册所有路由蓝图
from routes.composer import composer_bp
from routes.student import student_bp
from routes.homework import homework_bp
from routes.work import work_bp

# 注册蓝图
app.register_blueprint(composer_bp)
app.register_blueprint(student_bp)
app.register_blueprint(homework_bp)
app.register_blueprint(work_bp)

# 静态文件服务路由
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    """图片访问路由"""
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/static/<filename>')
def serve_static(filename):
    """静态文件服务路由"""
    return send_from_directory('static', filename)

# 主页路由
@app.route('/')
def index():
    """主页"""
    return send_from_directory('pages', 'main.html')

# 公共页面路由
@app.route('/pages/detail/detail.html')
def detail_page():
    """详情页面"""
    return send_from_directory('pages/detail', 'detail.html')

@app.route('/pages/main.html')
def main_page():
    """主页面"""
    return send_from_directory('pages', 'main.html')

# 静态文件路由
@app.route('/css/pages/<filename>')
def css_pages(filename):
    """CSS文件路由"""
    return send_from_directory('css/pages', filename)

@app.route('/js/pages/<filename>')
def js_pages(filename):
    """JS文件路由"""
    return send_from_directory('js/pages', filename)

@app.route('/css/common.css')
def common_css():
    """公共CSS文件"""
    return send_from_directory('css', 'common.css')

@app.route('/js/common.js')
def common_js():
    """公共JS文件"""
    return send_from_directory('js', 'common.js')

@app.route('/js/common/<filename>')
def js_common(filename):
    """公共JS文件路由"""
    return send_from_directory('js/common', filename)

# 数据聚合API
@app.route('/api/data', methods=['GET'])
def get_all_data():
    """获取所有数据（作业、作品、学生、作曲家）"""
    from models import Homework, Work, Student, Composer
    
    # 获取所有数据
    homeworks = Homework().get_all()
    works = Work().get_all()
    students = Student().get_all()
    composers = Composer().get_all()
    
    # 格式化数据
    formatted_data = {
        'homeworks': [],
        'works': [],
        'students': [],
        'composers': []
    }
    
    # 格式化作业数据
    for homework in homeworks:
        formatted_data['homeworks'].append({
            'id': homework['id'],
            'content': homework['content'],
            'images': homework.get('images', '').split(',') if homework.get('images') else [],
            'composer_id': homework.get('composer_id'),
            'composer_name': homework.get('composer_name', ''),
            'student_id': homework.get('student_id'),
            'student_name': homework.get('student_name', ''),
            'description': homework.get('description', ''),
            'created_at': homework['created_at']
        })
    
    # 格式化作品数据
    for work in works:
        formatted_data['works'].append({
            'id': work['id'],
            'title': work['title'],
            'difficulty': work.get('difficulty', ''),
            'description': work.get('description', ''),
            'images': work.get('images', '').split(',') if work.get('images') else [],
            'composer_id': work.get('composer_id'),
            'composer_name': work.get('composer_name', ''),
            'created_at': work['created_at']
        })
    
    # 格式化学生数据
    formatted_data['students'] = students
    
    # 格式化作曲家数据
    formatted_data['composers'] = [{'id': c['id'], 'name': c['name']} for c in composers]
    
    return formatted_data

# 数据插入API
@app.route('/api/insert', methods=['POST'])
def insert_data():
    """插入新数据（向后兼容）"""
    data = request.get_json()
    item_type = data.get('type')
    
    if item_type == 'composer':
        from routes.composer import add_composer
        return add_composer()
    elif item_type == 'student':
        from routes.student import add_student
        return add_student()
    elif item_type == 'homework':
        from routes.homework import add_homework
        return add_homework()
    elif item_type == 'work':
        from routes.work import add_work
        return add_work()
    else:
        return jsonify({'error': '不支持的数据类型'}), 400

# 移除图片API
@app.route('/api/remove-image', methods=['POST'])
def remove_image():
    """移除图片（向后兼容）"""
    data = request.get_json()
    item_type = data.get('type')
    item_id = data.get('id')
    image_name = data.get('image_name')
    
    if item_type == 'work':
        from routes.work import remove_work_image
        return remove_work_image(item_id)
    elif item_type == 'homework':
        from routes.homework import remove_homework_image
        return remove_homework_image(item_id)
    else:
        return jsonify({'error': '不支持的项目类型'}), 400

if __name__ == '__main__':
    # 初始化数据库
    try:
        create_tables()
        print("数据库初始化成功")
    except Exception as e:
        print(f"数据库初始化失败: {e}")
    
    # 启动应用
    app.run(host='0.0.0.0', port=5000, debug=True)