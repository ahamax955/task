// 主入口页面 JavaScript 文件

// 页面初始化
document.addEventListener('DOMContentLoaded', function() {
    // 显示欢迎消息
    showWelcomeMessage();
    
    // 检查数据连接
    checkDataConnection();
    
    // 添加键盘快捷键支持
    addKeyboardShortcuts();
});

// 显示欢迎消息
function showWelcomeMessage() {
    setTimeout(() => {
        showMessage('欢迎使用重构后的音乐作品管理系统！', 'info');
    }, 1000);
}

// 检查数据连接
function checkDataConnection() {
    // 尝试加载作曲家列表来测试连接
    fetch('/api/composers')
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                showMessage('数据连接异常，请检查服务器状态', 'error');
            }
        })
        .catch(error => {
            console.error('数据连接检查失败:', error);
            showMessage('无法连接到服务器，请检查网络连接', 'error');
        });
}

// 导航到指定页面
function navigateToPage(pageName) {
    // 显示加载动画
    showLoading();
    
    // 延迟执行导航，提供更好的用户体验
    setTimeout(() => {
        const pagePaths = {
            'composer-management': '/pages/composer-management/composer-management.html',
            'student-management': '/pages/student-management/student-management.html',
            'student-homework-list': '/pages/student-homework-list/student-homework-list.html',
            'detail': '/pages/detail/detail.html'
        };
        
        const pagePath = pagePaths[pageName];
        if (pagePath) {
            window.location.href = pagePath;
        } else {
            hideLoading();
            showMessage('页面不存在', 'error');
        }
    }, 500);
}

// 显示快速帮助
function showQuickHelp() {
    const helpContent = `
        <h3>🎵 使用帮助</h3>
        <div style="text-align: left; max-height: 400px; overflow-y: auto;">
            <h4>📋 基本功能</h4>
            <ul>
                <li><strong>作曲家管理：</strong>添加、编辑、删除作曲家信息</li>
                <li><strong>学生管理：</strong>管理系统中的学生信息</li>
                <li><strong>数据详情：</strong>查看作业和作品的详细信息</li>
            </ul>
            
            <h4>🎼 作品管理</h4>
            <ul>
                <li><strong>添加作品：</strong>在作曲家详情页面点击"添加作品"</li>
                <li><strong>编辑作品：</strong>在作品详情页面点击"编辑作品"</li>
                <li><strong>查看详情：</strong>点击作品标题查看详细信息</li>
            </ul>
            
            <h4>🏠 作业管理</h4>
            <ul>
                <li><strong>添加作业：</strong>在主页面填写表单并上传图片</li>
                <li><strong>编辑作业：</strong>在作业详情页面点击"修改作业"</li>
                <li><strong>删除图片：</strong>在编辑页面可以删除现有图片</li>
            </ul>
            
            <h4>⌨️ 快捷键</h4>
            <ul>
                <li><strong>ESC：</strong>关闭模态框</li>
                <li><strong>F5：</strong>刷新页面</li>
                <li><strong>Ctrl+R：</strong>刷新页面</li>
            </ul>
        </div>
    `;
    
    showModal('使用帮助', helpContent);
}

// 显示关于信息
function showAbout() {
    const aboutContent = `
        <h3>🎵 关于系统</h3>
        <div style="text-align: center;">
            <div style="font-size: 48px; margin: 20px 0;">🎼</div>
            <h4>音乐作品管理系统</h4>
            <p><strong>版本：</strong>重构版 v2.0</p>
            <p><strong>开发时间：</strong>2024年12月</p>
            <p><strong>技术栈：</strong>Flask + MySQL + HTML5 + CSS3 + JavaScript</p>
            <p><strong>特色功能：</strong></p>
            <ul style="text-align: left; display: inline-block;">
                <li>响应式设计，支持多设备访问</li>
                <li>模块化架构，易于维护和扩展</li>
                <li>丰富的交互效果和动画</li>
                <li>完整的数据管理功能</li>
            </ul>
            <p style="margin-top: 20px; color: #666; font-size: 14px;">
                © 2024 音乐作品管理系统. All rights reserved.
            </p>
        </div>
    `;
    
    showModal('关于系统', aboutContent);
}

// 刷新所有数据
function refreshAllData() {
    showMessage('正在刷新数据...', 'info');
    
    // 重新检查数据连接
    checkDataConnection();
    
    // 显示刷新成功消息
    setTimeout(() => {
        showMessage('数据刷新完成', 'success');
    }, 1000);
}

// 添加键盘快捷键支持
function addKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // ESC 键关闭模态框
        if (e.key === 'Escape') {
            closeModal();
        }
        
        // F5 或 Ctrl+R 刷新页面
        if (e.key === 'F5' || (e.ctrlKey && e.key === 'r')) {
            e.preventDefault();
            window.location.reload();
        }
    });
}

// 显示消息
function showMessage(text, type = 'info') {
    // 移除现有消息
    const existingMessage = document.querySelector('.message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // 创建新消息
    const message = document.createElement('div');
    message.className = `message ${type}`;
    message.textContent = text;
    
    // 添加到页面
    document.body.appendChild(message);
    
    // 显示消息
    setTimeout(() => {
        message.classList.add('show');
    }, 100);
    
    // 自动隐藏
    setTimeout(() => {
        message.classList.remove('show');
        setTimeout(() => {
            if (message.parentNode) {
                message.parentNode.removeChild(message);
            }
        }, 300);
    }, 3000);
}

// 显示加载动画
function showLoading() {
    // 移除现有加载动画
    const existingLoading = document.querySelector('.loading-overlay');
    if (existingLoading) {
        existingLoading.remove();
    }
    
    // 创建加载动画
    const loading = document.createElement('div');
    loading.className = 'loading-overlay';
    loading.innerHTML = `
        <div class="loading-spinner"></div>
    `;
    
    // 添加到页面
    document.body.appendChild(loading);
    
    // 显示加载动画
    setTimeout(() => {
        loading.classList.add('show');
    }, 10);
}

// 隐藏加载动画
function hideLoading() {
    const loading = document.querySelector('.loading-overlay');
    if (loading) {
        loading.classList.remove('show');
        setTimeout(() => {
            if (loading.parentNode) {
                loading.parentNode.removeChild(loading);
            }
        }, 300);
    }
}

// 显示模态框
function showModal(title, content) {
    // 移除现有模态框
    const existingModal = document.querySelector('.modal-overlay');
    if (existingModal) {
        existingModal.remove();
    }
    
    // 创建模态框
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="modal-close" onclick="closeModal()">&times;</button>
            </div>
            <div class="modal-body">
                ${content}
            </div>
        </div>
    `;
    
    // 添加到页面
    document.body.appendChild(modal);
    
    // 显示模态框
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
    
    // 点击背景关闭
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
}

// 关闭模态框
function closeModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }, 300);
    }
}