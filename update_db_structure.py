from flask import Flask
from flask_mysqldb import MySQL
import os

app = Flask(__name__)

# MySQL配置
app.config['MYSQL_HOST'] = '47.108.202.114'
app.config['MYSQL_PORT'] = 3306
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = 'RPFSYbFYhpRbYaJn'
app.config['MYSQL_DB'] = 'task'
app.config['MYSQL_CURSORCLASS'] = 'DictCursor'

# 初始化MySQL
mysql = MySQL(app)

# 添加images字段（如果不存在）
def add_images_field():
    with app.app_context():
        cur = mysql.connection.cursor()
        
        # 检查并添加images字段（如果不存在）
        cur.execute("SHOW COLUMNS FROM test LIKE 'images'")
        result = cur.fetchone()
        if not result:
            cur.execute("ALTER TABLE test ADD COLUMN images TEXT")
            mysql.connection.commit()
            print("已添加images字段到test表")
        else:
            print("images字段已存在")
        
        cur.close()

if __name__ == "__main__":
    add_images_field()