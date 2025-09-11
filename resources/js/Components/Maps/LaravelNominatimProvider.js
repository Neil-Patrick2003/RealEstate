export class LaravelNominatimProvider {
    constructor(options = {}) {
        this.options = options;
    }

    async search({ query }) {
        const response = await fetch(`/api/nominatim-search?q=${encodeURIComponent(query)}`);
        const results = await response.json();

        return results.map(result => {
            const [south, north, west, east] = result.boundingbox.map(parseFloat);
            return {
                x: parseFloat(result.lon),
                y: parseFloat(result.lat),
                label: result.display_name,
                bounds: [
                    [south, west],
                    [north, east]
                ],
                raw: result,
            };
        });
    }
}
