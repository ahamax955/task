// 作品详情页面 JavaScript 文件

let currentWorkId = null;
let currentComposerId = null;

// 页面初始化
document.addEventListener('DOMContentLoaded', function() {
    // 从 URL 参数获取 workId
    const urlParams = new URLSearchParams(window.location.search);
    currentWorkId = urlParams.get('workId');
    
    if (currentWorkId) {
        // 获取并显示作品详情
        getWorkDetail(currentWorkId);
    } else {
        // 如果没有 workId，显示错误信息
        document.getElementById('workDetailContent').innerHTML = '<p>无效的作品ID</p>';
    }
});

// 获取作品详情
function getWorkDetail(workId) {
    // 显示加载中
    document.getElementById('workDetailContent').innerHTML = '<p>加载中...</p>';
    
    fetch(`/api/works/${workId}`)
        .then(response => response.json())
        .then(work => {
            if (work.error) {
                document.getElementById('workDetailContent').innerHTML = `<p>${work.error}</p>`;
                return;
            }
            
            currentComposerId = work.composer_id;
            
            // 构建作品详情内容
            let html = '<div class="work-detail-content">';
            
            // 添加作品标题和作曲家
            html += `<h2 class="work-title">${work.title}</h2>`;
            html += `<p class="composer-name">作曲家: <span class="clickable-text" onclick="showComposerDetail(${work.composer_id})">${work.composer_name}</span></p>`;
            
            // 添加难度
            if (work.difficulty) {
                html += `<p class="work-difficulty">难度: ${work.difficulty}</p>`;
            }
            
            // 添加描述
            if (work.description) {
                html += `<div class="work-description">`;
                html += `<h3>作品描述:</h3>`;
                html += `<p>${work.description}</p>`;
                html += `</div>`;
            }
            
            // 添加图片区域
            html += `<div class="work-images">`;
            html += `<h3>作品图片:</h3>`;
            
            if (work.images && work.images.length > 0) {
                html += `<div class="image-gallery">`;
                work.images.forEach(imageName => {
                    const imagePath = `/uploads/${imageName.trim()}`;
                    html += `<div class="image-item" onclick="viewImage('${imagePath}')">`;
                    html += `<img src="${imagePath}" alt="作品图片">`;
                    html += `</div>`;
                });
                html += `</div>`;
            } else {
                html += `<p>暂无图片</p>`;
            }
            
            html += `</div>`;
            
            // 添加创建时间
            html += `<p class="work-date">创建时间: ${work.created_at}</p>`;
            
            html += '</div>';
            
            // 设置作品详情内容
            document.getElementById('workDetailContent').innerHTML = html;
            
            // 显示相关按钮
            const addWorkBtn = document.getElementById('addWorkBtn');
            const editWorkBtn = document.getElementById('editWorkBtn');
            
            if (addWorkBtn && currentComposerId) {
                addWorkBtn.style.display = 'inline-block';
            }
            
            if (editWorkBtn) {
                editWorkBtn.style.display = 'inline-block';
                editWorkBtn.setAttribute('data-work-id', workId);
            }
        })
        .catch(error => {
            console.error('获取作品详情失败:', error);
            document.getElementById('workDetailContent').innerHTML = '<p>获取作品详情失败</p>';
        });
}

// 查看图片
function viewImage(imagePath) {
    // 创建模态框
    const modal = document.createElement('div');
    modal.className = 'image-modal';
    modal.innerHTML = `
        <img src="${imagePath}" alt="作品图片">
        <button class="close-btn" onclick="closeImageModal()">&times;</button>
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
            closeImageModal();
        }
    });
    
    // ESC键关闭
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeImageModal();
        }
    });
}

// 关闭图片模态框
function closeImageModal() {
    const modal = document.querySelector('.image-modal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

// 显示作曲家详情
function showComposerDetail(composerId) {
    // 跳转到作曲家详情页面
    window.location.href = `../detail/detail.html?type=composer&id=${composerId}`;
}

// 添加新作品
function addNewWork() {
    if (currentComposerId) {
        // 跳转到编辑作品页面，传递作曲家ID
        window.location.href = `../edit-work/edit-work.html?composerId=${currentComposerId}`;
    } else {
        alert('缺少作曲家信息');
    }
}

// 编辑当前作品
function editCurrentWork() {
    const editBtn = document.getElementById('editWorkBtn');
    const workId = editBtn.getAttribute('data-work-id');
    if (workId) {
        // 跳转到编辑作品页面
        window.location.href = `../edit-work/edit-work.html?workId=${workId}`;
    }
}

// 页面切换函数（从其他页面调用）
function showPage(pageNumber) {
    if (pageNumber === 6) {
        // 返回到作品列表页面
        if (currentComposerId) {
            window.location.href = `../composer-works/composer-works.html?composerId=${currentComposerId}`;
        } else {
            window.location.href = '../composer-works/composer-works.html';
        }
    } else {
        alert('请使用返回按钮');
    }
}