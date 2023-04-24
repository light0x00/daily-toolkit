import getopts from "getopts";
import fs from "fs"

const CWD = process.cwd()

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
			companyNameColumn: 2
		}
	});
	validate(options)
	return options;
}

function validate({ help, inputExcel, outputPath, outputExcel }) {
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
	if (outputExcel != null && !fs.existsSync(outputExcel)) {
		process.stdout.write(`指定的输出 Excel 不存在:` + ouputPath)
		process.exit(0);
	}
}


function showHelp() {

	process.stdout.write(
		`
=================== 欢迎使用企查查小助手 ===================
使用方式:
-i,--inputExcel	指定输入的Excel文件路径
-o,--outputPath 指定输出的Excel文件目录
-s,--startRow 起始行(默认从第二行开始处理)
-e,--endRow 结束行(默认处理到最后一行)
--companyNameColumn, 公司名称位于输入Excel的第几列(默认第二列)
--outputExcel, 指定已经存在Excel文件,将结果写入其中
`);
}
