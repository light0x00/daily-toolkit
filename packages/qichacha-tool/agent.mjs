import { log, logThenNotify, InterruptError } from './toolkit.mjs';
import { default as SeleiumDefault } from 'selenium-webdriver';
const { Builder, Browser, By, Key, until } = SeleiumDefault
import notifier from 'node-notifier'

export async function getAgent({ minInterval = 500 }, isInterrupted) {
	let driver = await new Builder().forBrowser("chrome").build();
	const CACHE = new Map();
	let lastTimeSearch = Date.now();
	return {
		async openSearchPage({ cookie }) {
			await driver.get("https://www.qcc.com/");
			if (cookie != null) {
				await this.setCookie(cookie);
			}
		},

		async setCookie(cookie) {
			const items = cookie.split(";").map(item => {
				let [name, value] = item.split("=");
				return { name: name.trimStart(" ").trimEnd(" "), value: value.trimStart(" ").trimEnd(" ") };
			});
			for (const item of items) {
				await driver.manage().deleteCookie(item.name);
				await driver.manage().addCookie(item);
			}
		},

		async searchInInterval(searchString) {
			let interval = Date.now() - lastTimeSearch;
			if (interval < minInterval) {
				return new Promise(
					(rs, rj) => {
						setTimeout(async () => {
							lastTimeSearch = Date.now();
							try {
								rs(await this.search(searchString));
							} catch (e) {
								rj(e)
							}
						}, minInterval - interval);
					}
				);
			} else {
				lastTimeSearch = Date.now();
				return this.search(searchString);
			}
			// await driver.wait(until.titleIs(`${searchString}的搜索结果-企查查`), 10000);
		},
		async titleIs(title, timeout = 1000) {
			try {
				await driver.wait(until.titleIs(title), timeout);
				return true;
			} catch (e) {
				return false;
			}
		},
		async search(searchString) {
			if (CACHE.has(searchString)) {
				return CACHE.get(searchString);
			}
			//等待搜索结果页面加载完成
			// let inputSearch = await driver.findElement(By.id("searchKey"))
			// await inputSearch.clear()
			// await inputSearch.sendKeys(searchString, Key.RETURN);
			await driver.get("https://www.qcc.com/web/search?key=" + searchString);
			while (true) {
				try {
					await driver.wait(until.titleIs(`${searchString}的搜索结果-企查查`), 3000);
					////https://www.qcc.com/web/search?key=%E5%B7%A5%E5%95%86%E9%93%B6%E8%A1%8C
					break;
				} catch (e) {
					//次数频繁用户验证
					if (await this.titleIs(`用户验证 - 企查查`, 1)) {
						logThenNotify("触发企查查操作频繁验证,快去完成验证吧!");
					}
					//访问限制 - 企查查
					else if (await this.titleIs(`访问限制 - 企查查`, 1)) {
						logThenNotify("触发企查查访问限制! 一小时后刷新页面试试! (到时程序会自动接着运行)");
					} else if (await this.titleIs(`会员登录 - 企查查`, 1)) {
						logThenNotify("未登录,快去登录吧!");
					} else {
						//可能是登录了但是页面没进入搜索页
						logThenNotify("自动跳转到搜索页");
						await driver.get("https://www.qcc.com/web/search?key=" + searchString);
					}
				}
				if (isInterrupted.value == true) {
					throw new InterruptError("用户手动中断")
				}
			}
			let creditCode = null, note = "";
			try {
				creditCode = await driver.findElement(By.xpath("/html/body/div[1]/div[2]/div[2]/div/div/div[1]/div[2]/div/div[2]/div/div[1]/div[1]/span/span/span/span[1]")).getText();
				note = "精确匹配";
			} catch (e) {
				try {
					creditCode = await driver.findElement(By.xpath("/html/body/div/div[2]/div[2]/div[3]/div/div[2]/div/table/tr[1]/td[3]/div/div[3]/div[1]/span[4]/span/span/span[1]")).getText();
					note = "选取第一条";
				} catch (e2) {
					note = "查询失败";
				}
			}

			const resut = { creditCode, note };
			CACHE.set(searchString, resut);
			return resut;
		},
		async destroy() {
			await driver.quit();
		}
	};

}
