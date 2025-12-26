import requests

BASE_URL = 'http://127.0.0.1:5000'

def test_get_data():
    print("=== 测试 /get-data 端点 ===")
    try:
        response = requests.get(f'{BASE_URL}/get-data')
        print(f"状态码: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"返回数据数量: {len(data)}")
            if data:
                print("前3条数据:")
                for item in data[:3]:
                    print(f"  ID: {item['id']}, 内容: {item['content']}, 作曲家: {item.get('composer_name', '-')}, 学生: {item.get('student_name', '-')}")
            return True
        else:
            print(f"请求失败: {response.text}")
            return False
    except Exception as e:
        print(f"测试失败: {e}")
        return False

def test_composer_endpoint():
    print("\n=== 测试 /composers 端点 ===")
    try:
        # 获取所有作曲家
        response = requests.get(f'{BASE_URL}/composers')
        print(f"获取作曲家列表 - 状态码: {response.status_code}")
        if response.status_code == 200:
            composers = response.json()
            print(f"作曲家数量: {len(composers)}")
            
            # 如果有作曲家，测试获取单个作曲家详情
            if composers:
                composer_id = composers[0]['id']
                detail_response = requests.get(f'{BASE_URL}/composers/{composer_id}')
                print(f"获取单个作曲家详情 - 状态码: {detail_response.status_code}")
                if detail_response.status_code == 200:
                    composer = detail_response.json()
                    print(f"作曲家详情: ID={composer['id']}, 名称={composer['name']}")
                    return True
                else:
                    print(f"获取作曲家详情失败: {detail_response.text}")
                    return False
            return True
        else:
            print(f"获取作曲家列表失败: {response.text}")
            return False
    except Exception as e:
        print(f"测试失败: {e}")
        return False

def test_student_endpoint():
    print("\n=== 测试 /students 端点 ===")
    try:
        # 获取所有学生
        response = requests.get(f'{BASE_URL}/students')
        print(f"获取学生列表 - 状态码: {response.status_code}")
        if response.status_code == 200:
            students = response.json()
            print(f"学生数量: {len(students)}")
            
            # 如果有学生，测试获取单个学生详情
            if students:
                student_id = students[0]['id']
                detail_response = requests.get(f'{BASE_URL}/students/{student_id}')
                print(f"获取单个学生详情 - 状态码: {detail_response.status_code}")
                if detail_response.status_code == 200:
                    student = detail_response.json()
                    print(f"学生详情: ID={student['id']}, 名称={student['name']}")
                    return True
                else:
                    print(f"获取学生详情失败: {detail_response.text}")
                    return False
            return True
        else:
            print(f"获取学生列表失败: {response.text}")
            return False
    except Exception as e:
        print(f"测试失败: {e}")
        return False

if __name__ == "__main__":
    print("开始测试API端点...")
    
    # 测试各个端点
    tests = [
        test_get_data,
        test_composer_endpoint,
        test_student_endpoint
    ]
    
    results = []
    for test in tests:
        results.append(test())
    
    # 输出测试结果
    print("\n=== 测试结果 ===")
    print(f"总测试数: {len(results)}")
    print(f"通过测试数: {sum(results)}")
    print(f"失败测试数: {len(results) - sum(results)}")
    
    if all(results):
        print("✅ 所有API端点测试通过！")
    else:
        print("❌ 部分API端点测试失败！")
