const generateQuestionUrl = "https://studybotapi.pythonanywhere.com/api/generateChoices";
const questionCharacterLengthLimit = 40;
const choicesCharacterLengthLimit = 9;
const withChoices = true;
let currentlyGeneratingQuestion = false;

document.addEventListener('DOMContentLoaded', () => {

    const difficultyButtonWrapper = document.querySelector('.buttonWrapper:nth-child(1)');
    const quantityButtonWrapper = document.querySelector('.buttonWrapper:nth-child(2)');

    const difficultyOptions = ['Easy', 'Medium', 'Hard', 'Random'];
    const quantityOptions = Array.from({ length: 10 }, (_, i) => (i + 1) * 5); // Creates [5, 10, 15, ..., 50]

    // Create dropdown elements for difficulty
    const difficultyDropdown = createDropdown(difficultyOptions, "difficultyValue");
    const quantityDropdown = createDropdown(quantityOptions.map(num => num.toString()), "quantityValue");

    difficultyButtonWrapper.appendChild(difficultyDropdown);
    quantityButtonWrapper.appendChild(quantityDropdown);

    // Add event listeners to the buttons
    const difficultyButton = difficultyButtonWrapper.querySelector('#difficultyDropdown');
    const quantityButton = quantityButtonWrapper.querySelector('#quantityDropdown');
    const generateButton = document.getElementById('generateButton');

    difficultyButton.addEventListener('click', () => {
        toggleDropdown(difficultyDropdown);
    });

    quantityButton.addEventListener('click', () => {
        toggleDropdown(quantityDropdown);
    });

    generateButton.addEventListener('click', async () => {
        const topicInput = document.getElementById('topicInput');
        const questionTopic = topicInput.value.trim();
        if (questionTopic === '') {
            alert('Please enter a topic before generating questions.');
            return;
        }
        if(currentlyGeneratingQuestion){
            alert("Already Generating, please wait!");
            return;
        }
        currentlyGeneratingQuestion = true;
        const difficultyInput = document.getElementById('difficultyValue');
        const quantityInput = document.getElementById('quantityValue');
        const descriptionInput = document.getElementById('optionalDescription')

        const questionAmount = quantityInput.textContent;
        const difficulty = difficultyInput;
        const optionalDescription = descriptionInput.value.trim();

        // Prepare the parameters for the POST request
        const params = {
            "topic": questionTopic,
            "numberOfQuestions": parseInt(questionAmount),
            "difficulty": difficulty,
            "withChoices": withChoices,
            "questionCharacterLimit": questionCharacterLengthLimit,
            "choicesCharacterLimit": choicesCharacterLengthLimit,
            "optionalDescription": optionalDescription
        };

        try {
            const response = await fetch(generateQuestionUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(params)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const newData = {"title": questionTopic, "questions": data}
            localStorage.setItem('generatedQuestionParams', JSON.stringify(newData));
            currentlyGeneratingQuestion = false;
            window.location.href = 'index.html';

        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while generating questions.');
            currentlyGeneratingQuestion = false;
        }
    });
});

// Function to create a dropdown
function createDropdown(options, buttonInput) {
    const dropdown = document.createElement('div');
    dropdown.classList.add('dropdown');

    options.forEach(option => {
        const optionElement = document.createElement('div');
        optionElement.classList.add('dropdown-item');
        optionElement.textContent = option;

        // Add click event to update button text and close dropdown
        optionElement.addEventListener('click', () => {
            const button = document.getElementById(buttonInput);
            button.textContent = option;
            dropdown.style.display = 'none';
        });

        dropdown.appendChild(optionElement);
    });

    dropdown.style.display = 'none'; // Initially hidden
    return dropdown;
}

// Function to toggle the dropdown visibility
function toggleDropdown(dropdown) {
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
}

// Close dropdowns when clicking outside
document.addEventListener('click', (event) => {
    if (!event.target.closest('.buttonWrapper')) {
        const dropdowns = document.querySelectorAll('.dropdown');
        dropdowns.forEach(dropdown => dropdown.style.display = 'none');
    }
});
