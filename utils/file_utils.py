"""
文件处理工具函数
"""
import os
import time
from werkzeug.utils import secure_filename
from typing import List, Optional

# 支持的图片格式
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename: str) -> bool:
    """
    检查文件是否是允许的类型
    
    Args:
        filename: 文件名
        
    Returns:
        bool: 是否为允许的文件类型
    """
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def handle_image_upload(request_files, upload_folder: str) -> List[str]:
    """
    处理图片上传
    
    Args:
        request_files: Flask请求文件对象
        upload_folder: 上传文件夹路径
        
    Returns:
        List[str]: 上传成功的图片文件名列表
    """
    image_filenames = []
    
    if 'images' in request_files:
        files = request_files.getlist('images')
        for file in files:
            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                timestamp = str(int(time.time()))
                image_filename = f"{timestamp}_{filename}"
                file.save(os.path.join(upload_folder, image_filename))
                image_filenames.append(image_filename)
    
    return image_filenames

def remove_image_file(image_name: str, upload_folder: str) -> bool:
    """
    删除图片文件
    
    Args:
        image_name: 图片文件名
        upload_folder: 上传文件夹路径
        
    Returns:
        bool: 是否删除成功
    """
    try:
        image_path = os.path.join(upload_folder, image_name)
        if os.path.exists(image_path):
            os.remove(image_path)
            return True
        return False
    except Exception:
        return False

def update_image_list(current_images_str: str, new_images: List[str], 
                     removed_image: str = None) -> str:
    """
    更新图片列表
    
    Args:
        current_images_str: 当前图片列表字符串（逗号分隔）
        new_images: 新添加的图片列表
        removed_image: 要移除的图片名
        
    Returns:
        str: 更新后的图片列表字符串
    """
    # 解析当前图片列表
    current_images = []
    if current_images_str:
        current_images = [img.strip() for img in current_images_str.split(',') if img.strip()]
    
    # 添加新图片
    all_images = current_images + new_images
    
    # 移除指定图片
    if removed_image:
        all_images = [img for img in all_images if img != removed_image]
    
    # 返回逗号分隔的字符串
    return ','.join(all_images) if all_images else None

def get_file_extension(filename: str) -> str:
    """
    获取文件扩展名
    
    Args:
        filename: 文件名
        
    Returns:
        str: 文件扩展名（小写）
    """
    return filename.rsplit('.', 1)[1].lower() if '.' in filename else ''

def is_image_file(filename: str) -> bool:
    """
    检查是否为图片文件
    
    Args:
        filename: 文件名
        
    Returns:
        bool: 是否为图片文件
    """
    return get_file_extension(filename) in ALLOWED_EXTENSIONS