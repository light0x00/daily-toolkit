import Excel from 'exceljs';
import fs from 'fs';
import { log ,InterruptError} from './toolkit.mjs';
import { getAgent } from './agent.mjs';

export class Worker {

	isInterrupted = { value: false };
	options
	lastRowNumber

	constructor(options) {
		this.options = options
		this.lastRowNumber = options.startRow - 1
	}

	interrupt() {
		this.isInterrupted.value = true;
	}

	intterupted(){
		return this.isInterrupted.value
	}

	async work() {

		let options = this.options

		//excel
		const workbook = await getWorkbook(options);
		const sheet = workbook.getWorksheet("default");
		//browser agent
		let agent = await getAgent(options, this.isInterrupted);

		try {
			await agent.openSearchPage(options);

			for await (let { rowsNumber, companyName } of readExcel(options.inputExcel, options)) {

				if (companyName != null && rowsNumber > 1) {
					if (companyName.length > 1) {
						log(`开始查询: ${rowsNumber},公司名称:${companyName}`);
						let { creditCode, note } = await agent.searchInInterval(companyName);
						sheet.addRow([companyName, creditCode, note, rowsNumber]);
						log(`==>查询结果: 信用代码:${creditCode},备注:${note}\n`);
					} else {
						sheet.addRow([companyName, null, "无效公司名(长度小于2)", rowsNumber]);
					}
				}
				this.lastRowNumber = rowsNumber;
				await workbook.xlsx.writeFile(options.outputExcel);

				if (this.isInterrupted.value) {
					break;
				}
			}
		} 
		catch(e){
				if(e instanceof InterruptError){
					//忽略
				}else{
					throw e
				}
		}
		finally {
			await agent.destroy();
		}
	}
}

async function getWorkbook(options) {
	let workbook;
	if (fs.existsSync(options.outputExcel)) {
		workbook = await new Excel.Workbook().xlsx.readFile(options.outputExcel);
	} else {
		workbook = new Excel.Workbook();
		workbook.creator = "瓜瓜";
		workbook.created = new Date();
		workbook.addWorksheet('default');
		workbook.getWorksheet("default").addRow(["公司名称", "统一社会信用代码", "备注", "对应原Excel行号"]);
	}
	return workbook;
}

async function* readExcel(path, { startRow = 1, endRow = Number.MAX_SAFE_INTEGER, companyNameColumn = 2 }) {
	const workbook = await new Excel.Workbook().xlsx.readFile(path);
	for (let sheet of workbook.worksheets) {
		endRow = Math.min(sheet.actualRowCount, endRow);
		for (let i = startRow; i <= endRow; i++) {
			yield ({ rowsNumber: i, companyName: sheet.getRow(i).getCell(companyNameColumn).value });
		}
	}
}
