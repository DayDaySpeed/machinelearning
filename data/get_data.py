import os
import kagglehub
#set root cache directory
os.environ['KAGGLEHUB_CACHE'] = os.path.abspath('./kaggle_cache')

print(f"正在下载竞赛数据至: {os.environ['KAGGLEHUB_CACHE']}")

path = kagglehub.competition_download('house-prices-advanced-regression-techniques')

print("\n--- 下载成功! ---")
print("数据实际路径:", path)
print("目录下的文件:", os.listdir(path))