let allWorks = [];
let allComposers = [];
let pendingComposerId = null;
let composersLoaded = false;
let worksLoaded = false;

document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const composerId = urlParams.get('composerId');
    
    if (composerId) {
        pendingComposerId = composerId;
    }
    
    loadComposers();
    loadAllWorks();
});

function loadComposers() {
    fetch('/api/composers')
        .then(response => response.json())
        .then(composers => {
            allComposers = composers;
            populateComposerFilter(composers);
            composersLoaded = true;
            
            if (pendingComposerId && worksLoaded) {
                const filter = document.getElementById('composerFilter');
                filter.value = pendingComposerId;
                filterWorks();
                pendingComposerId = null;
            }
        })
        .catch(error => {
            console.error('加载作曲家列表失败:', error);
        });
}

function populateComposerFilter(composers) {
    const filter = document.getElementById('composerFilter');
    filter.innerHTML = '<option value="">全部作曲家</option>';
    
    composers.forEach(composer => {
        const option = document.createElement('option');
        option.value = composer.id;
        option.textContent = composer.name;
        filter.appendChild(option);
    });
}

function loadAllWorks() {
    fetch('/api/works')
        .then(response => response.json())
        .then(works => {
            allWorks = works;
            worksLoaded = true;
            
            if (pendingComposerId && composersLoaded) {
                const filter = document.getElementById('composerFilter');
                filter.value = pendingComposerId;
                filterWorks();
                pendingComposerId = null;
            } else {
                displayWorks(works);
            }
        })
        .catch(error => {
            console.error('加载作品列表失败:', error);
            document.getElementById('worksContainer').innerHTML = '<p class="error">加载失败，请刷新页面重试</p>';
        });
}

function filterWorks() {
    const composerId = document.getElementById('composerFilter').value;
    
    if (composerId === '') {
        displayWorks(allWorks);
    } else {
        const filteredWorks = allWorks.filter(work => work.composer_id == composerId);
        displayWorks(filteredWorks);
    }
}

function displayWorks(works) {
    const container = document.getElementById('worksContainer');
    
    if (works.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🎵</div>
                <div class="empty-state-text">暂无作品</div>
            </div>
        `;
        return;
    }
    
    let html = '<div class="works-grid">';
    
    works.forEach(work => {
        const composer = allComposers.find(c => c.id === work.composer_id);
        const composerName = composer ? composer.name : '未知作曲家';
        
        html += `
            <div class="work-card">
                <div class="work-composer">${composerName}</div>
                <div class="work-card-header">
                    <h3 class="work-title" onclick="viewWorkDetail(${work.id})">${work.title}</h3>
                    <span class="work-difficulty">${work.difficulty || '未设置'}</span>
                </div>
                <div class="work-description">
                    ${work.description ? work.description : '暂无描述'}
                </div>
                <div class="work-images-info ${work.images && work.images.length > 0 ? 'has-images' : 'no-images'}">
                    ${work.images && work.images.length > 0 
                        ? `📷 ${work.images.length} 张图片`
                        : '📷 暂无图片'
                    }
                </div>
                <div class="work-actions">
                    <button class="view-btn" onclick="viewWorkDetail(${work.id})">查看详情</button>
                    <button class="delete-btn" onclick="deleteWork(${work.id}, '${work.title.replace(/'/g, "\\'")}')">删除</button>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

function viewWorkDetail(workId) {
    window.location.href = `../work-detail/work-detail.html?workId=${workId}`;
}

function addNewWork() {
    if (allComposers.length === 0) {
        alert('请先添加作曲家');
        window.location.href = '../composer-management/composer-management.html';
        return;
    }
    
    const composerId = document.getElementById('composerFilter').value;
    if (composerId) {
        window.location.href = `../edit-work/edit-work.html?composerId=${composerId}`;
    } else {
        window.location.href = `../edit-work/edit-work.html`;
    }
}

function deleteWork(workId, workTitle) {
    if (confirm(`确定要删除作品"${workTitle}"吗？\n\n此操作将删除作品及其所有相关图片，且无法恢复！`)) {
        fetch(`/api/works/${workId}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('删除成功！');
                loadAllWorks();
            } else {
                alert('删除失败：' + (data.error || '未知错误'));
            }
        })
        .catch(error => {
            console.error('删除作品失败:', error);
            alert('删除失败，请检查网络连接');
        });
    }
}
