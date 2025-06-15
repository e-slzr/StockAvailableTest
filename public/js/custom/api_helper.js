/**
 * Function to fetch data from the API
 * @param {string} endpoint - The API endpoint to fetch data from
 * @returns {Promise<any>} The data from the API
 */
async function getApiData(endpoint) {
    try {

        
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
    } catch (error) {        if (error.message.includes('Failed to fetch')) {
            throw new Error(`API is not accessible. Please verify that it is running at ${API_URL}`);
        }
        throw error;
    }
}

/**
 * Function to post data to the API
 * @param {string} endpoint - The API endpoint to post data to
 * @param {any} data - The data to post to the API
 * @returns {Promise<any>} The response data from the API
 */
async function postApiData(endpoint, data) {
    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`API Response Error: ${response.status} - ${errorText}`);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

/**
 * Function to update data on the API
 * @param {string} endpoint - The API endpoint to update data on
 * @param {string|number} id - The ID of the data to update
 * @param {any} data - The new data to update on the API
 * @returns {Promise<any>} The response data from the API
 */
async function updateApiData(endpoint, id, data) {
    try {
        // Si el endpoint ya incluye el ID, lo usamos directamente
        const url = `${API_URL}${endpoint}`;

        
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`API Response Error: ${response.status} - ${errorText}`);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

/**
 * Function to delete data from the API
 * @param {string} endpoint - The API endpoint to delete data from
 * @returns {Promise<boolean>} True if the deletion was successful, otherwise false
 */
async function deleteApiData(endpoint) {
    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'DELETE',
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

        return true;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Helper function for showing messages
function showMessage(title, message, type = 'info') {
    const messageModal = document.getElementById('messageModal');
    const messageModalLabel = document.getElementById('messageModalLabel');
    const messageModalBody = document.getElementById('messageModalBody');

    if (messageModal && messageModalLabel && messageModalBody) {
        messageModalLabel.textContent = title;
        messageModalBody.textContent = message;
        const modal = new bootstrap.Modal(messageModal);
        modal.show();
    } else {        alert(`${title}: ${message}`);
    }
}

// Helper function for showing confirmation dialogs
function showConfirmDialog(title, message) {
    return new Promise((resolve) => {
        if (confirm(message)) {
            resolve(true);
        } else {
            resolve(false);
        }
    });
}
