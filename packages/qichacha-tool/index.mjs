#!/usr/bin/env node --experimental-modules --no-warnings
import { default as SeleiumDefault } from 'selenium-webdriver';
const { Builder, Browser, By, Key, until } = SeleiumDefault
import Excel from 'exceljs';
import { getOpts } from './getopts.mjs';
import path from "path"
import fs from 'fs'
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


(async function (options) {
	console.log(`
=============== ฅ^•ﻌ•^ฅ 欢迎使用企查查小助手 ===============
 ∧,,,∧
( ̳•·• ̳)
/    > >☆ meow!
============================================================
注意: 如果页面提示扫码登录,请在30s内完成
	`)
	await work(options)

})(getOpts())

async function* readExcel(path, { startRow = 1, endRow = Number.MAX_SAFE_INTEGER, companyNameColumn = 2 }) {
	const workbook = await new Excel.Workbook().xlsx.readFile(path);
	for (let sheet of workbook.worksheets) {
		endRow = Math.min(sheet.actualRowCount, endRow)
		for (let i = startRow; i <= endRow; i++) {
			yield ({ rowsNumber: i, companyName: sheet.getRow(i).getCell(companyNameColumn).value })
		}
	}
}

async function work(options) {
	//excel
	let workbook
	if (options.outputExcel != null) {
		workbook = await new Excel.Workbook().xlsx.readFile(options.outputExcel);
	} else {
		options.outputExcel = path.resolve(options.outputPath, `信用代码查询结果-${new Date().toISOString()}.xlsx`)
		workbook = new Excel.Workbook();
		workbook.creator = "瓜瓜";
		workbook.created = new Date();
		workbook.addWorksheet('default');
		workbook.getWorksheet("default").addRow(["公司名称", "统一社会信用代码", "备注"])
	}
	// const workbook = await getWorkbook(options);
	const sheet = workbook.getWorksheet("default")
	//browser agent
	let ag = await agent()

	try {
		await ag.openSearchPage()

		var lastRowNumber = options.startRow
		for await (let { rowsNumber, companyName } of readExcel(options.inputExcel, options)) {
			if (companyName != null && rowsNumber > 1) {
				if (companyName.length > 1) {
					let { creditCode, note } = await ag.search(companyName)
					sheet.addRow([companyName, creditCode, note])
				} else {
					sheet.addRow([companyName, null, null])
				}
			}
			lastRowNumber = rowsNumber
		}
		console.log(`==================== /ᐠ. .ᐟ\ฅ 下次再见 ===================
			${fs.readFileSync(path.join(__dirname, 'banner_sleep.txt')).toString()}
			============================================================`)

	} catch (e) {
		console.log(`查询中断,发生异常:`, e)
		console.log(`
================== ʕ ￫ ᴥ ￩ ʔ 貌似出错了 =================
如果还有未处理的数据,请复制以下指令继续处理,或者咨询程序作者: 
qcc --inputExcel ${options.inputExcel} --startRow=${lastRowNumber + 1} --outputExcel=${options.outputExcel}
============================================================`)
	} finally {
		await workbook.xlsx.writeFile(options.outputExcel);

		console.log(`
本次任务结束,处理行范围: ${options.startRow} ~ ${lastRowNumber} 行,处理结果已写入Excel文件,快去看看吧: 
${options.outputExcel}
`)
		await ag.destroy()
	}
}

async function getWorkbook({ outputExcel }) {

	return workbook;
}

async function agent() {
	let driver = await new Builder().forBrowser("chrome").build();
	const CACHE = new Map()

	return {
		async openSearchPage() {
			await driver.get("https://www.qcc.com/");
		},
		async search(searchString) {
			if (CACHE.has(searchString)) {
				return CACHE.get(searchString)
			}
			process.stdout.write(`公司名称:${searchString}`)

			let inputSearch = await driver.findElement(By.id("searchKey"))
			await inputSearch.clear()
			await inputSearch.sendKeys(searchString, Key.RETURN);

			//等待搜索结果页面加载完成
			try {
				await driver.wait(until.titleIs(`${searchString}的搜索结果-企查查`), 45000);
			} catch {
				throw new Error("超时退出!")
			}
			// var title = await driver.getTitle();
			// console.log('Title is:', title);

			let creditCode = null, note = ""
			try {
				creditCode = await driver.findElement(By.xpath("/html/body/div/div[2]/div[2]/div[3]/div/div[2]/div/table/tr[1]/td[3]/div/div[4]/div[1]/span[4]/span/span/span[1]")).getText()
				note = "精确匹配"
			} catch (e) {
				try {
					creditCode = await driver.findElement(By.xpath("/html/body/div/div[2]/div[2]/div[3]/div/div[2]/div/table/tr[1]/td[3]/div/div[3]/div[1]/span[4]/span/span/span[1]")).getText()
					note = "选取第一条"
				} catch (e2) {
					note = "查询失败"
				}
			}
			process.stdout.write(`,信用代码:${creditCode},备注:${note}\n`)

			const resut = { creditCode, note }
			CACHE.set(searchString, resut)
			return resut
		},
		async destroy() {
			await driver.quit();
		}
	}
}