import { Schema } from 'mongoose';

// Mongoose skips validators on update ops by default - this forces them on.
// Applied per-schema, not via mongoose.plugin(), since tests import models
// directly before server.ts would ever register a global plugin.
export function applyRunValidators(schema: Schema) {
	schema.pre(
		['findOneAndUpdate', 'findOneAndReplace', 'updateOne', 'updateMany', 'replaceOne'],
		function (this: { setOptions: (options: Record<string, boolean>) => void }) {
			this.setOptions({ runValidators: true });
		}
	);
}
