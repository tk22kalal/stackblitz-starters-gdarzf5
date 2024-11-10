import { API_URLS } from './config.js';

export async function fetchFromAPI(prompt) {
    try {
        const response = await fetch(API_URLS.text, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            })
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        return data.candidates[0]?.content?.parts?.[0]?.text;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}