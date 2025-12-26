import pymysql

# MySQL配置
host = '47.108.202.114'
port = 3306
user = 'root'
password = 'RPFSYbFYhpRbYaJn'
db = 'task'

try:
    # 连接MySQL服务器
    conn = pymysql.connect(
        host=host,
        port=port,
        user=user,
        password=password,
        database=db,
        charset='utf8mb4',
        cursorclass=pymysql.cursors.DictCursor
    )
    cursor = conn.cursor()
    
    # 插入测试数据
    cursor.execute("INSERT INTO test (content) VALUES (%s)", ['时区测试数据'])
    conn.commit()
    
    # 测试时区转换
    cursor.execute("SELECT id, content, created_at, CONVERT_TZ(created_at, '+00:00', '+08:00') AS beijing_time FROM test ORDER BY id DESC LIMIT 1")
    result = cursor.fetchone()
    
    print("\n测试结果:")
    print(f"原始时间 (UTC): {result[2]}")
    print(f"北京时间 (UTC+8): {result[3]}")
    
    # 清理测试数据
    cursor.execute("DELETE FROM test WHERE id = %s", [result[0]])
    conn.commit()
    
    cursor.close()
    conn.close()
    
    print("\n时区转换测试完成!")
    
except pymysql.Error as e:
    print(f"连接失败: {e}")
    print(f"错误码: {e.args[0]}")
    print(f"错误信息: {e.args[1]}")