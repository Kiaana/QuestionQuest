// JavaScript函数，用于处理即时查询
function searchQuestions() {
    const type = document.getElementById('question-type').value;
    const content = document.getElementById('question-content').value;
    const option = document.getElementById('question-option').value;

    // 发送请求
    fetch(`/api/search?type=${type}&content=${content}&option=${option}`)
        .then(response => response.json())
        .then(data => {
            const resultsContainer = document.getElementById('results');
            resultsContainer.innerHTML = ''; // 清空当前结果

            data.forEach(question => {
                const questionElement = document.createElement('div');
                questionElement.classList.add('bg-white', 'p-4', 'mb-4', 'rounded-lg', 'transition', 'duration-500', 'ease-in-out');

                let optionsHtml = '';
                question.options.forEach(option => {
                    const isCorrect = option.is_correct ? 'bg-yellow-300' : 'bg-gray-100';
                    optionsHtml += `<div class="${isCorrect} p-2 my-1 rounded">${option.content}</div>`;
                });

                questionElement.innerHTML = `
                    <div class="text-lg font-semibold mb-2">${question.content}</div>
                    <div class="text-gray-700">${optionsHtml}</div>
                `;
                resultsContainer.appendChild(questionElement);
            });
        })
        .catch(error => console.error('Error:', error));
}

// 监听输入变化
document.addEventListener('DOMContentLoaded', () => {
    const inputs = document.querySelectorAll('#search-form input');
    inputs.forEach(input => {
        input.addEventListener('input', searchQuestions);
    });
});