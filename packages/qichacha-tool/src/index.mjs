#!/usr/bin/env node --experimental-modules --no-warnings
import { getOpts } from './getopts.mjs';
import path from "path"
import fs from 'fs'
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { log, logThenNotify, dateToIsoString } from './toolkit.mjs'
import { Worker } from './workflow.mjs';
import { registerExitListener } from './keyboard-listener.mjs'
import notifier from 'node-notifier';


(async function (options) {
	ohayo();
	options.outputExcel = options.outputExcel ?? path.resolve(options.outputPath, `信用代码查询结果-${dateToIsoString(new Date())}.xlsx`)
	log(`本次将从第 ${options.startRow} 行开始处理, 结果将写入Excel文件:\n ${options.outputExcel}\n`)

	let worker = new Worker(options)

	registerExitListener(() => {
		console.log("⌛️ 将在几秒内中断,请耐心等待一下子!")
		worker.interrupt()
		process.stdin.pause();
		// process.exit()
	})

	try {
		await worker.work(options)
		goodbye();
	} catch (error) {
		console.error(error)
		notifier.notify("ʕ ￫ ᴥ ￩ ʔ 貌似出错了")
		console.log(`
		================== ʕ ￫ ᴥ ￩ ʔ 貌似出错了 =================
		如果还有未处理的数据,请复制以下指令继续处理,或者咨询程序作者: 
		qcc --inputExcel ${options.inputExcel} --startRow ${worker.lastRowNumber + 1} --outputExcel ${options.outputExcel}
		============================================================`)
	} finally {
		console.log(`
本次任务结束,处理行范围: ${Math.min(options.startRow,worker.lastRowNumber)} ~ ${worker.lastRowNumber} 行,处理结果已写入Excel文件,快去看看吧: 
${options.outputExcel}

👆👆👆 处理结果保存在这里!
`)
	}
	if (worker.interrupted()) {
		console.log(`
⏸️ 处理已中断! 请复制以下指令以备下次执行,继续处理后续数据:

qcc --inputExcel ${options.inputExcel} --startRow ${worker.lastRowNumber + 1} --outputExcel ${options.outputExcel}

👆👆👆 复制它!
	`)
	}
})(getOpts())

function ohayo() {
	console.log(`
================= ฅ^•ﻌ•^ฅ 欢迎使用企查查小助手 =================
 ∧,,,∧
( ̳•·• ̳)
/    > >☆ meow!
============================================================
	`);
}

function goodbye() {
	console.log(`
====================== /ᐠ. .ᐟ\\ฅ 下次再见 =====================
${fs.readFileSync(path.join(__dirname, 'banner_sleep.txt')).toString()}
============================================================`);
}