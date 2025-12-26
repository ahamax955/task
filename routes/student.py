"""
学生相关路由模块
"""
from flask import Blueprint, request, jsonify, send_from_directory
from models import Student

student_bp = Blueprint('student', __name__)

@student_bp.route('/pages/student-management/student-management.html')
def student_management_page():
    """学生管理页面"""
    return send_from_directory('pages/student-management', 'student-management.html')

@student_bp.route('/pages/student-homework-list/student-homework-list.html')
def student_homework_list_page():
    """学生作业列表页面"""
    return send_from_directory('pages/student-homework-list', 'student-homework-list.html')

@student_bp.route('/api/students', methods=['GET'])
def get_students():
    """获取所有学生"""
    student_model = Student()
    students = student_model.get_all()
    return jsonify(students)

@student_bp.route('/api/students', methods=['POST'])
def add_student():
    """添加新学生"""
    data = request.json
    name = data.get('name')
    
    if not name:
        return jsonify({'error': '请输入学生名称'}), 400
    
    student_model = Student()
    student_id = student_model.create(
        name=name,
        age=data.get('age'),
        grade=data.get('grade'),
        instrument=data.get('instrument'),
        phone=data.get('phone')
    )
    
    return jsonify({'id': student_id, 'name': name})

@student_bp.route('/api/students/<int:student_id>', methods=['GET', 'PUT', 'DELETE'])
def student_detail(student_id):
    """学生详细信息"""
    student_model = Student()
    
    if request.method == 'GET':
        # 获取学生详情
        student = student_model.get_by_id(student_id)
        if not student:
            return jsonify({'error': '学生不存在'}), 404
        
        return jsonify(student)
    
    elif request.method == 'PUT':
        # 更新学生
        data = request.json
        name = data.get('name')
        
        if not name:
            return jsonify({'error': '请输入学生名称'}), 400
        
        success = student_model.update(
            student_id=student_id,
            name=name,
            age=data.get('age'),
            grade=data.get('grade'),
            instrument=data.get('instrument'),
            phone=data.get('phone')
        )
        
        if success:
            return jsonify({'success': True})
        else:
            return jsonify({'error': '更新失败'}), 500
    
    elif request.method == 'DELETE':
        # 删除学生
        success = student_model.delete(student_id)
        if success:
            return jsonify({'message': '学生删除成功'})
        else:
            return jsonify({'error': '删除失败'}), 500