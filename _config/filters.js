import { DateTime } from "luxon";

export default function(eleventyConfig) {
	eleventyConfig.addFilter("readableDate", (dateObj, format, zone) => {
		// Formatting tokens for Luxon: https://moment.github.io/luxon/#/formatting?id=table-of-tokens
		return DateTime.fromJSDate(dateObj, { zone: zone || "utc" }).toFormat(format || "dd LLLL yyyy");
	});

	eleventyConfig.addFilter("htmlDateString", (dateObj) => {
		// dateObj input: https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
		return DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat('yyyy-LL-dd');
	});

	// Get the first `n` elements of a collection.
	eleventyConfig.addFilter("head", (array, n) => {
		if(!Array.isArray(array) || array.length === 0) {
			return [];
		}
		if( n < 0 ) {
			return array.slice(n);
		}

		return array.slice(0, n);
	});

	// Return the smallest number argument
	eleventyConfig.addFilter("min", (...numbers) => {
		return Math.min.apply(null, numbers);
	});

	// Return the keys used in an object
	eleventyConfig.addFilter("getKeys", target => {
		return Object.keys(target);
	});

	eleventyConfig.addFilter("filterTagList", function filterTagList(tags) {
		return (tags || []).filter(tag => ["all", "posts"].indexOf(tag) === -1);
	});

	eleventyConfig.addFilter("sortAlphabetically", strings =>
		(strings || []).sort((b, a) => b.localeCompare(a))
	);

	// Resolves a relative image path to an absolute URL based on the post's URL
	eleventyConfig.addFilter("resolvePostImage", (imagePath, pageUrl) => {
		if (!imagePath) return "";
		if (imagePath.startsWith("http") || imagePath.startsWith("/")) return imagePath;

		// Logic: If image is relative (e.g. ./images/foo.png), resolve it relative to the parent of the post URL.
		// Example: Post at /tech-blog/my-post/ -> Parent /tech-blog/ -> Image /tech-blog/images/foo.png
		
		// Remove leading ./
		const cleanPath = imagePath.replace(/^\.\//, '');
		
		// Split URL into segments
		const parts = pageUrl.split('/').filter(p => p);
		
		// If we have segments, pop the last one (the post slug) to get the parent "folder"
		if (parts.length > 0) {
			parts.pop();
		}
		
		const parentPath = parts.join('/');
		
		// Construct absolute path
		return `/${parentPath}/${cleanPath}`.replace(/\/+/g, '/');
	});
};
