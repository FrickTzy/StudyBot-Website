const addButton = document.getElementById('addQuestionList');
const container = document.getElementById('questionListsContainer');
const generateQuestionsButton = document.getElementById('generateQuestions'); // Add this line
const saveToDatabaseButton = document.getElementById('saveToDatabase'); // New save button

const getQuestionListUrl = "https://studybotapi.pythonanywhere.com/getAllQuestionList";
const setQuestionListUrl = "https://studybotapi.pythonanywhere.com/uploadQuestionList";
const setUploadedQuestionUrl = "https://studybotapi.pythonanywhere.com/setUploadedQuestion";
const getChoicesUrl = "https://studybotapi.pythonanywhere.com/api/generateChoices";


loadQuestionLists();

async function loadQuestionLists() {
    fetch(getQuestionListUrl)
    .then(response => response.text())
    .then(data => {
        try {
            const jsonData = JSON.parse(data);
            console.log(jsonData);
            jsonData.forEach(list => {
                console.log('Title:', list.title);
                console.log('Questions:', list.questions);
                createQuestionList(list.title, list.questions);
            });
        } catch (error) {
            console.error('Error parsing JSON:', error);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function createQuestionList(title = "", questions = []) {
    const newQuestionListDiv = document.createElement('div');
    newQuestionListDiv.className = 'QuestionListDiv';
    newQuestionListDiv.setAttribute('drop-down', 'toggle-off');

    newQuestionListDiv.innerHTML = `
        <div style="display: flex; justify-content: space-evenly; align-items: center;">
            <div style="display: flex; align-items: center; gap: 10px;">
                <button type="button" class="dropdown-button" style="border: none; background: none; padding: 0;">
                    <img class="DropLogo dropdown-icon" src="Images/down_logo.png" height="50" width="50" alt="Dropdown Logo" />
                </button>
                <input class="TextInputBox" type="text" value="${title}" />
                <button type="button" class="add-question-button" style="border: none; background: none; padding: 0;">
                    <img class="AddLogo" src="Images/add_logo.png" height="40" width="40" alt="Add Logo" />
                </button>
                <button type="button" class="trash-button" style="border: none; background: none; padding: 0;">
                    <img class="TrashLogo" src="Images/trash_can_logo.png" height="40" width="40" alt="Trash Logo" />
                </button>
                <button type="button" class="upload-button" style="border: none; background: none; padding: 0;">
                    <img class="UploadLogo" src="Images/upload_logo.png" height="40" width="40" alt="Upload Logo" />
                </button>
            </div>
            <div style="display: flex; justify-content: center; align-items: center; gap: 5px;">
            </div>
        </div>
        <div class="dropdown-content" style="display: none; margin-top: 10px; text-align: center;">
            ${questions.map(q => `
            <div class="question-answer-row" style="display: flex; justify-content: center; align-items: center; gap: 20px; width: 100%;">
                <input class="QuestionInputBox" type="text" value="${q.question || ""}" />
                <input class="QuestionInputBox" type="text" value="${q.answer || ""}" />
                <button type="button" class="delete-question-button" style="border: none; background: none; padding: 0;">
                    <img class="TrashLogo" src="Images/trash_can_logo.png" height="20" width="20" alt="Delete Logo" />
                </button>
            </div>
            `).join('')}
        </div>
    `;

    container.appendChild(newQuestionListDiv);

    // Add event listeners for the question list itself (dropdown, delete list, etc.)
    addEventListeners(newQuestionListDiv);

    // Add event listeners for deleting each question-answer row
    const deleteButtons = newQuestionListDiv.querySelectorAll('.delete-question-button');
    deleteButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const row = e.target.closest('.question-answer-row');
            row.remove(); // Remove the specific question-answer row
        });
    });

    // Add event listener for the upload button
    const uploadButton = newQuestionListDiv.querySelector('.upload-button');
    uploadButton.addEventListener('click', async () => {
        await uploadQuestionList(newQuestionListDiv);
    });
}

// Add event listeners for buttons in the question list
function addEventListeners(questionListDiv) {
    const dropdownButton = questionListDiv.querySelector('.dropdown-button');
    const deleteButton = questionListDiv.querySelector('.trash-button');
    const addQuestionButton = questionListDiv.querySelector('.add-question-button');

    dropdownButton.addEventListener('click', () => toggleDropdown(questionListDiv, dropdownButton));
    deleteButton.addEventListener('click', () => questionListDiv.remove());
    addQuestionButton.addEventListener('click', () => addQuestionRow(questionListDiv)); // Pass the correct context
}

