"""
作品相关路由模块
"""
from flask import Blueprint, request, jsonify, send_from_directory, current_app
from models import Work
from utils.file_utils import allowed_file, handle_image_upload

work_bp = Blueprint('work', __name__)

@work_bp.route('/pages/edit-work/edit-work.html')
def edit_work_page():
    """作品编辑页面"""
    return send_from_directory('pages/edit-work', 'edit-work.html')

@work_bp.route('/pages/work-detail/work-detail.html')
def work_detail_page():
    """作品详情页面"""
    return send_from_directory('pages/work-detail', 'work-detail.html')

@work_bp.route('/api/works', methods=['GET'])
def get_all_works():
    """获取所有作品"""
    work_model = Work()
    works = work_model.get_all()
    
    # 格式化输出
    formatted_works = []
    for work in works:
        formatted_works.append({
            'id': work['id'],
            'title': work['title'],
            'difficulty': work.get('difficulty', ''),
            'description': work.get('description', ''),
            'images': work.get('images', '').split(',') if work.get('images') else [],
            'composer_id': work.get('composer_id'),
            'composer_name': work.get('composer_name', ''),
            'created_at': work['created_at']
        })
    
    return jsonify(formatted_works)

@work_bp.route('/api/works/grouped', methods=['GET'])
def get_all_works_grouped():
    """获取所有作品，按作曲家分组"""
    work_model = Work()
    grouped_works = work_model.get_all_grouped()
    
    # 格式化输出
    formatted_grouped_works = {}
    for composer_name, works in grouped_works.items():
        formatted_grouped_works[composer_name] = []
        for work in works:
            formatted_grouped_works[composer_name].append({
                'id': work['id'],
                'title': work['title'],
                'difficulty': work.get('difficulty', ''),
                'description': work.get('description', ''),
                'images': work.get('images', '').split(',') if work.get('images') else [],
                'created_at': work['created_at']
            })
    
    return jsonify(formatted_grouped_works)

@work_bp.route('/api/works/<int:work_id>', methods=['GET'])
def get_work_detail(work_id):
    """获取作品详情"""
    work_model = Work()
    work = work_model.get_by_id(work_id)
    
    if not work:
        return jsonify({'error': '作品不存在'}), 404
    
    # 格式化输出
    formatted_work = {
        'id': work['id'],
        'title': work['title'],
        'difficulty': work.get('difficulty', ''),
        'description': work.get('description', ''),
        'images': work.get('images', '').split(',') if work.get('images') else [],
        'composer_id': work.get('composer_id'),
        'composer_name': work.get('composer_name', ''),
        'created_at': work['created_at']
    }
    
    return jsonify(formatted_work)

@work_bp.route('/api/composers/<int:composer_id>/works', methods=['GET'])
def get_composer_works(composer_id):
    """获取作曲家的所有作品"""
    from models import Composer
    composer_model = Composer()
    works = composer_model.get_works(composer_id)
    
    # 格式化输出
    formatted_works = []
    for work in works:
        formatted_works.append({
            'id': work['id'],
            'title': work['title'],
            'description': work.get('description', ''),
            'difficulty': work.get('difficulty', ''),
            'images': work.get('images', '').split(',') if work.get('images') else [],
            'created_at': work['created_at']
        })
    
    return jsonify(formatted_works)

@work_bp.route('/api/works', methods=['POST'])
def add_work():
    """添加新作品"""
    # 检查是否是表单提交（包含文件上传）还是JSON提交
    if request.content_type and 'multipart/form-data' in request.content_type:
        # 表单提交，包含文件上传
        title = request.form.get('title')
        composer_id = request.form.get('composer_id')
        difficulty = request.form.get('difficulty', '')
        description = request.form.get('description', '')
        
        # 处理文件上传
        image_filenames = handle_image_upload(request.files, current_app.config['UPLOAD_FOLDER'])
        images_str = ','.join(image_filenames) if image_filenames else None
        
    else:
        # JSON提交，不包含文件上传
        data = request.get_json()
        title = data.get('title')
        composer_id = data.get('composer_id')
        difficulty = data.get('difficulty', '')
        description = data.get('description', '')
        images_str = data.get('images')  # 图片数组，转换为JSON字符串存储
    
    if not title:
        return jsonify({'error': '请输入作品标题'}), 400
    
    if not composer_id:
        return jsonify({'error': '请选择作曲家'}), 400
    
    work_model = Work()
    work_id = work_model.create(
        title=title,
        composer_id=composer_id,
        difficulty=difficulty,
        description=description,
        images=images_str
    )
    
    return jsonify({'success': True, 'work_id': work_id, 'message': '作品添加成功'})

