import requests

# 测试API端点返回的日期格式
def test_date_format():
    print("=== 测试API日期格式 ===")
    
    # 测试获取所有数据
    print("\n1. 测试/get-data端点...")
    try:
        response = requests.get('http://127.0.0.1:5000/get-data')
        if response.status_code == 200:
            data = response.json()
            if data:
                print(f"   获取到 {len(data)} 条数据")
                print(f"   第一条数据的创建时间: {data[0]['created_at']}")
                print(f"   时间格式类型: {type(data[0]['created_at'])}")
                print(f"   是否包含%Y: {'%Y' in data[0]['created_at']}")
            else:
                print("   没有数据")
        else:
            print(f"   请求失败，状态码: {response.status_code}")
    except Exception as e:
        print(f"   请求错误: {e}")
    
    # 测试获取单个作业详情
    print("\n2. 测试/homeworks/38端点...")
    try:
        response = requests.get('http://127.0.0.1:5000/homeworks/38')
        if response.status_code == 200:
            data = response.json()
            print(f"   创建时间: {data['created_at']}")
            print(f"   时间格式类型: {type(data['created_at'])}")
            print(f"   是否包含%Y: {'%Y' in data['created_at']}")
        else:
            print(f"   请求失败，状态码: {response.status_code}")
    except Exception as e:
        print(f"   请求错误: {e}")

if __name__ == "__main__":
    test_date_format()
