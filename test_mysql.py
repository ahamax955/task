import pymysql
import sys

# MySQL配置
host = '47.108.202.114'
port = 3306
user = 'root'
password = 'RPFSYbFYhpRbYaJn'
db = 'task'

try:
    # 尝试连接MySQL服务器
    conn = pymysql.connect(
        host=host,
        port=port,
        user=user,
        password=password,
        database=db,
        charset='utf8mb4',
        cursorclass=pymysql.cursors.DictCursor
    )
    print("连接成功!")
    
    # 检查权限
    cursor = conn.cursor()
    cursor.execute("SELECT host, user FROM mysql.user WHERE user='root'")
    users = cursor.fetchall()
    print("\n当前root用户的权限配置:")
    for user_info in users:
        print(f"Host: {user_info[0]}, User: {user_info[1]}")
    
    cursor.close()
    conn.close()
    
except pymysql.Error as e:
    print(f"连接失败: {e}")
    print(f"错误码: {e.args[0]}")
    print(f"错误信息: {e.args[1]}")
    sys.exit(1)