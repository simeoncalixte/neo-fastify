interface NeoResponse {

}

class NeoService {
    static api_key: string = process.env.NASA_API_KEY || 'DEMO';
    static api_url: string = process.env.NASA_API_URL || 'https://api.nasa.gov';

     
    static async NeoFeed(start_date: string, end_date: string): Promise<NeoResponse> {
        try {
            const base = this.api_url.endsWith('/') ? this.api_url : `${this.api_url}/`;
            const results = await fetch(`${base}neo/rest/v1/feed?start_date=${start_date}&end_date=${end_date}&api_key=${this.api_key}`);
            if (!results.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await results.json();
            return data;
        }catch (error) {
            throw new Error('Failed to fetch NEO data');
        }
    }

    static async getNeoLookUp(asteroid_id: number): Promise<NeoResponse> {
        try {
            const base = this.api_url.endsWith('/') ? this.api_url : `${this.api_url}/`;
            const results = await fetch(`${base}neo/rest/v1/neo/${asteroid_id}?api_key=${this.api_key}`)
            if (!results.ok) {
                const error = await results.text();
                throw new Error('Network response was not ok');
            }
            const data = await results.json();
            return data;
        }catch (error) {
            throw new Error('Failed to fetch NEO data');
        }
    }


    // Accept page as a string so any cursor or key returned from upstream is forwarded unchanged.
    static async getNeoBrowse(page = 0, size = 20): Promise<NeoResponse> {
        try {
            const base = this.api_url.endsWith('/') ? this.api_url : `${this.api_url}/`;
            const results = await fetch(`${base}neo/rest/v1/neo/browse?api_key=${this.api_key}${page ? `&page=${page}` : ''}${size ? `&size=${size}` : ''}`);
            if (!results.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await results.json();
            return data;
        }catch (error) {
            throw new Error('Failed to fetch NEO data');
        }
    }

}
export default NeoService;