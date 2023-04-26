
# 企查查数据收集工具

基于 selenium 的自动操作工具, 可代替人工收集企查查上的企业数据, 输入一个含有若干公司名称的 Excel , 输出一个包含这些公司信息的Excel. (目前只收集了企业信用代码,但是只需稍加更改代码,即可收集其他信息)

```bash
npm i @light0x00/qichacha-tool -g
```

## 示例
	
[示例1] 指定一个要处理的excel文件:  

```bash
qcc --inputExcel "C:\\我的查询excel文件.xlsx" 
```

[示例2] 指定一个excel文件,从第二行开始处理: 
			
```bash
qcc --inputExcel "C:\\我的查询excel文件.xlsx" --startRow 2
```

[示例3] 指定一个excel文件,从第二行开始处理,每行取第二列的值作为「公司名称」: 

```bash
qcc --inputExcel "C:\\我的查询excel文件.xlsx" --startRow 2 --companyNameColumn=2
```

[示例4] 指定一个excel文件,从第二行开始处理,每间隔5秒钟处理一条数据: 

```bash
qcc --inputExcel "C:\\我的查询excel文件.xlsx" --startRow 2 --minInterval=5000
```

## 参数

~|~
--|--
-i,--inputExcel |	指定输入的Excel文件路径
-o,--outputPath | 指定输出的Excel文件目录
-s,--startRow | 起始行(默认从第二行开始处理)
-e,--endRow | 结束行(默认处理到最后一行)
--companyNameColumn | 公司名称位于输入Excel的第几列(默认第二列)
--outputExcel | 指定已经存在Excel文件,将结果写入其中
--minInterval | 指定查询频率,如果太频繁,会触发企查查人工验证
--cookie | 设置登录cookie

## 快捷键:
Ctrl + C , 优雅退出程序,将等待最后一次查询完成后退出, 将输出本次断点(处理到第几行), 以便下次基于断点继续执行