from PIL import Image, ImageDraw
import os

# 创建五线谱背景图片
def create_staff_background():
    # 创建一个透明的背景图片
    width, height = 1200, 800
    img = Image.new('RGBA', (width, height), (255, 255, 255, 0))
    draw = ImageDraw.Draw(img)
    
    # 定义五线谱的参数
    line_spacing = 20  # 线间距
    margin = 100       # 边距
    line_color = (0, 0, 0, 128)  # 半透明的黑色线条
    
    # 绘制多组五线谱，每组有5条线
    for group in range(8):  # 绘制8组五线谱
        start_y = margin + group * (line_spacing * 6 + 30)  # 每组之间留一些空间
        
        # 绘制五线谱的5条线
        for line in range(5):
            y = start_y + line * line_spacing
            draw.line([(margin, y), (width - margin, y)], fill=line_color, width=2)
    
    # 保存图片
    img.save('static/chopin_nocturne_staff.png', 'PNG')
    print("五线谱背景图片已生成：static/chopin_nocturne_staff.png")

if __name__ == "__main__":
    create_staff_background()