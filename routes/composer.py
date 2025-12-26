"""
作曲家相关路由模块
"""
from flask import Blueprint, request, jsonify, send_from_directory
from models import Composer
from utils.validation import validate_required_fields, validate_string_length

composer_bp = Blueprint('composer', __name__)

@composer_bp.route('/pages/composer-management/composer-management.html')
def composer_management_page():
    """作曲家管理页面"""
    return send_from_directory('pages/composer-management', 'composer-management.html')

@composer_bp.route('/pages/composer-works/composer-works.html')
def composer_works_page():
    """作曲家作品页面"""
    return send_from_directory('pages/composer-works', 'composer-works.html')

@composer_bp.route('/api/composers', methods=['GET'])
def get_composers():
    """获取所有作曲家"""
    composer_model = Composer()
    composers = composer_model.get_all()
    return jsonify([{'id': c['id'], 'name': c['name']} for c in composers])

@composer_bp.route('/api/composers', methods=['POST'])
def add_composer():
    """添加新作曲家"""
    data = request.json
    name = data.get('name')
    
    if not name:
        return jsonify({'error': '请输入作曲家名称'}), 400
    
    composer_model = Composer()
    composer_id = composer_model.create(name)
    
    return jsonify({'id': composer_id, 'name': name, 'message': '作曲家添加成功'})

@composer_bp.route('/api/composers/<int:composer_id>', methods=['GET', 'PUT', 'DELETE'])
def composer_detail(composer_id):
    """作曲家详细信息"""
    composer_model = Composer()
    
    if request.method == 'GET':
        # 获取作曲家详情
        composer = composer_model.get_by_id(composer_id)
        if not composer:
            return jsonify({'error': '作曲家不存在'}), 404
        
        return jsonify(composer)
    
    elif request.method == 'PUT':
        # 更新作曲家
        data = request.json
        name = data.get('name')
        
        if not name:
            return jsonify({'error': '请输入作曲家名称'}), 400
        
        success = composer_model.update(composer_id, name)
        if success:
            return jsonify({'message': '作曲家信息更新成功'})
        else:
            return jsonify({'error': '更新失败'}), 500
    
    elif request.method == 'DELETE':
        # 删除作曲家
        success = composer_model.delete(composer_id)
        if success:
            return jsonify({'message': '作曲家删除成功'})
        else:
            return jsonify({'error': '删除失败'}), 500

@composer_bp.route('/api/composers/<int:composer_id>/homeworks', methods=['GET'])
def get_composer_homeworks(composer_id):
    """获取作曲家的所有作业"""
    composer_model = Composer()
    homeworks = composer_model.get_homeworks(composer_id)
    
    # 格式化输出
    formatted_homeworks = []
    for homework in homeworks:
        formatted_homeworks.append({
            'id': homework['id'],
            'content': homework['content'],
            'images': homework.get('images', ''),
            'student_name': homework.get('student_name', '未知学生'),
            'created_at': homework['created_at']
        })
    
    return jsonify(formatted_homeworks)