#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import pymysql

def create_works_table():
    """
    创建作品表
    """
    try:
        # 建立数据库连接
        connection = pymysql.connect(
            host='47.108.202.114',
            port=3306,
            user='root',
            password='RPFSYbFYhpRbYaJn',
            database='task',
            charset='utf8mb4',
            cursorclass=pymysql.cursors.DictCursor
        )
        
        # 创建游标
        cursor = connection.cursor()
        
        # 创建作品表
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS works (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            composer_id INT NOT NULL,
            difficulty VARCHAR(50),
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (composer_id) REFERENCES composers(id) ON DELETE CASCADE
        )
        """)
        
        # 检查images列是否存在，如果不存在则添加
        cursor.execute("""
            SELECT COUNT(*) 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = 'task' AND TABLE_NAME = 'works' AND COLUMN_NAME = 'images'
        """)
        column_exists = cursor.fetchone()[0] > 0
        
        if not column_exists:
            # 添加images列
            cursor.execute("""
                ALTER TABLE works ADD COLUMN images TEXT
            """)
            print("成功添加images列到作品表")
        else:
            print("images列已存在")
        
        # 提交更改
        connection.commit()
        
        print("成功创建作品表")
        
        # 关闭连接
        cursor.close()
        connection.close()
            
    except Exception as e:
        print(f"数据库连接或操作错误: {e}")

if __name__ == "__main__":
    create_works_table()