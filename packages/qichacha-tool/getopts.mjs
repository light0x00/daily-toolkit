import getopts from "getopts";
import fs from "fs"

const CWD = process.cwd()
//qcc_did=6ae486f2795c4ed28eb8cd0be525986f; QCCSESSID=f41cbffd304711b4ad9e2c8646; UM_distinctid=187a8690553b2e-090ac5acc491a8-133a645d-1aeaa0-187a86905549b2; _uab_collina=168230971048370918316337; acw_tc=74d3b49916823310267822457e55d495bf365dc890b2dfc44768d04318; CNZZDATA1254842228=1401745614-1682154738-https%253A%252F%252Fwww.google.com%252F%7C1682327545
export function getOpts() {
	const options = getopts(process.argv.slice(2), {
		alias: {
			help: "h",
			inputExcel: "i",
			outputPath: "o",
			startRow: "s",
			endRow: "e",
		},
		default: {
			outputPath: CWD,
			startRow: 2,
			endRow: Number.MAX_SAFE_INTEGER,
			companyNameColumn: 2,
			minInterval: 5000
		}
	});
	validate(options)
	return options;
}

function validate({ help, inputExcel, outputPath, outputExcel}) {
	if (help) {
		showHelp();
		process.exit(0);
	}
	if (inputExcel == null) {
		showHelp();
		process.stdout.write(`\n没有指定输入Excel文件路径~\n`)
		process.exit(0);
	}
	if (!fs.existsSync(inputExcel)) {
		process.stdout.write(`文件不存在:` + inputExcel)
		process.exit(0);
	}
	if (!fs.existsSync(outputPath)) {
		process.stdout.write(`输出目录不存在:` + outputPath)
		process.exit(0);
	}
	// if (outputExcel != null && !fs.existsSync(outputExcel)) {
	// 	process.stdout.write(`指定的输出 Excel 不存在:` + outputExcel)
	// 	process.exit(0);
	// }
}


function showHelp() {

	process.stdout.write(
		`
==================== 使用说明 ========================
	
[示例1] 指定一个要处理的excel文件:  
			
			qcc --inputExcel "C:\\我的查询excel文件.xlsx" 
	
[示例2] 指定一个excel文件,从第二行开始处理: 
			
			qcc --inputExcel "C:\\我的查询excel文件.xlsx" --startRow 2

[示例3] 指定一个excel文件,从第二行开始处理,每行取第二列的值作为「公司名称」: 
	
			qcc --inputExcel "C:\\我的查询excel文件.xlsx" --startRow 2 --companyNameColumn=2

[示例4] 指定一个excel文件,从第二行开始处理,每间隔5秒钟处理一条数据: 
	
			qcc --inputExcel "C:\\我的查询excel文件.xlsx" --startRow 2 --minInterval=5000

参数:
-i,--inputExcel	指定输入的Excel文件路径
-o,--outputPath 指定输出的Excel文件目录
-s,--startRow 起始行(默认从第二行开始处理)
-e,--endRow 结束行(默认处理到最后一行)
--companyNameColumn, 公司名称位于输入Excel的第几列(默认第二列)
--outputExcel, 指定已经存在Excel文件,将结果写入其中
--minInterval, 指定查询频率,如果太频繁,会触发企查查人工验证
--cookie, 设置登录cookie

快捷键:
Ctrl + C , 优雅退出程序
`);
}
