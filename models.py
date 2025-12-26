"""
数据模型模块
定义所有实体的数据模型和数据库操作
"""
from database import get_db_connection
from typing import Optional, List, Dict, Any
import pymysql

class BaseModel:
    """基础模型类"""
    
    def __init__(self, db_connection=None):
        self.db_connection = db_connection or get_db_connection()
    
    def execute_query(self, query: str, params: tuple = None) -> List[Dict]:
        """执行查询SQL"""
        cursor = self.db_connection.cursor()
        try:
            cursor.execute(query, params)
            return cursor.fetchall()
        finally:
            cursor.close()
    
    def execute_update(self, query: str, params: tuple = None) -> int:
        """执行更新SQL，返回影响行数"""
        cursor = self.db_connection.cursor()
        try:
            cursor.execute(query, params)
            self.db_connection.commit()
            return cursor.rowcount
        finally:
            cursor.close()

class Composer(BaseModel):
    """作曲家模型"""
    
    def get_all(self) -> List[Dict]:
        """获取所有作曲家"""
        query = "SELECT * FROM composers ORDER BY created_at DESC"
        return self.execute_query(query)
    
    def get_by_id(self, composer_id: int) -> Optional[Dict]:
        """根据ID获取作曲家"""
        query = "SELECT * FROM composers WHERE id = %s"
        result = self.execute_query(query, (composer_id,))
        return result[0] if result else None
    
    def create(self, name: str) -> int:
        """创建新作曲家"""
        query = "INSERT INTO composers (name) VALUES (%s)"
        cursor = self.db_connection.cursor()
        try:
            cursor.execute(query, (name,))
            self.db_connection.commit()
            return cursor.lastrowid
        finally:
            cursor.close()
    
    def update(self, composer_id: int, name: str) -> bool:
        """更新作曲家信息"""
        query = "UPDATE composers SET name = %s WHERE id = %s"
        affected_rows = self.execute_update(query, (name, composer_id))
        return affected_rows > 0
    
    def delete(self, composer_id: int) -> bool:
        """删除作曲家"""
        query = "DELETE FROM composers WHERE id = %s"
        affected_rows = self.execute_update(query, (composer_id,))
        return affected_rows > 0
    
    def get_homeworks(self, composer_id: int) -> List[Dict]:
        """获取作曲家的所有作业"""
        query = """
        SELECT t.*, s.name as student_name 
        FROM test t 
        LEFT JOIN students s ON t.student_id = s.id 
        WHERE t.composer_id = %s 
        ORDER BY t.created_at DESC
        """
        return self.execute_query(query, (composer_id,))
    
    def get_works(self, composer_id: int) -> List[Dict]:
        """获取作曲家的所有作品"""
        query = "SELECT * FROM works WHERE composer_id = %s ORDER BY created_at DESC"
        return self.execute_query(query, (composer_id,))

class Student(BaseModel):
    """学生模型"""
    
    def get_all(self) -> List[Dict]:
        """获取所有学生"""
        query = "SELECT * FROM students ORDER BY created_at DESC"
        return self.execute_query(query)
    
    def get_by_id(self, student_id: int) -> Optional[Dict]:
        """根据ID获取学生"""
        query = "SELECT * FROM students WHERE id = %s"
        result = self.execute_query(query, (student_id,))
        return result[0] if result else None
    
    def create(self, name: str, age: int = None, grade: str = None, 
               instrument: str = None, phone: str = None) -> int:
        """创建新学生"""
        query = """
        INSERT INTO students (name, age, grade, instrument, phone) 
        VALUES (%s, %s, %s, %s, %s)
        """
        cursor = self.db_connection.cursor()
        try:
            cursor.execute(query, (name, age, grade, instrument, phone))
            self.db_connection.commit()
            return cursor.lastrowid
        finally:
            cursor.close()
    
    def update(self, student_id: int, name: str, age: int = None, 
               grade: str = None, instrument: str = None, phone: str = None) -> bool:
        """更新学生信息"""
        query = """
        UPDATE students 
        SET name = %s, age = %s, grade = %s, instrument = %s, phone = %s 
        WHERE id = %s
        """
        affected_rows = self.execute_update(query, (name, age, grade, instrument, phone, student_id))
        return affected_rows > 0
    
    def delete(self, student_id: int) -> bool:
        """删除学生"""
        query = "DELETE FROM students WHERE id = %s"
        affected_rows = self.execute_update(query, (student_id,))
        return affected_rows > 0
    
    def get_homeworks(self, student_id: int) -> List[Dict]:
        """获取学生的所有作业"""
        query = """
        SELECT t.*, c.name as composer_name 
        FROM test t 
        LEFT JOIN composers c ON t.composer_id = c.id 
        WHERE t.student_id = %s 
        ORDER BY t.created_at DESC
        """
        return self.execute_query(query, (student_id,))

