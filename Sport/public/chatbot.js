class ChatHistory {
    constructor() {
        this.messages = [];
    }

    addMessage({ message, type, fromHistory = false }) {
        this.messages.push({ message, type, fromHistory });
    }

    getHistory() {
        return this.messages;
    }

    reset() {
        this.messages = [];
    }
}

var historyMessages = new ChatHistory();


// Fonction pour récupérer et traiter le JSON
function fetchJSON(url) {
    // Récupérer le JSON à partir de l'URL fournie
    fetch(url)
        //then est une méthode qui retourne une promesse et prend en paramètre une fonction callback qui sera exécutée une fois la promesse résolue
        .then(response => {
            // Vérifier si la réponse est correcte
            if (!response.ok) {
                // Si la réponse n'est pas correcte, lancer une erreur
                throw new Error('Network response was not ok');
            }
            // Si la réponse est correcte, retourner le JSON
            return response.json();
        })
        //then ici permettra de récupérer le JSON retourné par la promesse
        .then(data => {
            // Vérifier si le JSON est vide ou mal formé
            if (Object.keys(data).length === 0 && data.constructor === Object) {
                // Si le JSON est vide ou mal formé, lancer une erreur
                throw new Error('Empty JSON or malformed JSON');
            }
            //On affiche le JSON dans la console. Il s'agit d'un objet contenant les intentions du chatbot
            console.log(data);
            console.log(historyMessages.getHistory());
            // Passer les intentions à la fonction sendMessage qui sera définie plus tard
            sendMessage(data.intents);
        })
        //catch est une méthode qui retourne une promesse et prend en paramètre une fonction callback qui sera exécutée en cas d'erreur
        .catch(error => {
            // En cas d'erreur, afficher un message d'erreur dans la console
            console.error('There was a problem with the fetch operation:', error);
        });
}

function showMessage(message, type, fromHistory = false) {
    const chatbox = document.getElementById(fromHistory ? 'history-box' : 'chat-box');

    const messageDiv = document.createElement("div");
    messageDiv.textContent = message;

    if (type === 'user') {
        messageDiv.classList.add(fromHistory ? 'og-message-user' : 'user-message');
    } else {
        messageDiv.classList.add(fromHistory ? 'og-message-bot' : 'bot-message');
    }

    historyMessages.addMessage({ message, type, fromHistory });

    chatbox.appendChild(messageDiv);
    chatbox.scrollTop = chatbox.scrollHeight;
}



// Function to process the user's message
function processMessage(intents, message) {
    // By default, the response is "I'm sorry, I'm not sure I understand."
    let response = "I'm sorry, I'm not sure I understand.";
    // Browse chatbot intentions
    intents.forEach(intent => {
        // Check if the user's message matches one of the patterns
        intent.patterns.forEach(pattern => {
            // Check if the user's message contains the pattern
            if (message.toLowerCase().includes(pattern.toLowerCase())) {
                // Select a random answer from the list
                response = intent.responses[Math.floor(Math.random() *
                    intent.responses.length)];
            }
        });
    });
    // Return answer
    return response;
}


function sendMessage(intents) {
    const message = document.getElementById("user-input").value;
    showMessage(message, "user");
    const response = processMessage(intents, message);
    showMessage(response, "bot");
    document.getElementById("user-input").value = "";
}

// create a browser session to store messages
function saveMessages() {
    const allMessages = historyMessages.getHistory();
    const chatMessages = [];
    const historyOnlyMessages = [];

    allMessages.forEach(msg => {
        if (msg.fromHistory) {
            historyOnlyMessages.push(msg);
        } else {
            chatMessages.push(msg);
        }
    });
    console.log("ChatMessages:", chatMessages);
    console.log("HistoryMessages:", historyOnlyMessages);


    sessionStorage.setItem('chatHistory', JSON.stringify(chatMessages));
    sessionStorage.setItem('historyHistory', JSON.stringify(historyOnlyMessages));
}


function loadMessages() {
    const chatHistory = JSON.parse(sessionStorage.getItem('chatHistory')) || [];
    const previousHistory = JSON.parse(sessionStorage.getItem('historyHistory')) || [];

    historyMessages.reset();

    previousHistory.forEach(entry => {
        showMessage(entry.message, entry.type, true);
    });

    chatHistory.forEach(entry => {
        showMessage(entry.message, entry.type, true);
    });
}


function clearMessages() {
    sessionStorage.clear();
    document.getElementById('chat-box').innerHTML = '';
    document.getElementById('history-box').innerHTML = '';
    historyMessages.reset();
}



window.addEventListener('load', loadMessages);
window.addEventListener('beforeunload', saveMessages);



