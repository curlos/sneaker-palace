import Fuse from 'fuse.js';

const Shoe = require('../models/Shoe');

class SearchService {
	private fuse: Fuse<any> | null = null;
	private shoes: any[] = [];
	private isInitialized = false;

	async initialize(): Promise<void> {
		try {
			console.log('Loading shoes for search service...');
			
			// Load all shoes from database
			this.shoes = await Shoe.find({}).lean();
			
			console.log(`Loaded ${this.shoes.length} shoes for search`);

			// Configure FuseJS with weighted search fields
			const fuseOptions = {
				keys: [
					{
						name: 'name',
						weight: 0.4, // Highest weight - shoe name most important
					},
					{
						name: 'brand',
						weight: 0.3, // High weight - brand is very important
					},
					{
						name: 'colorway',
						weight: 0.2, // Medium weight
					},
					{
						name: 'silhouette',
						weight: 0.2, // Lower weight
					},
					{
						name: 'story',
						weight: 0.2, // Lowest weight - story content
					},
				],
				threshold: 0.3, // Lower = more strict, higher = more fuzzy
				includeScore: true,
				includeMatches: true,
				minMatchCharLength: 3,
			};

			// Initialize FuseJS with all shoes
			this.fuse = new Fuse(this.shoes, fuseOptions);
			this.isInitialized = true;
			
			console.log('Search service initialized successfully');
		} catch (error) {
			console.error('Failed to initialize search service:', error);
			throw error;
		}
	}

	search(query: string): any[] {
		if (!this.isInitialized || !this.fuse) {
			throw new Error('Search service not initialized');
		}

		if (!query || query.trim().length === 0) {
			return this.shoes;
		}

		const results = this.fuse.search(query.trim());
		return results.map(result => result.item);
	}

	getAllShoes(): any[] {
		return this.shoes;
	}

	isReady(): boolean {
		return this.isInitialized;
	}
}

// Export singleton instance
export const searchService = new SearchService();