class Homework(BaseModel):
    """作业模型"""
    
    def get_all(self) -> List[Dict]:
        """获取所有作业"""
        query = """
        SELECT t.*, c.name as composer_name, s.name as student_name 
        FROM test t 
        LEFT JOIN composers c ON t.composer_id = c.id 
        LEFT JOIN students s ON t.student_id = s.id 
        ORDER BY t.created_at DESC
        """
        return self.execute_query(query)
    
    def get_by_id(self, homework_id: int) -> Optional[Dict]:
        """根据ID获取作业"""
        query = """
        SELECT t.*, c.name as composer_name, s.name as student_name 
        FROM test t 
        LEFT JOIN composers c ON t.composer_id = c.id 
        LEFT JOIN students s ON t.student_id = s.id 
        WHERE t.id = %s
        """
        result = self.execute_query(query, (homework_id,))
        return result[0] if result else None
    
    def create(self, content: str, composer_id: int = None, student_id: int = None,
               image: str = None, images: str = None, description: str = None) -> int:
        """创建新作业"""
        query = """
        INSERT INTO test (content, composer_id, student_id, image, images, description) 
        VALUES (%s, %s, %s, %s, %s, %s)
        """
        cursor = self.db_connection.cursor()
        try:
            cursor.execute(query, (content, composer_id, student_id, image, images, description))
            self.db_connection.commit()
            return cursor.lastrowid
        finally:
            cursor.close()
    
    def update(self, homework_id: int, content: str, composer_id: int = None, 
               student_id: int = None, image: str = None, images: str = None, 
               description: str = None) -> bool:
        """更新作业信息"""
        query = """
        UPDATE test 
        SET content = %s, composer_id = %s, student_id = %s, 
            image = %s, images = %s, description = %s 
        WHERE id = %s
        """
        affected_rows = self.execute_update(query, (content, composer_id, student_id, 
                                                   image, images, description, homework_id))
        return affected_rows > 0
    
    def delete(self, homework_id: int) -> bool:
        """删除作业"""
        query = "DELETE FROM homeworks WHERE id = %s"
        affected_rows = self.execute_update(query, (homework_id,))
        return affected_rows > 0
    
    def update_images(self, homework_id: int, images: str) -> bool:
        """更新作业图片"""
        query = "UPDATE test SET images = %s WHERE id = %s"
        affected_rows = self.execute_update(query, (images, homework_id))
        return affected_rows > 0

class Work(BaseModel):
    """作品模型"""
    
    def get_all(self) -> List[Dict]:
        """获取所有作品"""
        query = """
        SELECT w.*, c.name as composer_name 
        FROM works w 
        LEFT JOIN composers c ON w.composer_id = c.id 
        ORDER BY w.created_at DESC
        """
        return self.execute_query(query)
    
    def get_all_grouped(self) -> Dict[str, List[Dict]]:
        """获取所有作品，按作曲家分组"""
        query = """
        SELECT w.*, c.name as composer_name 
        FROM works w 
        LEFT JOIN composers c ON w.composer_id = c.id 
        ORDER BY c.name, w.title
        """
        works = self.execute_query(query)
        
        # 按作曲家分组
        grouped_works = {}
        for work in works:
            composer_name = work.get('composer_name', '未知作曲家')
            if composer_name not in grouped_works:
                grouped_works[composer_name] = []
            grouped_works[composer_name].append(work)
        
        return grouped_works
    
    def get_by_id(self, work_id: int) -> Optional[Dict]:
        """根据ID获取作品"""
        query = """
        SELECT w.*, c.name as composer_name 
        FROM works w 
        LEFT JOIN composers c ON w.composer_id = c.id 
        WHERE w.id = %s
        """
        result = self.execute_query(query, (work_id,))
        return result[0] if result else None
    
    def create(self, title: str, composer_id: int = None, difficulty: str = None,
               description: str = None, images: str = None) -> int:
        """创建新作品"""
        query = """
        INSERT INTO works (title, composer_id, difficulty, description, images) 
        VALUES (%s, %s, %s, %s, %s)
        """
        cursor = self.db_connection.cursor()
        try:
            cursor.execute(query, (title, composer_id, difficulty, description, images))
            self.db_connection.commit()
            return cursor.lastrowid
        finally:
            cursor.close()
    
    def update(self, work_id: int, title: str, composer_id: int = None,
               difficulty: str = None, description: str = None, images: str = None) -> bool:
        """更新作品信息"""
        query = """
        UPDATE works 
        SET title = %s, composer_id = %s, difficulty = %s, 
            description = %s, images = %s 
        WHERE id = %s
        """
        affected_rows = self.execute_update(query, (title, composer_id, difficulty, 
                                                   description, images, work_id))
        return affected_rows > 0
    
    def delete(self, work_id: int) -> bool:
        """删除作品"""
        query = "DELETE FROM works WHERE id = %s"
        affected_rows = self.execute_update(query, (work_id,))
        return affected_rows > 0
    
    def update_images(self, work_id: int, images: str) -> bool:
        """更新作品图片"""
        query = "UPDATE works SET images = %s WHERE id = %s"
        affected_rows = self.execute_update(query, (images, work_id))
        return affected_rows > 0