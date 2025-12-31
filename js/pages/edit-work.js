let currentWorkId = null;
let currentComposerId = null;
let composersList = [];

function getBaseUrl() {
    const protocol = window.location.protocol;
    const host = window.location.host;
    return `${protocol}//${host}`;
}

document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    currentWorkId = urlParams.get('workId');
    currentComposerId = urlParams.get('composerId');
    
    if (currentWorkId) {
        document.getElementById('pageTitle').textContent = '编辑作品';
        document.getElementById('editWorkTitle').textContent = '编辑作品';
        loadWorkToEdit(currentWorkId);
    } else {
        document.getElementById('pageTitle').textContent = '添加作品';
        document.getElementById('editWorkTitle').textContent = '添加作品';
        loadComposers();
    }
    
    setupImagePreview();
});

function loadComposers() {
    fetch('/api/composers')
        .then(response => response.json())
        .then(data => {
            composersList = data;
            const select = document.getElementById('editWorkComposerSelect');
            select.innerHTML = '<option value="">请选择作曲家</option>';
            
            data.forEach(composer => {
                const option = document.createElement('option');
                option.value = composer.id;
                option.textContent = composer.name;
                select.appendChild(option);
            });
            
            if (currentComposerId) {
                select.value = currentComposerId;
            }
        })
        .catch(error => {
            console.error('加载作曲家列表失败:', error);
            alert('加载作曲家列表失败');
        });
}

function loadWorkToEdit(workId) {
    fetch(`/api/works/${workId}`)
        .then(response => response.json())
        .then(work => {
            if (work.error) {
                alert('获取作品信息失败: ' + work.error);
                return;
            }
            
            document.getElementById('editWorkId').value = work.id;
            document.getElementById('editWorkTitleInput').value = work.title || '';
            document.getElementById('editWorkDescriptionInput').value = work.description || '';
            document.getElementById('editWorkDifficultyInput').value = work.difficulty || '';
            
            loadComposers().then(() => {
                const select = document.getElementById('editWorkComposerSelect');
                if (work.composer_id) {
                    select.value = work.composer_id;
                }
            });
            
            if (work.images && work.images.length > 0) {
                showExistingImages(work.images);
            }
        })
        .catch(error => {
            console.error('获取作品信息失败:', error);
            alert('获取作品信息失败');
        });
}

function showExistingImages(images) {
    const imagePreview = document.getElementById('imagePreview');
    const previewGrid = document.getElementById('previewGrid');
    
    let html = '';
    images.forEach((imageName, index) => {
        if (imageName.trim() !== '') {
            html += `<div class="preview-item">
                <img src="${getBaseUrl()}/uploads/${imageName.trim()}" alt="作品图片${index + 1}">
                <div class="preview-index">${index + 1}</div>
            </div>`;
        }
    });
    
    previewGrid.innerHTML = html;
    imagePreview.style.display = 'block';
}

function setupImagePreview() {
    const imageInput = document.getElementById('editWorkImageInput');
    const imagePreview = document.getElementById('imagePreview');
    const previewGrid = document.getElementById('previewGrid');
    
    imageInput.addEventListener('change', function(e) {
        const files = e.target.files;
        
        if (files.length > 0) {
            previewGrid.innerHTML = '';
            
            Array.from(files).forEach((file, index) => {
                const reader = new FileReader();
                reader.onload = function(event) {
                    const div = document.createElement('div');
                    div.className = 'preview-item';
                    div.innerHTML = `
                        <img src="${event.target.result}" alt="预览${index + 1}">
                        <div class="preview-index">${index + 1}</div>
                    `;
                    previewGrid.appendChild(div);
                };
                reader.readAsDataURL(file);
            });
            
            imagePreview.style.display = 'block';
        } else {
            imagePreview.style.display = 'none';
        }
    });
}

function saveWork() {
    const workId = document.getElementById('editWorkId').value;
    const composerId = document.getElementById('editWorkComposerSelect').value;
    const title = document.getElementById('editWorkTitleInput').value.trim();
    const description = document.getElementById('editWorkDescriptionInput').value.trim();
    const difficulty = document.getElementById('editWorkDifficultyInput').value;
    const imageInput = document.getElementById('editWorkImageInput');
    const files = imageInput.files;
    
    if (!title) {
        alert('请输入作品名称');
        document.getElementById('editWorkTitleInput').focus();
        return;
    }
    
    if (!composerId) {
        alert('请选择作曲家');
        document.getElementById('editWorkComposerSelect').focus();
        return;
    }
    
    const saveBtn = document.querySelector('.save-work-btn');
    const originalText = saveBtn.textContent;
    saveBtn.textContent = '⏳ 保存中...';
    saveBtn.disabled = true;
    
    const formData = new FormData();
    formData.append('title', title);
    formData.append('composer_id', composerId);
    formData.append('description', description);
    formData.append('difficulty', difficulty);
    
    if (workId) {
        formData.append('work_id', workId);
    }
    
    if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
            formData.append('images', files[i]);
        }
    }
    
    const url = workId ? `/api/works/${workId}/update` : '/api/works';
    
    fetch(url, {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        saveBtn.textContent = originalText;
        saveBtn.disabled = false;
        
        if (data.error) {
            alert(data.error);
        } else {
            alert(workId ? '✅ 作品更新成功！' : '✅ 作品添加成功！');
            window.location.href = `../composer-works/composer-works.html?composerId=${composerId}`;
        }
    })
    .catch(error => {
        saveBtn.textContent = originalText;
        saveBtn.disabled = false;
        
        console.error('保存作品失败:', error);
        alert('❌ 保存作品失败，请检查网络连接');
    });
}

function goBack() {
    const composerId = document.getElementById('editWorkComposerSelect').value;
    if (composerId) {
        window.location.href = `../composer-works/composer-works.html?composerId=${composerId}`;
    } else {
        window.location.href = '../composer-works/composer-works.html';
    }
}