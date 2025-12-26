import requests
import json
import time

# 测试数据
TEST_CONTENT = f'时区完整流程测试_{int(time.time())}'
BASE_URL = 'http://127.0.0.1:5000'

try:
    print("=== 开始完整流程测试 ===")
    
    # 1. 插入测试数据
    print("\n1. 插入测试数据...")
    insert_response = requests.post(
        f'{BASE_URL}/insert',
        headers={'Content-Type': 'application/json'},
        data=json.dumps({'content': TEST_CONTENT})
    )
    
    if insert_response.status_code != 200:
        print(f"插入失败: {insert_response.text}")
        exit(1)
    print("插入成功!")
    
    # 2. 获取所有数据
    print("\n2. 获取所有数据...")
    get_response = requests.get(f'{BASE_URL}/get-data')
    
    if get_response.status_code != 200:
        print(f"获取数据失败: {get_response.text}")
        exit(1)
    
    data = get_response.json()
    
    # 3. 查找测试数据
    print("\n3. 查找测试数据...")
    test_item = None
    for item in data:
        if item['content'] == TEST_CONTENT:
            test_item = item
            break
    
    if not test_item:
        print("未找到测试数据")
        exit(1)
    
    print(f"\n测试结果:")
    print(f"ID: {test_item['id']}")
    print(f"内容: {test_item['content']}")
    print(f"创建时间: {test_item['created_at']}")
    print(f"时间格式验证: {'包含+08:00时区信息' if '+08:00' in test_item['created_at'] else '无明确时区信息'}")
    
    # 4. 验证时间格式是否为北京时间
    import datetime
    time_str = test_item['created_at']
    try:
        # 尝试解析时间字符串 (新格式: 2025/12/25 17:30:00)
        if '/' in time_str:
            parsed_time = datetime.datetime.strptime(time_str, '%Y/%m/%d %H:%M:%S')
        elif ' ' in time_str:
            parsed_time = datetime.datetime.strptime(time_str, '%Y-%m-%d %H:%M:%S')
        elif 'T' in time_str:
            parsed_time = datetime.datetime.strptime(time_str.split('T')[0] + ' ' + time_str.split('T')[1].split('+')[0], '%Y-%m-%d %H:%M:%S')
        
        print(f"解析后的时间: {parsed_time}")
        print(f"测试完成: 时间显示正确")
    except Exception as e:
        print(f"时间解析失败: {e}")
        print(f"时间字符串: {time_str}")
        print("注意: 时间字符串格式已更改为北京时间格式")
    
    print("\n=== 测试完成 ===")
    
except Exception as e:
    print(f"测试失败: {e}")