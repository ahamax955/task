// 编辑作品页面 JavaScript 文件

let currentWorkId = null;
let currentComposerId = null;

// 页面初始化
document.addEventListener('DOMContentLoaded', function() {
    // 从 URL 参数获取 workId 或 composerId
    const urlParams = new URLSearchParams(window.location.search);
    currentWorkId = urlParams.get('workId');
    currentComposerId = urlParams.get('composerId');
    
    if (currentWorkId) {
        // 编辑现有作品
        document.getElementById('pageTitle').textContent = '编辑作品';
        document.getElementById('editWorkTitle').textContent = '编辑作品';
        loadWorkToEdit(currentWorkId);
    } else if (currentComposerId) {
        // 添加新作品
        document.getElementById('pageTitle').textContent = '添加作品';
        document.getElementById('editWorkTitle').textContent = '添加作品';
        document.getElementById('editWorkComposerId').value = currentComposerId;
        // 加载作曲家信息
        loadComposerInfo(currentComposerId);
    } else {
        // 缺少必要参数
        document.getElementById('composerInfoSection').innerHTML = '<p style="color: red;">缺少必要参数</p>';
    }
});

// 编辑作品
function editWork(workId, composerId) {
    if (workId) {
        loadWorkToEdit(workId);
    } else if (composerId) {
        document.getElementById('editWorkComposerId').value = composerId;
        loadComposerInfo(composerId);
    }
}

// 加载作曲家信息
function loadComposerInfo(composerId) {
    fetch(`/composers/${composerId}`)
        .then(response => response.json())
        .then(composer => {
            if (composer.error) {
                document.getElementById('composerNameDisplay').innerHTML = `<span style="color: red;">加载失败: ${composer.error}</span>`;
                return;
            }
            
            // 显示作曲家信息
            document.getElementById('composerNameDisplay').textContent = composer.name || '未知作曲家';
            
            let detailsHtml = '';
            if (composer.birth_year) {
                detailsHtml += `🎼 生卒年份: ${composer.birth_year}<br>`;
            }
            if (composer.nationality) {
                detailsHtml += `🌍 国籍: ${composer.nationality}<br>`;
            }
            if (composer.description) {
                detailsHtml += `📝 简介: ${composer.description.substring(0, 100)}${composer.description.length > 100 ? '...' : ''}`;
            }
            
            if (!detailsHtml) {
                detailsHtml = '暂无详细信息';
            }
            
            document.getElementById('composerDetailsDisplay').innerHTML = detailsHtml;
        })
        .catch(error => {
            console.error('获取作曲家信息失败:', error);
            document.getElementById('composerNameDisplay').innerHTML = '<span style="color: red;">加载失败</span>';
            document.getElementById('composerDetailsDisplay').innerHTML = '无法获取作曲家详细信息';
        });
}

// 加载作品数据到编辑表单
function loadWorkToEdit(workId) {
    fetch(`/works/${workId}`)
        .then(response => response.json())
        .then(work => {
            if (work.error) {
                alert('获取作品信息失败: ' + work.error);
                return;
            }
            
            // 填充表单
            document.getElementById('editWorkId').value = work.id;
            document.getElementById('editWorkTitleInput').value = work.title || '';
            document.getElementById('editWorkDifficultyInput').value = work.difficulty || '';
            document.getElementById('editWorkDescriptionInput').value = work.description || '';
            document.getElementById('editWorkComposerId').value = work.composer_id;
            
            // 加载作曲家信息
            if (work.composer_id) {
                loadComposerInfo(work.composer_id);
            }
            
            // 显示当前图片
            const currentWorkImagesDiv = document.getElementById('currentWorkImagesDiv');
            const workImagesList = document.getElementById('workImagesList');
            
            if (work.images && work.images.length > 0) {
                let html = '<div class="work-images-grid">';
                work.images.forEach((imageName, index) => {
                    if (imageName.trim() !== '') {
                        html += `<div class="work-image-item">
                            <img src="/uploads/${imageName.trim()}" alt="作品图片${index + 1}">
                            <div class="work-image-name">${imageName.trim()}</div>
                            <button onclick="removeWorkImage(${work.id}, '${imageName.trim()}', this)" class="remove-work-image-btn">删除</button>
                        </div>`;
                    }
                });
                html += '</div>';
                workImagesList.innerHTML = html;
                currentWorkImagesDiv.style.display = 'block';
            } else {
                workImagesList.innerHTML = '<p>无图片</p>';
                currentWorkImagesDiv.style.display = 'block';
            }
        })
        .catch(error => {
            console.error('获取作品信息失败:', error);
            alert('获取作品信息失败');
        });
}