@work_bp.route('/api/works/<int:work_id>', methods=['PUT'])
def update_work(work_id):
    """更新作品"""
    data = request.get_json()
    title = data.get('title')
    difficulty = data.get('difficulty', '')
    description = data.get('description', '')
    
    if not title:
        return jsonify({'error': '请输入作品标题'}), 400
    
    work_model = Work()
    success = work_model.update(
        work_id=work_id,
        title=title,
        difficulty=difficulty,
        description=description
    )
    
    if success:
        return jsonify({'success': True})
    else:
        return jsonify({'error': '更新失败'}), 500

@work_bp.route('/api/works/<int:work_id>', methods=['DELETE'])
def delete_work(work_id):
    """删除作品"""
    work_model = Work()
    
    # 先获取作品的图片信息，删除文件
    work = work_model.get_by_id(work_id)
    if work and work.get('images'):
        # 删除相关图片文件
        image_names = work['images'].split(',')
        for image_name in image_names:
            image_name = image_name.strip()
            if image_name:
                image_path = os.path.join(current_app.config['UPLOAD_FOLDER'], image_name)
                if os.path.exists(image_path):
                    os.remove(image_path)
    
    # 删除作品记录
    success = work_model.delete(work_id)
    
    if success:
        return jsonify({'success': True})
    else:
        return jsonify({'error': '删除失败'}), 500

@work_bp.route('/api/works/<int:work_id>/images', methods=['DELETE'])
def remove_work_image(work_id):
    """移除作品图片"""
    data = request.get_json()
    image_name = data.get('image_name')
    
    if not image_name:
        return jsonify({'error': '缺少必要参数'}), 400
    
    work_model = Work()
    
    # 获取当前作品的图片列表
    work = work_model.get_by_id(work_id)
    if not work or not work.get('images'):
        return jsonify({'error': '作品不存在或无图片'}), 404
    
    # 移除指定图片
    images = work['images'].split(',')
    images = [img.strip() for img in images if img.strip() != image_name]
    
    # 更新数据库
    images_str = ','.join(images) if images else None
    work_model.update_images(work_id, images_str)
    
    # 删除物理文件
    image_path = os.path.join(current_app.config['UPLOAD_FOLDER'], image_name)
    if os.path.exists(image_path):
        os.remove(image_path)
    
    return jsonify({'success': True})

@work_bp.route('/api/works/<int:work_id>/update', methods=['POST'])
def update_work_api(work_id):
    """更新作品API（表单提交）"""
    title = request.form.get('title')
    difficulty = request.form.get('difficulty', '')
    description = request.form.get('description', '')
    
    if not work_id or not title:
        return jsonify({'error': '缺少必要参数'}), 400
    
    work_model = Work()
    
    # 处理新上传的图片
    new_image_filenames = handle_image_upload(request.files, current_app.config['UPLOAD_FOLDER'])
    
    # 获取当前作品的图片列表
    current_work = work_model.get_by_id(work_id)
    if not current_work:
        return jsonify({'error': '作品不存在'}), 404
    
    # 合并现有图片和新图片
    current_images = current_work.get('images', '').split(',') if current_work.get('images') else []
    current_images = [img.strip() for img in current_images if img.strip()]
    
    all_images = current_images + new_image_filenames
    images_str = ','.join(all_images) if all_images else None
    
    # 更新作品
    success = work_model.update(
        work_id=work_id,
        title=title,
        difficulty=difficulty,
        description=description,
        images=images_str
    )
    
    if success:
        return jsonify({'success': True})
    else:
        return jsonify({'error': '更新失败'}), 500