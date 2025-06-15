/**
 * Function to fetch data from the API
 * @param {string} endpoint - The API endpoint to fetch data from
 * @returns {Promise<any>} The data from the API
 */
async function getApiData(endpoint) {
    try {
        console.log(`Fetching from: ${API_URL}${endpoint}`);
        
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`API Response Error: ${response.status} - ${errorText}`);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API Error:', error);
        if (error.message.includes('Failed to fetch')) {
            console.error('This error usually means the API is not running or is not accessible.');
            console.error('Please verify that your API is running at:', API_URL);
        }
        throw error;
    }
}
