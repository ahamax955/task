import requests
import json
import os

# 测试基础URL
BASE_URL = 'http://127.0.0.1:5000'

def test_composers_crud():
    print("=== 测试作曲家增删改查功能 ===")
    
    # 测试获取作曲家列表（初始状态）
    print("1. 测试获取作曲家列表（初始状态）")
    response = requests.get(f'{BASE_URL}/composers')
    print(f"   状态码: {response.status_code}")
    print(f"   响应: {json.dumps(response.json(), ensure_ascii=False)}")
    
    # 测试添加作曲家
    print("2. 测试添加作曲家")
    composer_data = {'name': '贝多芬'}
    response = requests.post(f'{BASE_URL}/composers', json=composer_data)
    print(f"   状态码: {response.status_code}")
    print(f"   响应: {json.dumps(response.json(), ensure_ascii=False)}")
    composer_id = response.json().get('id')
    
    # 测试再次获取作曲家列表
    print("3. 测试再次获取作曲家列表")
    response = requests.get(f'{BASE_URL}/composers')
    print(f"   状态码: {response.status_code}")
    print(f"   响应: {json.dumps(response.json(), ensure_ascii=False)}")
    
    # 测试更新作曲家
    print("4. 测试更新作曲家")
    update_data = {'name': '路德维希·凡·贝多芬'}
    response = requests.put(f'{BASE_URL}/composers/{composer_id}', json=update_data)
    print(f"   状态码: {response.status_code}")
    print(f"   响应: {json.dumps(response.json(), ensure_ascii=False)}")
    
    # 测试删除作曲家
    print("5. 测试删除作曲家")
    response = requests.delete(f'{BASE_URL}/composers/{composer_id}')
    print(f"   状态码: {response.status_code}")
    print(f"   响应: {json.dumps(response.json(), ensure_ascii=False)}")
    
    # 测试最终作曲家列表
    print("6. 测试最终作曲家列表")
    response = requests.get(f'{BASE_URL}/composers')
    print(f"   状态码: {response.status_code}")
    print(f"   响应: {json.dumps(response.json(), ensure_ascii=False)}")

def test_students_crud():
    print("\n=== 测试学生增删改查功能 ===")
    
    # 测试获取学生列表（初始状态）
    print("1. 测试获取学生列表（初始状态）")
    response = requests.get(f'{BASE_URL}/students')
    print(f"   状态码: {response.status_code}")
    print(f"   响应: {json.dumps(response.json(), ensure_ascii=False)}")
    
    # 测试添加学生
    print("2. 测试添加学生")
    student_data = {'name': '张三'}
    response = requests.post(f'{BASE_URL}/students', json=student_data)
    print(f"   状态码: {response.status_code}")
    print(f"   响应: {json.dumps(response.json(), ensure_ascii=False)}")
    student_id = response.json().get('id')
    
    # 测试再次获取学生列表
    print("3. 测试再次获取学生列表")
    response = requests.get(f'{BASE_URL}/students')
    print(f"   状态码: {response.status_code}")
    print(f"   响应: {json.dumps(response.json(), ensure_ascii=False)}")
    
    # 测试更新学生
    print("4. 测试更新学生")
    update_data = {'name': '张三丰'}
    response = requests.put(f'{BASE_URL}/students/{student_id}', json=update_data)
    print(f"   状态码: {response.status_code}")
    print(f"   响应: {json.dumps(response.json(), ensure_ascii=False)}")
    
    # 测试删除学生
    print("5. 测试删除学生")
    response = requests.delete(f'{BASE_URL}/students/{student_id}')
    print(f"   状态码: {response.status_code}")
    print(f"   响应: {json.dumps(response.json(), ensure_ascii=False)}")
    
    # 测试最终学生列表
    print("6. 测试最终学生列表")
    response = requests.get(f'{BASE_URL}/students')
    print(f"   状态码: {response.status_code}")
    print(f"   响应: {json.dumps(response.json(), ensure_ascii=False)}")

def test_image_upload():
    print("\n=== 测试图片上传功能 ===")
    
    # 首先添加测试用的作曲家和学生
    composer_data = {'name': '莫扎特'}
    composer_response = requests.post(f'{BASE_URL}/composers', json=composer_data)
    composer_id = composer_response.json().get('id')
    
    student_data = {'name': '李四'}
    student_response = requests.post(f'{BASE_URL}/students', json=student_data)
    student_id = student_response.json().get('id')
    
    # 测试无图片上传
    print("1. 测试无图片上传")
    form_data = {
        'content': '测试备注',
        'composer_id': composer_id,
        'student_id': student_id
    }
    response = requests.post(f'{BASE_URL}/insert', data=form_data)
    print(f"   状态码: {response.status_code}")
    print(f"   响应: {json.dumps(response.json(), ensure_ascii=False)}")
    
    # 测试获取所有数据
    print("2. 测试获取所有数据")
    response = requests.get(f'{BASE_URL}/get-data')
    print(f"   状态码: {response.status_code}")
    print(f"   响应: {json.dumps(response.json(), ensure_ascii=False)}")
    
    # 清理测试数据
    requests.delete(f'{BASE_URL}/composers/{composer_id}')
    requests.delete(f'{BASE_URL}/students/{student_id}')

if __name__ == '__main__':
    try:
        test_composers_crud()
        test_students_crud()
        test_image_upload()
        print("\n=== 所有测试完成 ===")
    except Exception as e:
        print(f"\n测试过程中发生错误: {str(e)}")
