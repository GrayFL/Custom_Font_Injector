function has_ancestor(tmp) {
    return !tmp.closest('[class*="katex"]');
}
window.has_ancestor = has_ancestor;

async function getConfigurationData() {
    return new Promise((resolve) => {
        chrome.storage.sync.get(['StyleInjector_customFont', 'StyleInjector_excludedSelector', 'StyleInjector_includedSelector'], function (result) {
            const customFont = result.StyleInjector_customFont || '';
            const excludedSelector = result.StyleInjector_excludedSelector || '';
            const includedSelector = result.StyleInjector_includedSelector || '';
            resolve({ customFont, excludedSelector , includedSelector});
            console.log(`获取配置成功, 自定义字体为：${customFont}, 排除选择器为：${excludedSelector}, 包含选择器为：${includedSelector}`);
        });
    });
}

// 递归遍历元素
function traverseElements(element, custom_style, excludedSelector, includedSelector) {

    // 检查元素是否符合排除条件
    const shouldExclude = element.matches(excludedSelector)

    if (shouldExclude) {
        // 如果符合排除条件，跳过该元素及其子元素
        return;
    }

    // 为元素添加自定义样式的 class
    const customStyleClass = custom_style.className;
    const classList = element.classList;
    if (element.matches(includedSelector)) {
        // classList.add(customStyleClass);
        const currentStyle = element.getAttribute('style');
        const newStyle = `${custom_style.textContent.match(/{\s*(.*?)\s*}/)[1]} ${currentStyle}`;
        element.setAttribute('style', newStyle);
    }
    // 如果元素包含class属性
    else if (element.hasAttribute('class')) {
        if (!classList.contains(customStyleClass)) {
            const currentClasses = element.className;
            // 将自定义样式类添加到最前面
            element.className = `${customStyleClass} ${currentClasses}`;
        }
    }
    // 如果元素没有class属性但有style属性
    else if (element.hasAttribute('style')) {
        // 将原有的style和自定义样式合并
        const currentStyle = element.getAttribute('style');
        const newStyle = `${custom_style.textContent.match(/{\s*(.*?)\s*}/)[1]} ${currentStyle}`;
        element.setAttribute('style', newStyle);
    }
    // console.log(`成功替换元素：${element.tagName}`);

    // 递归遍历子元素
    const children = element.children;
    for (let i = 0; i < children.length; i++) {
        traverseElements(children[i], custom_style, excludedSelector, includedSelector);
    }
}

async function main() {
    console.log('主函数');
    // 自定义样式的 class
    const customStyleClass = 'custom-font-inject';

    // 从存储中获取自定义字体和排除选择器
    const { customFont, excludedSelector , includedSelector } = await getConfigurationData();
    // const customFont = 'Arial, sans-serif';
    // const excludedSelector = `code, *[class*="katex"], *[class*="katex-html"]`;

    // 创建自定义样式标签并显式添加到<head>中
    const custom_style = document.createElement('style');
    custom_style.className = customStyleClass;
    // custom_style.id = customStyleId;
    custom_style.textContent = `.${customStyleClass} { font-family: ${customFont} !important; }`;
    document.head.appendChild(custom_style);

    // 从文档根元素开始遍历
    console.log('初始化字体重写');
    // traverseElements(document.documentElement, custom_style, excludedSelector, includedSelector);
    traverseElements(document.body, custom_style, excludedSelector, includedSelector);

    // 监听配置变化
    chrome.storage.onChanged.addListener((changes, areaName) => {
        if (areaName === 'sync' && (changes.StyleInjector_customFont || changes.StyleInjector_excludedSelector, changes.StyleInjector_includedSelector)) {
            // 配置变化时，重新获取配置并执行字体重写
            getConfigurationData().then((newConfig) => {
                customFont = newConfig.customFont;
                excludedSelector = newConfig.excludedSelectors;
                includedSelector = newConfig.includedSelectors;
                console.log('配置变化，重新执行字体重写');
                traverseElements(document.body, custom_style, excludedSelector, includedSelector);
            });
        }
    });

    // 使用 MutationObserver 监听 DOM 变化
    const observer = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList') {
                for (const addedNode of mutation.addedNodes) {
                    if (addedNode.nodeType === Node.ELEMENT_NODE) {
                        traverseElements(addedNode, customStyleClass, excludedSelector, includedSelector);
                    }
                }
            }
        }
    });

    // 配置观察选项
    const config = { childList: true, subtree: true };
    // 开始观察文档的body元素
    observer.observe(document.body, config);
}

// 调用函数获取自定义字体并应用
main();