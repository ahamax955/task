#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import pymysql

def clear_test_table():
    """
    删除test表中的所有数据，但保留表结构
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
        
        # 执行删除语句，但保留表结构
        cursor.execute("DELETE FROM test")
        
        # 提交更改
        connection.commit()
        
        print("成功删除了test表中的所有数据")
        
        # 关闭连接
        cursor.close()
        connection.close()
            
    except Exception as e:
        print(f"数据库连接或操作错误: {e}")

if __name__ == "__main__":
    clear_test_table()