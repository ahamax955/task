"""
作业相关路由模块
"""
from flask import Blueprint, request, jsonify, send_from_directory, current_app
from models import Homework
from utils.file_utils import allowed_file, handle_image_upload

homework_bp = Blueprint('homework', __name__)

@homework_bp.route('/pages/edit-homework/edit-homework.html')
def edit_homework_page():
    """作业编辑页面"""
    return send_from_directory('pages/edit-homework', 'edit-homework.html')

@homework_bp.route('/pages/student-homework-list/student-homework-list.html')
def student_homework_list_page():
    """学生作业列表页面"""
    return send_from_directory('pages/student-homework-list', 'student-homework-list.html')

@homework_bp.route('/api/homeworks', methods=['GET'])
def get_homeworks():
    """获取所有作业"""
    homework_model = Homework()
    homeworks = homework_model.get_all()
    
    # 格式化输出
    formatted_homeworks = []
    for homework in homeworks:
        formatted_homeworks.append({
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
    
    return jsonify(formatted_homeworks)

@homework_bp.route('/api/homeworks/<int:homework_id>', methods=['GET'])
def get_homework_detail(homework_id):
    """获取作业详情"""
    homework_model = Homework()
    homework = homework_model.get_by_id(homework_id)
    
    if not homework:
        return jsonify({'error': '作业不存在'}), 404
    
    # 格式化输出
    formatted_homework = {
        'id': homework['id'],
        'content': homework['content'],
        'images': homework.get('images', '').split(',') if homework.get('images') else [],
        'composer_id': homework.get('composer_id'),
        'composer_name': homework.get('composer_name', ''),
        'student_id': homework.get('student_id'),
        'student_name': homework.get('student_name', ''),
        'description': homework.get('description', ''),
        'created_at': homework['created_at']
    }
    
    return jsonify(formatted_homework)

@homework_bp.route('/api/homeworks', methods=['POST'])
def add_homework():
    """添加新作业"""
    # 检查是否是表单提交（包含文件上传）还是JSON提交
    if request.content_type and 'multipart/form-data' in request.content_type:
        # 表单提交，包含文件上传
        content = request.form.get('content')  # 作业标题
        student_id = request.form.get('student_id')
        composer_id = request.form.get('composer_id', None)
        description = request.form.get('description', '')
        
        # 处理文件上传
        image_filenames = handle_image_upload(request.files, current_app.config['UPLOAD_FOLDER'])
        images_str = ','.join(image_filenames) if image_filenames else None
        
    else:
        # JSON提交，不包含文件上传
        data = request.get_json()
        content = data.get('content')
        student_id = data.get('student_id')
        composer_id = data.get('composer_id', None)
        description = data.get('description', '')
        images_str = None
    
    # 验证必填字段
    if not content or not student_id:
        return jsonify({'error': '作业内容和学生ID是必填项'}), 400
    
    homework_model = Homework()
    homework_id = homework_model.create(
        content=content,
        composer_id=composer_id,
        student_id=student_id,
        images=images_str,
        description=description
    )
    
    return jsonify({'success': True, 'homework_id': homework_id, 'message': '作业添加成功'})

@homework_bp.route('/api/homeworks/<int:homework_id>', methods=['PUT'])
def update_homework(homework_id):
    """更新作业"""
    content = request.form.get('content')
    composer_id = request.form.get('composer_id', None)
    student_id = request.form.get('student_id')
    description = request.form.get('description', '')
    
    if not homework_id or not content or not student_id:
        return jsonify({'error': '缺少必要参数'}), 400
    
    homework_model = Homework()
    
    # 处理新上传的图片
    new_image_filenames = handle_image_upload(request.files, current_app.config['UPLOAD_FOLDER'])
    
    # 获取当前作业的图片列表
    current_homework = homework_model.get_by_id(homework_id)
    if not current_homework:
        return jsonify({'error': '作业不存在'}), 404
    
    # 合并现有图片和新图片
    current_images = current_homework.get('images', '').split(',') if current_homework.get('images') else []
    current_images = [img.strip() for img in current_images if img.strip()]
    
    all_images = current_images + new_image_filenames
    images_str = ','.join(all_images) if all_images else None
    
    # 更新作业
    success = homework_model.update(
        homework_id=homework_id,
        content=content,
        composer_id=composer_id,
        student_id=student_id,
        images=images_str,
        description=description
    )
    
    if success:
        return jsonify({'success': True})
    else:
        return jsonify({'error': '更新失败'}), 500

@homework_bp.route('/api/homeworks/<int:homework_id>/images', methods=['DELETE'])
def remove_homework_image(homework_id):
    """移除作业图片"""
    data = request.get_json()
    image_name = data.get('image_name')
    
    if not image_name:
        return jsonify({'error': '缺少必要参数'}), 400
    
    homework_model = Homework()
    
    # 获取当前作业的图片列表
    homework = homework_model.get_by_id(homework_id)
    if not homework or not homework.get('images'):
        return jsonify({'error': '作业不存在或无图片'}), 404
    
    # 移除指定图片
    images = homework['images'].split(',')
    images = [img.strip() for img in images if img.strip() != image_name]
    
    # 更新数据库
    images_str = ','.join(images) if images else None
    homework_model.update_images(homework_id, images_str)
    
    # 删除物理文件
    image_path = os.path.join(current_app.config['UPLOAD_FOLDER'], image_name)
    if os.path.exists(image_path):
        os.remove(image_path)
    
    return jsonify({'success': True})

@homework_bp.route('/api/students/<int:student_id>/homeworks', methods=['GET'])
def get_student_homeworks(student_id):
    """获取学生的所有作业"""
    from models import Student
    student_model = Student()
    homeworks = student_model.get_homeworks(student_id)
    
    # 格式化输出
    formatted_homeworks = []
    for homework in homeworks:
        formatted_homeworks.append({
            'id': homework['id'],
            'content': homework['content'],
            'images': homework.get('images', '').split(',') if homework.get('images') else [],
            'composer_name': homework.get('composer_name', '未知作曲家'),
            'created_at': homework['created_at']
        })
    
    return jsonify(formatted_homeworks)

@homework_bp.route('/api/composers/<int:composer_id>/homeworks', methods=['GET'])
def get_composer_homeworks(composer_id):
    """获取作曲家的所有作业"""
    from models import Composer
    composer_model = Composer()
    homeworks = composer_model.get_homeworks(composer_id)
    
    # 格式化输出
    formatted_homeworks = []
    for homework in homeworks:
        formatted_homeworks.append({
            'id': homework['id'],
            'content': homework['content'],
            'images': homework.get('images', '').split(',') if homework.get('images') else [],
            'student_name': homework.get('student_name', '未知学生'),
            'created_at': homework['created_at']
        })
    
    return jsonify(formatted_homeworks)

@homework_bp.route('/api/homeworks/<int:homework_id>', methods=['DELETE'])
def delete_homework(homework_id):
    """删除作业"""
    homework_model = Homework()
    
    # 获取作业信息（用于删除图片文件）
    homework = homework_model.get_by_id(homework_id)
    if not homework:
        return jsonify({'error': '作业不存在'}), 404
    
    # 删除数据库记录
    success = homework_model.delete(homework_id)
    if not success:
        return jsonify({'error': '删除失败'}), 500
    
    # 删除相关的图片文件
    if homework.get('images'):
        import os
        images = homework['images'].split(',')
        for image_name in images:
            image_name = image_name.strip()
            if image_name:
                image_path = os.path.join(current_app.config['UPLOAD_FOLDER'], image_name)
                if os.path.exists(image_path):
                    try:
                        os.remove(image_path)
                    except Exception as e:
                        print(f"删除图片文件失败: {image_path}, 错误: {e}")
    
    return jsonify({'success': True, 'message': '作业删除成功'})