async function scrapeNews() {
	console.log('Scraping news...');

	if (Math.random > 0.7) {
		return {
			headline: `Breaking: Major market movement reported`,
			summary: `Financial markets are experiencing significant volatility as new economic data emerges.`,
			timestamp: Date.now(),
		};
	}
}

async function startNewsMontior() {
	while (true) {
		try {
			const news = await scrapeNews();
			if (news) {
				console.log('New headline found: ', news);
				broadcastFunction('news', news);
			}
		} catch (error) {
			console.error('Error scraping news:', error);
		}
	}
}
