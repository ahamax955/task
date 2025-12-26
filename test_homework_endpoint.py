import requests

BASE_URL = 'http://127.0.0.1:5000'

def test_homework_endpoint():
    print("=== 测试 /homeworks/<id> 端点 ===")
    
    # 首先获取一些作业数据，找到一个有效的作业ID
    print("\n1. 获取所有作业数据...")
    try:
        get_response = requests.get(f'{BASE_URL}/get-data')
        if get_response.status_code == 200:
            data = get_response.json()
            if data:
                # 使用第一个作业的ID测试
                homework_id = data[0]['id']
                print(f"   找到作业ID: {homework_id}")
                
                # 测试获取有效作业详情
                print(f"\n2. 测试获取有效作业详情 (ID={homework_id})...")
                homework_response = requests.get(f'{BASE_URL}/homeworks/{homework_id}')
                print(f"   状态码: {homework_response.status_code}")
                print(f"   响应头 Content-Type: {homework_response.headers.get('Content-Type')}")
                print(f"   响应内容: {homework_response.text}")
                
                if homework_response.status_code == 200:
                    try:
                        homework_data = homework_response.json()
                        print(f"   解析JSON成功!")
                        print(f"   作业详情: ID={homework_data['id']}, 内容={homework_data['content']}")
                    except ValueError as e:
                        print(f"   解析JSON失败: {e}")
                
                # 测试获取不存在的作业
                print(f"\n3. 测试获取不存在的作业 (ID=99999)...")
                non_existent_response = requests.get(f'{BASE_URL}/homeworks/99999')
                print(f"   状态码: {non_existent_response.status_code}")
                print(f"   响应头 Content-Type: {non_existent_response.headers.get('Content-Type')}")
                print(f"   响应内容: {non_existent_response.text}")
                
                if non_existent_response.status_code == 404:
                    try:
                        error_data = non_existent_response.json()
                        print(f"   解析JSON成功!")
                        print(f"   错误信息: {error_data['error']}")
                    except ValueError as e:
                        print(f"   解析JSON失败: {e}")
            else:
                print("   没有找到作业数据")
        else:
            print(f"   获取作业数据失败: {get_response.status_code}")
    except Exception as e:
        print(f"   测试失败: {e}")

if __name__ == "__main__":
    test_homework_endpoint()
