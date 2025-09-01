import Fuse from 'fuse.js';

const Shoe = require('../models/Shoe');

class SearchService {
	private fuse: Fuse<any> | null = null;
	private shoes: any[] = [];
	private searchableShoes: any[] = []; // Lightweight objects for FuseJS
	private isInitialized = false;

	async initialize(): Promise<void> {
		try {
			console.log('Loading shoes for search service...');
			
			// Load all shoes from database
			this.shoes = await Shoe.find({}).lean();
			
			// Create lightweight search objects with only the fields we need
			this.searchableShoes = this.shoes.map((shoe: any, index: number) => ({
				index, // Reference back to full shoe object
				name: shoe.name,
				brand: shoe.brand,
				colorway: shoe.colorway,
				silhouette: shoe.silhouette,
				story: shoe.story
			}));
			
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

			// Initialize FuseJS with lightweight search objects
			this.fuse = new Fuse(this.searchableShoes, fuseOptions);
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
		// Map back to full shoe objects using the index
		return results.map(result => this.shoes[result.item.index]);
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