document.addEventListener('DOMContentLoaded', () => {
    // Load saved notes
    chrome.storage.local.get(['researchNotes'], function(result) {
        if (result.researchNotes) {
            document.getElementById('notes').value = result.researchNotes;
        }
    });

    // Button event listeners
    document.getElementById('summarizeBtn').addEventListener('click', summarizeText);
    document.getElementById('meaningBtn').addEventListener('click', getMeaningOfText);
    document.getElementById('saveNotesBtn').addEventListener('click', saveNotes);
    
    // Dropdown functionality
    const translateBtn = document.getElementById('translateBtn');
    const languageDropdown = document.getElementById('languageDropdown');
    
    // Toggle dropdown when translate button is clicked
    translateBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        languageDropdown.classList.toggle('hidden');
    });
    
    // Hide dropdown when clicking elsewhere
    document.addEventListener('click', function() {
        languageDropdown.classList.add('hidden');
    });
    
    // Prevent dropdown from closing when clicking inside it
    languageDropdown.addEventListener('click', function(e) {
        e.stopPropagation();
    });
    
    // Add click handlers for each language option
    const languageOptions = document.querySelectorAll('.language-option');
    languageOptions.forEach(option => {
        option.addEventListener('click', function(e) {
            e.preventDefault();
            const selectedLang = this.getAttribute('data-lang');
            translateText(selectedLang);
            languageDropdown.classList.add('hidden');
        });
    });
});

async function summarizeText() {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        const [{ result }] = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: () => window.getSelection().toString()
        });

        if (!result) {
            showResult("Please select some text first");
            return;
        }

        const response = await fetch('http://localhost:8080/api/process/summarize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: result, operation: 'summarize' })
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const text = await response.text();
        showResult(text.replace(/\n/g, '<br>'));
    } catch (error) {
        showResult('Error: ' + error.message);
    }
}

async function getMeaningOfText() {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        const [{ result }] = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: () => window.getSelection().toString()
        });

        if (!result) {
            showResult("Please select some text first");
            return;
        }

        const response = await fetch('http://localhost:8080/api/process/meaning', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: result, operation: 'meaning' })
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const text = await response.text();
        showResult(text.replace(/\n/g, '<br>'));
    } catch (error) {
        showResult('Error: ' + error.message);
    }
}

async function translateText(language = 'marathi') {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        const [{ result }] = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: () => window.getSelection().toString()
        });

        if (!result) {
            showResult("Please select some text first");
            return;
        }

        const response = await fetch('http://localhost:8080/api/process/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                content: result, 
                operation: 'translate', 
                language: language 
            })
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const text = await response.text();
        showResult(text.replace(/\n/g, '<br>'));
    } catch (error) {
        showResult('Error: ' + error.message);
    }
}

async function saveNotes() {
    const notes = document.getElementById('notes').value; // Fixed: was missing .value
    chrome.storage.local.set({ 'researchNotes': notes }, function() {
        showResult('Notes saved successfully');
    });
}

function showResult(content) {
    document.getElementById('results').innerHTML = `
        <div class="result-item">
            <div class="result-content">${content}</div>
        </div>`;
}