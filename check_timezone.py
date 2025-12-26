import pymysql
import datetime

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
    
    print("=== 检查数据库时间配置 ===")
    
    # 1. 查询MySQL当前时区设置
    cursor.execute("SELECT @@global.time_zone, @@session.time_zone")
    timezones = cursor.fetchone()
    print(f"\n1. MySQL时区设置:")
    print(f"   Global: {timezones[0]}")
    print(f"   Session: {timezones[1]}")
    
    # 2. 插入一条测试数据并立即查询
    test_content = f'时间检查测试_{int(datetime.datetime.now().timestamp())}'
    cursor.execute("INSERT INTO test (content) VALUES (%s)", [test_content])
    conn.commit()
    
    cursor.execute("SELECT id, content, created_at FROM test ORDER BY id DESC LIMIT 1")
    latest = cursor.fetchone()
    print(f"\n2. 最新插入数据:")
    print(f"   ID: {latest[0]}")
    print(f"   Content: {latest[1]}")
    print(f"   DB原始时间: {latest[2]}")
    print(f"   直接转换: {datetime.datetime.strptime(str(latest[2]), '%Y-%m-%d %H:%M:%S')}")
    
    # 3. 尝试不同的转换方式
    print(f"\n3. 不同转换方式对比:")
    
    # 假设数据库存储的是UTC时间
    db_time = latest[2]
    print(f"   数据库存储时间: {db_time}")
    print(f"   当作UTC转换: {datetime.datetime.strptime(str(db_time), '%Y-%m-%d %H:%M:%S') + datetime.timedelta(hours=8)}")
    print(f"   当作北京时间: {datetime.datetime.strptime(str(db_time), '%Y-%m-%d %H:%M:%S')}")
    print(f"   直接使用不转换: {db_time}")
    
    # 4. 清理测试数据
    cursor.execute("DELETE FROM test WHERE id = %s", [latest[0]])
    conn.commit()
    
    cursor.close()
    conn.close()
    
    print("\n=== 检查完成 ===")
    
except pymysql.Error as e:
    print(f"连接失败: {e}")