// 添加新作品（从作品列表页面的按钮）
function addNewWork() {
    if (currentComposerId) {
        window.location.href = `../edit-work/edit-work.html?composerId=${currentComposerId}`;
    } else {
        alert('缺少作曲家信息');
    }
}

// 编辑当前作品（用于从作品详情页面返回）
function editCurrentWork() {
    if (currentWorkId) {
        editWork(currentWorkId);
    }
}

// 保存作品
function saveWork() {
    const workId = document.getElementById('editWorkId').value;
    const composerId = document.getElementById('editWorkComposerId').value;
    const title = document.getElementById('editWorkTitleInput').value.trim();
    const difficulty = document.getElementById('editWorkDifficultyInput').value.trim();
    const description = document.getElementById('editWorkDescriptionInput').value.trim();
    const imageInput = document.getElementById('editWorkImageInput');
    const files = imageInput.files;
    
    // 表单验证
    if (!title) {
        alert('请输入作品标题');
        document.getElementById('editWorkTitleInput').focus();
        return;
    }
    
    if (!composerId) {
        alert('缺少作曲家信息');
        return;
    }
    
    // 确认对话框
    const confirmMessage = workId ? '确定要更新这个作品吗？' : '确定要添加这个作品吗？';
    if (!confirm(confirmMessage)) {
        return;
    }
    
    // 显示保存中的状态
    const saveBtn = document.querySelector('.save-work-btn');
    const originalText = saveBtn.textContent;
    saveBtn.textContent = '⏳ 保存中...';
    saveBtn.disabled = true;
    
    // 创建FormData对象
    const formData = new FormData();
    formData.append('title', title);
    formData.append('composer_id', composerId);
    formData.append('difficulty', difficulty);
    formData.append('description', description);
    
    // 如果是编辑模式，添加作品ID
    if (workId) {
        formData.append('work_id', workId);
    }
    
    // 添加所有选择的图片文件
    if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
            formData.append('images', files[i]);
        }
    }
    
    const url = workId ? '/update-work' : '/works';
    const method = 'POST'; // 新增和更新都使用POST
    
    fetch(url, {
        method: method,
        body: formData  // 不需要设置Content-Type，浏览器会自动处理
    })
    .then(response => response.json())
    .then(data => {
        // 恢复按钮状态
        saveBtn.textContent = originalText;
        saveBtn.disabled = false;
        
        if (data.error) {
            alert(data.error);
        } else {
            alert(workId ? '✅ 作品更新成功！' : '✅ 作品添加成功！');
            // 返回作品列表页面
            window.location.href = `../composer-works/composer-works.html?composerId=${composerId}`;
        }
    })
    .catch(error => {
        // 恢复按钮状态
        saveBtn.textContent = originalText;
        saveBtn.disabled = false;
        
        console.error('保存作品失败:', error);
        alert('❌ 保存作品失败，请检查网络连接');
    });
}

// 删除作品图片
function removeWorkImage(workId, imageName, buttonElement) {
    if (confirm('确定要删除这张图片吗？')) {
        fetch('/api/works/' + workId + '/images', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                image_name: imageName
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // 移除DOM中的图片元素
                buttonElement.closest('.work-image-item').remove();
                alert('图片已删除');
                
                // 如果没有图片了，隐藏图片区域
                const workImagesList = document.getElementById('workImagesList');
                if (workImagesList.children.length === 0) {
                    workImagesList.innerHTML = '<p>无图片</p>';
                }
            } else {
                alert(data.error || '删除失败');
            }
        })
        .catch(error => {
            console.error('删除图片失败:', error);
            alert('删除失败');
        });
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