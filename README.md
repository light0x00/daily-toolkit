
1. `WIN`+`R` 弹出运行窗口, 输入 `CMD` , `回车`


2. 复制以下命令,将方括号 `[]` 中的内容替换为Excel文件路径

```bash
qcc ./packages/qichacha-tool/index.mjs ^
--inputExcel [这里替换为查询的excel文件地址] ^
--companyNameColumn 2	^
--startRow 2 
```