// Function to toggle dropdown visibility and change the icon
function toggleDropdown(questionListDiv, dropdownButton) {
    const dropdownContent = questionListDiv.querySelector('.dropdown-content');
    const dropdownIcon = dropdownButton.querySelector('.dropdown-icon');

    const isDisplayed = dropdownContent.style.display === 'block';
    dropdownContent.style.display = isDisplayed ? 'none' : 'block';

    // Change the icon based on dropdown state
    dropdownIcon.src = isDisplayed ? 'Images/down_logo.png' : 'Images/up_logo.png'; // Change to up_logo.png when opened
}

// Function to delete a question-answer row
function deleteQuestionRow(row) {
    row.remove(); // Remove the specific question-answer row
}

// Function to add a new question-answer row
function addQuestionRow(questionListDiv) {
    const dropdownContent = questionListDiv.querySelector('.dropdown-content');
    const newRow = document.createElement('div');
    newRow.className = 'question-answer-row'; // Add class for easier reference
    newRow.style.display = 'flex';
    newRow.style.justifyContent = 'center';
    newRow.style.alignItems = 'center';
    newRow.style.gap = '20px';
    newRow.style.width = '100%';

    newRow.innerHTML = `
        <input class="QuestionInputBox" type="text" placeholder="Question"/>
        <input class="QuestionInputBox" type="text" placeholder="Answer" />
        <button type="button" class="delete-question-button" style="border: none; background: none; padding: 0;">
            <img class="TrashLogo" src="Images/trash_can_logo.png" height="20" width="20" alt="Delete Logo" />
        </button>
    `;

    dropdownContent.appendChild(newRow);

    // Add event listener for the delete button in the new row
    const deleteButton = newRow.querySelector('.delete-question-button');
    deleteButton.addEventListener('click', () => deleteQuestionRow(newRow)); // Pass the newRow context
}

// Function to collect all question lists and their questions
function collectQuestionLists() {
    const questionLists = [];
    const questionListDivs = container.querySelectorAll('.QuestionListDiv');

    questionListDivs.forEach(div => {
        const title = div.querySelector('.TextInputBox').value;  // Get title
        const questions = [];

        // Get all question-answer rows
        const questionRows = div.querySelectorAll('.question-answer-row');
        questionRows.forEach(row => {
            const questionInput = row.querySelector('.QuestionInputBox:nth-child(1)').value; // First input
            const answerInput = row.querySelector('.QuestionInputBox:nth-child(2)').value; // Second input
            questions.push({ question: questionInput, answer: answerInput });
        });

        questionLists.push({ title: title, questions: questions });
    });

    return questionLists;
}

// Function to upload a single question list
async function uploadQuestionList(questionListDiv) {
    const title = questionListDiv.querySelector('.TextInputBox').value; // Get the title
    const questions = [];

    // Get all question-answer rows
    const questionRows = questionListDiv.querySelectorAll('.question-answer-row');
    questionRows.forEach(row => {
        const questionInput = row.querySelector('.QuestionInputBox:nth-child(1)').value; // First input
        const answerInput = row.querySelector('.QuestionInputBox:nth-child(2)').value; // Second input
        questions.push({ question: questionInput, answer: answerInput });
    });

    const questionList = { title: title, questions: questions };

    try {
        const choicesResponse = await fetch(getChoicesUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(questionList)
        });
        const updatedQuestionList = await choicesResponse.text();
        let cleanedQuestionList = updatedQuestionList.replace(/```json|```/g, '');
        console.log('Updated question list with choices:', cleanedQuestionList);

        // Upload the updated question list
        const response = await fetch(setUploadedQuestionUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: cleanedQuestionList
        });

        if (response.ok) {
            console.log('Uploaded successfully:', await response.json());
            alert('Uploaded Successfully');
        } else {
            const responseText = await response.text();
            console.error('Upload failed:', responseText);
        }
    } catch (error) {
        console.error('Error during upload:', error.message);
    }
}


// Add event listener for the add button
addButton.addEventListener('click', () => {
    createQuestionList(); // Call function to create a new question list
});

generateQuestionsButton.addEventListener('click', () => {
    // Redirect to another HTML page
    window.location.href = 'generate_question.html'; // Change this to your desired URL
});



// Add event listener for the save to database button
saveToDatabaseButton.addEventListener('click', async () => {
    const questionLists = collectQuestionLists();  // Collect all question lists
    const json = JSON.stringify(questionLists); // Convert to JSON

    try {
        const response = await fetch(setQuestionListUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: json // Send the JSON data
        });

        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        alert('Question lists saved successfully!');
    } catch (error) {
        console.error('Error saving question lists:', error);
        alert('Error saving question lists');
    }
});

function checkForGeneratedQuestions(){
    const params = JSON.parse(localStorage.getItem('generatedQuestionParams'));

    if (params) {
        localStorage.clear();
        let title = params["title"];
        let questions = params["questions"];
        console.log('Retrieved Params:', params);
        createQuestionList(title, questions);
    } else {
        console.error('No parameters found in localStorage.');
    }
}

document.addEventListener('DOMContentLoaded', checkForGeneratedQuestions);

