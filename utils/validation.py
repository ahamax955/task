"""
数据验证和格式化工具函数
"""
from typing import Any, Dict, List, Optional, Union
from datetime import datetime

def validate_required_fields(data: Dict[str, Any], required_fields: List[str]) -> List[str]:
    """
    验证必填字段
    
    Args:
        data: 要验证的数据字典
        required_fields: 必填字段列表
        
    Returns:
        List[str]: 错误信息列表，如果没有错误返回空列表
    """
    errors = []
    
    for field in required_fields:
        value = data.get(field)
        if value is None or value == '':
            errors.append(f"缺少必填字段: {field}")
    
    return errors

def validate_integer(value: Any, field_name: str, min_value: int = None, max_value: int = None) -> List[str]:
    """
    验证整数字段
    
    Args:
        value: 要验证的值
        field_name: 字段名
        min_value: 最小值
        max_value: 最大值
        
    Returns:
        List[str]: 错误信息列表
    """
    errors = []
    
    if value is None or value == '':
        return errors  # 空值不验证，允许可选字段
    
    try:
        int_value = int(value)
        
        if min_value is not None and int_value < min_value:
            errors.append(f"{field_name}不能小于{min_value}")
        
        if max_value is not None and int_value > max_value:
            errors.append(f"{field_name}不能大于{max_value}")
            
    except (ValueError, TypeError):
        errors.append(f"{field_name}必须是整数")
    
    return errors

def validate_string_length(value: Any, field_name: str, min_length: int = 0, max_length: int = None) -> List[str]:
    """
    验证字符串长度
    
    Args:
        value: 要验证的值
        field_name: 字段名
        min_length: 最小长度
        max_length: 最大长度
        
    Returns:
        List[str]: 错误信息列表
    """
    errors = []
    
    if value is None:
        return errors  # 空值不验证
    
    if not isinstance(value, str):
        errors.append(f"{field_name}必须是字符串")
        return errors
    
    str_value = value.strip()
    
    if len(str_value) < min_length:
        errors.append(f"{field_name}长度不能小于{min_length}个字符")
    
    if max_length is not None and len(str_value) > max_length:
        errors.append(f"{field_name}长度不能超过{max_length}个字符")
    
    return errors

def format_datetime(dt: Any) -> str:
    """
    格式化日期时间
    
    Args:
        dt: 日期时间对象或字符串
        
    Returns:
        str: 格式化后的日期时间字符串
    """
    if isinstance(dt, datetime):
        return dt.strftime('%Y/%m/%d %H:%M:%S')
    elif isinstance(dt, str):
        return dt  # 假设已经是格式化后的字符串
    else:
        return str(dt)

def parse_comma_separated_images(images_str: str) -> List[str]:
    """
    解析逗号分隔的图片字符串
    
    Args:
        images_str: 逗号分隔的图片字符串
        
    Returns:
        List[str]: 图片文件名列表
    """
    if not images_str:
        return []
    
    return [img.strip() for img in images_str.split(',') if img.strip()]

def join_images_to_string(images_list: List[str]) -> Optional[str]:
    """
    将图片列表转换为逗号分隔的字符串
    
    Args:
        images_list: 图片文件名列表
        
    Returns:
        Optional[str]: 逗号分隔的字符串，如果列表为空返回None
    """
    if not images_list:
        return None
    
    return ','.join([img.strip() for img in images_list if img.strip()])

def clean_string(value: Any) -> Optional[str]:
    """
    清理字符串
    
    Args:
        value: 要清理的值
        
    Returns:
        Optional[str]: 清理后的字符串，如果输入为空返回None
    """
    if value is None:
        return None
    
    if not isinstance(value, str):
        value = str(value)
    
    cleaned = value.strip()
    return cleaned if cleaned else None

def validate_email(email: str) -> bool:
    """
    验证邮箱格式
    
    Args:
        email: 邮箱地址
        
    Returns:
        bool: 是否为有效的邮箱格式
    """
    if not email or not isinstance(email, str):
        return False
    
    email = email.strip()
    if '@' not in email or '.' not in email:
        return False
    
    parts = email.split('@')
    if len(parts) != 2:
        return False
    
    local, domain = parts
    if not local or not domain:
        return False
    
    if '.' not in domain:
        return False
    
    return True

def paginate_data(data: List[Dict], page: int = 1, page_size: int = 20) -> Dict[str, Any]:
    """
    分页数据
    
    Args:
        data: 要分页的数据列表
        page: 页码（从1开始）
        page_size: 每页数量
        
    Returns:
        Dict: 包含分页信息和数据的字典
    """
    total = len(data)
    total_pages = (total + page_size - 1) // page_size  # 向上取整
    
    start_index = (page - 1) * page_size
    end_index = start_index + page_size
    
    page_data = data[start_index:end_index]
    
    return {
        'data': page_data,
        'page': page,
        'page_size': page_size,
        'total': total,
        'total_pages': total_pages,
        'has_next': page < total_pages,
        'has_prev': page > 1
    }