// 获取输入框和保存按钮元素
const fontInput = document.getElementById('font-input');
const excludedSelectorInput = document.getElementById('excluded-selector-input');
const includedSelectorInput = document.getElementById('included-selector-input');
const excludedUrlRegexInput = document.getElementById('excluded-url-regex-input');
const saveButton = document.getElementById('save-button');

// 从同步存储中读取设置并填充到输入框
chrome.storage.sync.get([
    'StyleInjector_customFont',
    'StyleInjector_excludedSelector',
    'StyleInjector_includedSelector',
    'StyleInjector_excludedUrlRegex'
], function (result) {
    if (result.StyleInjector_customFont) {
        fontInput.value = result.StyleInjector_customFont;
    }
    else {
        fontInput.value = `如: Arial, 'sans-serif'`;
    }
    if (result.StyleInjector_excludedSelector) {
        excludedSelectorInput.value = result.StyleInjector_excludedSelector;
    }
    else {
        excludedSelectorInput.value = '如: pre, code, *[class*="katex"] [aria-hidden="true"], [class*="fa-"], .fa, .fab, .fad, .fal, .far, .fas, .fass, .fasr, .fat, .icofont, [style*="font-"], [class*="icon"], [class*="Icon"], [class*="symbol"], [class*="Symbol"], .glyphicon, [class*="material-symbol"], [class*="material-icon"], mu, [class*="mu-"], .typcn, [class*="vjs-"]';
    }
    if (result.StyleInjector_includedSelector) {
        includedSelectorInput.value = result.StyleInjector_includedSelector;
    }
    else {
        includedSelectorInput.value = '如: h1, h2, h3, body, p';
    }
    if (result.StyleInjector_excludedUrlRegex) {
        excludedUrlRegexInput.value = result.StyleInjector_excludedUrlRegex;
    }
    else {
        excludedUrlRegexInput.value = '如: file://.*\n又如: https://www.bilibili.com/video/BV.*\n';
    }
});

// 保存按钮点击事件处理
saveButton.addEventListener('click', function () {
    const StyleInjector_customFont = fontInput.value;
    const StyleInjector_excludedSelector = excludedSelectorInput.value;
    const StyleInjector_includedSelector = includedSelectorInput.value;
    const StyleInjector_excludedUrlRegex = excludedUrlRegexInput.value;

    // 将设置保存到同步存储
    chrome.storage.sync.set({
        StyleInjector_customFont,
        StyleInjector_excludedSelector,
        StyleInjector_includedSelector,
        StyleInjector_excludedUrlRegex,
    }, function () {
        console.log('Settings saved successfully.');
        // window.close();
    });
});

const custom_style = document.createElement('style');
// 输入框发生变化或者页面加载完成后，将自定义字体应用到页面上
window.addEventListener('DOMContentLoaded', function () {
    custom_style.textContent = `* { font-family: ${fontInput.value} }`;
    document.head.appendChild(custom_style);
})
fontInput.addEventListener('input', function () {
    custom_style.textContent = `* { font-family: ${fontInput.value} }`;
})