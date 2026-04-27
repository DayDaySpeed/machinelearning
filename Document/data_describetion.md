1 train.csv（最重要）
这是训练数据。

里面有：

房屋特征（80个左右）

真正房价标签：

￼
SalePrice
机器学习训练就用这个。

你会拿它：

￼
训练模型
验证模型
做EDA
2 test.csv
这是测试集。

只有房屋特征：

￼
没有 SalePrice
以后训练完模型，用它做预测。

如果做 Kaggle 提交，就是对这个预测。

3 sample_submission.csv
这是提交格式模板。

长这样：

￼
Id,SalePrice
1461,123456
1462,234567
只是告诉你预测结果要怎么组织。

现在先不用管。

4 data_description.txt
这个非常重要。

很多人忽略它。

里面解释每个字段是什么意思，比如：

￼
OverallQual = 房屋整体质量评分

GrLivArea = 地上居住面积

GarageCars = 车库容量
这个做特征工程会用到。