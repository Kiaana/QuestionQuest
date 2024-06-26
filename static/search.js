function searchQuestions() {
    const type = document.getElementById('question-type').value;
    const content = document.getElementById('question-content').value.toLowerCase();
    const optionSearch = document.getElementById('question-option').value.toLowerCase();

    fetch(`/api/search?type=${type}&content=${content}&option=${optionSearch}`)
        .then(response => response.json())
        .then(data => {
            const resultsContainer = document.getElementById('results');
            resultsContainer.innerHTML = ''; // 清空当前结果

            // 更新结果数量信息
            const resultsInfo = document.getElementById('results-info');
            resultsInfo.textContent = `找到 ${data.length} 道题`;

            data.forEach(question => {
                // 生成章节标识
                const chapterBadge = document.createElement('span');
                chapterBadge.classList.add('mb-2', 'px-2', 'py-1', 'rounded-lg', 'text-white', 'font-bold', 'mr-2', 'text-sm');
                // 设置为绿色背景
                chapterBadge.classList.add('bg-green-500');
                chapterBadge.textContent = `${question.chapter}`;

                const questionElement = document.createElement('div');
                questionElement.classList.add('card', 'p-4', 'rounded-lg', 'shadow', 'fade-in-out', 'mb-4');

                // 高亮搜索到的题目内容
                let highlightedContent = question.content;
                if (content) {
                    const regex = new RegExp(content, 'gi');
                    highlightedContent = question.content.replace(regex, (match) => `<span class="bg-yellow-200">${match}</span>`);
                }

                let optionsHtml = '';
                question.options.forEach(optionObj => {
                    // 高亮搜索到的选项内容
                    let highlightedOption = optionObj.content;
                    if (optionSearch) {
                        const regex = new RegExp(optionSearch, 'gi');
                        highlightedOption = optionObj.content.replace(regex, (match) => `<span class="bg-yellow-200">${match}</span>`);
                    }
                    // 标记正确答案
                    const isCorrect = optionObj.is_correct ? 'bg-green-200' : '';
                    optionsHtml += `<div class="${isCorrect} p-2 my-1 rounded">${highlightedOption}</div>`;
                });

                questionElement.innerHTML = `
                    <div class="text-lg font-semibold mb-2">${chapterBadge.outerHTML}${highlightedContent}</div>
                    <div class="text-gray-700">${optionsHtml}</div>
                `;

                resultsContainer.appendChild(questionElement);
            });
        })
        .catch(error => console.error('Error:', error));
}

document.addEventListener('DOMContentLoaded', () => {
    const inputs = document.querySelectorAll('#search-form input, #search-form select');
    inputs.forEach(input => {
        input.addEventListener('input', searchQuestions);
    });
});