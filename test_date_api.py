import requests
import json

# 测试get-data接口
def test_get_data():
    print("测试 /get-data 接口:")
    try:
        response = requests.get('http://127.0.0.1:5000/get-data')
        print(f"状态码: {response.status_code}")
        print(f"响应头: {response.headers}")
        print(f"响应内容: {response.text[:500]}...")
        
        if response.status_code == 200:
            data = response.json()
            print(f"数据类型: {type(data)}")
            if data:
                print(f"第一条数据: {json.dumps(data[0], indent=2, ensure_ascii=False)}")
                if 'created_at' in data[0]:
                    print(f"创建时间字段: {data[0]['created_at']}")
                    print(f"创建时间字段类型: {type(data[0]['created_at'])}")
    except Exception as e:
        print(f"请求失败: {e}")
    print("\n")

# 测试homeworks接口
def test_homeworks():
    print("测试 /homeworks/<id> 接口:")
    try:
        # 先获取一个有效的作业ID
        response = requests.get('http://127.0.0.1:5000/get-data')
        if response.status_code == 200:
            data = response.json()
            if data:
                homework_id = data[0]['id']
                print(f"使用作业ID: {homework_id}")
                
                # 测试作业详情接口
                response = requests.get(f'http://127.0.0.1:5000/homeworks/{homework_id}')
                print(f"状态码: {response.status_code}")
                print(f"响应内容: {response.text}")
                
                if response.status_code == 200:
                    homework = response.json()
                    print(f"作业数据: {json.dumps(homework, indent=2, ensure_ascii=False)}")
                    if 'created_at' in homework:
                        print(f"创建时间字段: {homework['created_at']}")
    except Exception as e:
        print(f"请求失败: {e}")
    print("\n")

# 测试composer-homeworks接口
def test_composer_homeworks():
    print("测试 /composer-homeworks/<id> 接口:")
    try:
        # 先获取一个有效的作曲家ID
        response = requests.get('http://127.0.0.1:5000/composers')
        if response.status_code == 200:
            composers = response.json()
            if composers:
                composer_id = composers[0]['id']
                print(f"使用作曲家ID: {composer_id}")
                
                # 测试作曲家作业接口
                response = requests.get(f'http://127.0.0.1:5000/composer-homeworks/{composer_id}')
                print(f"状态码: {response.status_code}")
                print(f"响应内容: {response.text[:500]}...")
                
                if response.status_code == 200:
                    homeworks = response.json()
                    if homeworks:
                        print(f"第一条作业: {json.dumps(homeworks[0], indent=2, ensure_ascii=False)}")
                        if 'created_at' in homeworks[0]:
                            print(f"创建时间字段: {homeworks[0]['created_at']}")
    except Exception as e:
        print(f"请求失败: {e}")
    print("\n")

# 测试student-homeworks接口
def test_student_homeworks():
    print("测试 /student-homeworks/<id> 接口:")
    try:
        # 先获取一个有效的学生ID
        response = requests.get('http://127.0.0.1:5000/students')
        if response.status_code == 200:
            students = response.json()
            if students:
                student_id = students[0]['id']
                print(f"使用学生ID: {student_id}")
                
                # 测试学生作业接口
                response = requests.get(f'http://127.0.0.1:5000/student-homeworks/{student_id}')
                print(f"状态码: {response.status_code}")
                print(f"响应内容: {response.text[:500]}...")
                
                if response.status_code == 200:
                    homeworks = response.json()
                    if homeworks:
                        print(f"第一条作业: {json.dumps(homeworks[0], indent=2, ensure_ascii=False)}")
                        if 'created_at' in homeworks[0]:
                            print(f"创建时间字段: {homeworks[0]['created_at']}")
    except Exception as e:
        print(f"请求失败: {e}")
    print("\n")

# 运行所有测试
if __name__ == "__main__":
    print("开始测试日期API...")
    test_get_data()
    test_homeworks()
    test_composer_homeworks()
    test_student_homeworks()
    print("测试完成!")
