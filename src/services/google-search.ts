// A simple service to call the Google Custom Search API

type SearchResult = {
    title: string;
    link: string;
    snippet: string;
};
  
export async function searchGoogle(query: string): Promise<SearchResult[]> {
    const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
    const cx = process.env.GOOGLE_CX;

    if (!apiKey || !cx) {
        console.error("Google Search API key or CX not found in environment variables.");
        // Return an empty array or throw an error, depending on desired behavior
        return [];
    }

    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(
        query
    )}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`Google Search API request failed with status ${response.status}: ${errorBody}`);
            throw new Error(`Google Search API request failed with status ${response.status}`);
        }
        const data = await response.json();
        
        if (!data.items) {
            return [];
        }

        return data.items.map((item: any) => ({
            title: item.title,
            link: item.link,
            snippet: item.snippet,
        }));

    } catch (error) {
        console.error("Error fetching Google Search results:", error);
        throw error;
    }
}
