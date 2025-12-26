"""
数据库配置和连接模块
"""
import pymysql
import os

# 数据库配置
DB_CONFIG = {
    'host': '47.108.202.114',
    'port': 3306,
    'user': 'root',
    'password': 'RPFSYbFYhpRbYaJn',
    'database': 'task',
    'charset': 'utf8mb4',
    'cursorclass': pymysql.cursors.DictCursor
}

def get_db_connection():
    """获取数据库连接"""
    return pymysql.connect(**DB_CONFIG)

def create_tables():
    """创建所有需要的表（如果不存在）"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    # 创建作曲家表
    cur.execute("""
    CREATE TABLE IF NOT EXISTS composers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    # 创建students表（如果不存在）
    cur.execute("""
    CREATE TABLE IF NOT EXISTS students (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        age INT,
        grade VARCHAR(100),
        instrument VARCHAR(100),
        phone VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    # 创建test表（如果不存在）
    cur.execute("""
    CREATE TABLE IF NOT EXISTS test (
        id INT AUTO_INCREMENT PRIMARY KEY,
        content VARCHAR(255) NOT NULL,
        image VARCHAR(255),
        composer_id INT,
        student_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (composer_id) REFERENCES composers(id),
        FOREIGN KEY (student_id) REFERENCES students(id)
    )
    """)
    
    # 创建works表（如果不存在）
    cur.execute("""
    CREATE TABLE IF NOT EXISTS works (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        composer_id INT,
        difficulty VARCHAR(100),
        description TEXT,
        images TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (composer_id) REFERENCES composers(id)
    )
    """)
    
    # 检查并添加test表的扩展字段（如果不存在）
    check_and_add_column(cur, 'test', 'images', 'TEXT')
    check_and_add_column(cur, 'test', 'description', 'TEXT')
    check_and_add_column(cur, 'test', 'student_id', 'INT')
    
    # 检查并添加works表的images字段（如果不存在）
    check_and_add_column(cur, 'works', 'images', 'TEXT')
    
    # 检查并添加students表的扩展字段（如果不存在）
    check_and_add_column(cur, 'students', 'age', 'INT')
    check_and_add_column(cur, 'students', 'grade', 'VARCHAR(100)')
    check_and_add_column(cur, 'students', 'instrument', 'VARCHAR(100)')
    check_and_add_column(cur, 'students', 'phone', 'VARCHAR(20)')
    
    # 检查并添加外键约束（如果不存在）
    try:
        cur.execute("SHOW CREATE TABLE test")
        create_table_sql = cur.fetchone()['Create Table']
        
        if 'CONSTRAINT' not in create_table_sql:
            cur.execute("ALTER TABLE test ADD CONSTRAINT fk_composer FOREIGN KEY (composer_id) REFERENCES composers(id)")
            cur.execute("ALTER TABLE test ADD CONSTRAINT fk_student FOREIGN KEY (student_id) REFERENCES students(id)")
    except:
        pass  # 如果外键约束已存在，忽略错误
    
    conn.commit()
    cur.close()
    conn.close()

def check_and_add_column(cursor, table_name, column_name, column_type):
    """检查并添加列（如果不存在）"""
    cursor.execute(f"SHOW COLUMNS FROM {table_name} LIKE '{column_name}'")
    result = cursor.fetchone()
    if not result:
        cursor.execute(f"ALTER TABLE {table_name} ADD COLUMN {column_name} {column_type}")