import requests
import os

# 测试图片上传功能
def test_image_upload():
    url = 'http://127.0.0.1:5000/insert'
    
    # 创建测试图片（如果不存在）
    test_image_path = 'test_image.jpg'
    if not os.path.exists(test_image_path):
        # 创建一个简单的1x1像素的JPEG图片
        from PIL import Image
        img = Image.new('RGB', (1, 1), color='red')
        img.save(test_image_path)
    
    try:
        # 打开图片文件
        with open(test_image_path, 'rb') as f:
            # 构建表单数据
            files = {'image': (test_image_path, f, 'image/jpeg')}
            data = {'content': '测试图片上传'}
            
            # 发送POST请求
            response = requests.post(url, files=files, data=data)
            
            print(f"图片上传响应状态码: {response.status_code}")
            print(f"图片上传响应内容: {response.text}")
            
            if response.status_code == 200 and response.json().get('success'):
                print("✅ 图片上传成功！")
            else:
                print("❌ 图片上传失败！")
                return False
    except Exception as e:
        print(f"❌ 图片上传测试失败: {e}")
        return False
    finally:
        # 清理测试图片
        if os.path.exists(test_image_path):
            os.remove(test_image_path)
    
    return True

# 测试获取数据功能
def test_get_data():
    url = 'http://127.0.0.1:5000/get-data'
    
    try:
        # 发送GET请求
        response = requests.get(url)
        
        print(f"\n获取数据响应状态码: {response.status_code}")
        print(f"获取数据响应内容: {response.json()}")
        
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                print("✅ 获取数据成功！")
                
                # 检查是否有带图片的数据
                for item in data:
                    if 'image' in item and item['image']:
                        print(f"发现带图片的数据: ID={item['id']}, Image={item['image']}")
                        return True
                else:
                    print("⚠️  没有发现带图片的数据")
                    return False
        else:
            print("❌ 获取数据失败！")
            return False
    except Exception as e:
        print(f"❌ 获取数据测试失败: {e}")
        return False

# 测试图片访问功能
def test_image_access():
    # 首先获取数据，找到带图片的数据
    url = 'http://127.0.0.1:5000/get-data'
    
    try:
        # 获取数据
        response = requests.get(url)
        if response.status_code != 200:
            print("❌ 获取数据失败，无法测试图片访问！")
            return False
        
        data = response.json()
        
        # 找到带图片的数据
        for item in data:
            if 'image' in item and item['image']:
                image_path = item['image']
                image_filename = image_path.split('/')[-1]
                image_url = f'http://127.0.0.1:5000/uploads/{image_filename}'
                
                print(f"\n测试访问图片: {image_url}")
                
                # 发送GET请求访问图片
                image_response = requests.get(image_url)
                
                print(f"图片访问响应状态码: {image_response.status_code}")
                
                if image_response.status_code == 200:
                    print("✅ 图片访问成功！")
                    return True
                else:
                    print("❌ 图片访问失败！")
                    return False
        
        print("⚠️  没有发现带图片的数据，无法测试图片访问！")
        return False
    except Exception as e:
        print(f"❌ 图片访问测试失败: {e}")
        return False

# 主函数
if __name__ == '__main__':
    print("开始测试图片上传和查看功能...")
    
    # 测试图片上传
    upload_success = test_image_upload()
    
    # 测试获取数据
    get_data_success = test_get_data()
    
    # 测试图片访问
    image_access_success = test_image_access()
    
    print("\n=== 测试结果总结 ===")
    print(f"图片上传: {'✅ 成功' if upload_success else '❌ 失败'}")
    print(f"获取数据: {'✅ 成功' if get_data_success else '❌ 失败'}")
    print(f"图片访问: {'✅ 成功' if image_access_success else '❌ 失败'}")
    
    if upload_success and get_data_success and image_access_success:
        print("\n🎉 所有测试通过！图片上传和查看功能正常工作。")
    else:
        print("\n❌ 部分测试失败，请检查代码和服务器配置。")
