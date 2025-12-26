// 作曲家作品页面 JavaScript 文件

let currentComposerId = null;
let showAllWorks = false;

// 页面初始化
document.addEventListener('DOMContentLoaded', function() {
    // 从 URL 参数获取 composerId
    const urlParams = new URLSearchParams(window.location.search);
    currentComposerId = urlParams.get('composerId');
    
    if (currentComposerId) {
        // 加载单个作曲家的作品列表
        showAllWorks = false;
        getComposerWorks(currentComposerId);
        getComposerInfo(currentComposerId);
    } else {
        // 如果没有 composerId，显示所有作品（按作曲家分组）
        showAllWorks = true;
        loadAllWorksByComposer();
    }
});

// 获取作曲家信息
function getComposerInfo(composerId) {
    fetch(`/api/composers/${composerId}`)
        .then(response => response.json())
        .then(composer => {
            if (composer.error) {
                document.getElementById('pageTitle').textContent = '作曲家作品列表';
                return;
            }
            
            // 更新页面标题
            document.getElementById('pageTitle').textContent = `${composer.name} 的作品`;
        })
        .catch(error => {
            console.error('获取作曲家信息失败:', error);
            document.getElementById('pageTitle').textContent = '作曲家作品列表';
        });
}

// 获取作曲家的作品列表
function getComposerWorks(composerId) {
    fetch(`/api/composers/${composerId}/works`)
        .then(response => response.json())
        .then(works => {
            const contentDiv = document.getElementById('composerWorksContent');
            
            if (works.length === 0) {
                // 显示空状态
                contentDiv.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">🎵</div>
                        <div class="empty-state-text">这位作曲家还没有作品</div>
                        <button class="add-first-work" onclick="addNewWork()">添加第一个作品</button>
                    </div>
                `;
                return;
            }
            
            // 构建作品列表表格
            let html = '<table class="composer-works-table">';
            html += '<tr><th>编号</th><th>作品标题</th><th>难度</th><th>创建时间</th><th>状态</th><th>操作</th></tr>';
            
            works.forEach(work => {
                html += `<tr>`;
                html += `<td>${work.id}</td>`;
                html += `<td><span class="clickable-text" onclick="showWorkDetail(${work.id})">${work.title}</span></td>`;
                html += `<td>${work.difficulty || '-'}</td>`;
                html += `<td>${work.created_at}</td>`;
                html += `<td>`;
                if (work.images && work.images.length > 0) {
                    html += `<span class="work-status has-images">${work.images.length}张图片</span>`;
                } else {
                    html += '<span class="work-status no-images">无图片</span>';
                }
                html += `</td>`;
                html += `<td>`;
                html += `<button onclick="showWorkDetail(${work.id})" class="view-btn">查看详情</button>`;
                html += `<button onclick="deleteWork(${work.id}, '${work.title}')" class="delete-btn">删除</button>`;
                html += `</td>`;
                html += `</tr>`;
            });
            
            html += '</table>';
            contentDiv.innerHTML = html;
        })
        .catch(error => {
            console.error('获取作品列表失败:', error);
            document.getElementById('composerWorksContent').innerHTML = '<p>获取作品列表失败</p>';
        });
}

// 显示作品详情
function showWorkDetail(workId) {
    // 跳转到作品详情页面
    window.location.href = `../work-detail/work-detail.html?workId=${workId}`;
}

// 添加新作品
function addNewWork() {
    if (showAllWorks) {
        // 如果显示所有作品，提示用户先选择作曲家
        alert('请先从作曲家管理页面选择一个作曲家来添加作品');
        return;
    }
    // 跳转到编辑作品页面，传递作曲家ID
    window.location.href = `../edit-work/edit-work.html?composerId=${currentComposerId}`;
}

// 加载所有作品并按作曲家分组
function loadAllWorksByComposer() {
    fetch('/api/works/grouped')
        .then(response => response.json())
        .then(composersWorks => {
            const contentDiv = document.getElementById('composerWorksContent');
            
            // 检查是否有作品
            const allWorks = Object.values(composersWorks).flat();
            if (allWorks.length === 0) {
                // 显示空状态
                contentDiv.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">🎵</div>
                        <div class="empty-state-text">系统中还没有任何作品</div>
                        <div class="empty-state-actions">
                            <button class="add-first-work" onclick="window.location.href='../composer-management/composer-management.html'">去添加作曲家</button>
                        </div>
                    </div>
                `;
                return;
            }
            
            // 按作曲家分组构建HTML
            let html = '<div class="all-works-container">';
            
            // 更新页面标题
            document.getElementById('pageTitle').textContent = '所有作品';
            
            // 移除"添加作品"按钮，因为我们不确定要添加到哪个作曲家
            document.getElementById('addWorkBtn').style.display = 'none';
            
            // 遍历每个作曲家的作品
            Object.keys(composersWorks).sort().forEach(composerName => {
                const works = composersWorks[composerName];
                
                // 作曲家区块
                html += `
                    <div class="composer-section">
                        <div class="composer-header">
                            <h2 class="composer-title">${composerName}</h2>
                            <div class="composer-stats">
                                <span class="works-count">${works.length} 个作品</span>
                                <button class="add-work-btn" onclick="addWorkForComposer('${composerName}')">添加作品</button>
                            </div>
                        </div>
                        <div class="works-grid">
                `;
                
                // 作曲家的作品卡片
                works.forEach(work => {
                    html += `
                        <div class="work-card">
                            <div class="work-header">
                                <h3 class="work-title" onclick="showWorkDetail(${work.id})">${work.title}</h3>
                                <div class="work-meta">
                                    <span class="work-difficulty">${work.difficulty || '未设置'}</span>
                                    <span class="work-date">${work.created_at}</span>
                                </div>
                            </div>
                            <div class="work-description" onclick="showWorkDetail(${work.id})">
                                ${work.description ? work.description.substring(0, 100) + '...' : '无描述'}
                            </div>
                            <div class="work-images" onclick="showWorkDetail(${work.id})">
                                ${work.images && work.images.length > 0 
                                    ? `<span class="image-count">📷 ${work.images.length}张图片</span>`
                                    : '<span class="no-images">📷 无图片</span>'
                                }
                            </div>
                            <div class="work-actions">
                                <button onclick="showWorkDetail(${work.id})" class="view-btn">查看详情</button>
                                <button onclick="deleteWork(${work.id}, '${work.title}')" class="delete-btn">删除</button>
                            </div>
                        </div>
                    `;
                });
                
                html += `
                        </div>
                    </div>
                `;
            });
            
            html += '</div>';
            contentDiv.innerHTML = html;
        })
        .catch(error => {
            console.error('获取所有作品失败:', error);
            document.getElementById('composerWorksContent').innerHTML = '<p>获取作品列表失败</p>';
        });
}

// 为特定作曲家添加作品
function addWorkForComposer(composerName) {
    // 这里需要找到对应作曲家的ID，然后跳转
    // 由于我们只有作曲家名称，我们可以通过作曲家名称获取ID
    fetch('/api/composers')
        .then(response => response.json())
        .then(composers => {
            const composer = composers.find(c => c.name === composerName);
            if (composer) {
                window.location.href = `../edit-work/edit-work.html?composerId=${composer.id}`;
            } else {
                alert('找不到指定的作曲家');
            }
        })
        .catch(error => {
            console.error('获取作曲家信息失败:', error);
            alert('获取作曲家信息失败');
        });
}

// 页面切换函数（从其他页面调用）
function showPage(pageNumber) {
    if (pageNumber === 2) {
        // 返回到作曲家管理页面
        window.location.href = '../composer-management/composer-management.html';
    } else {
        alert('请使用返回按钮');
    }
}

// 编辑当前作品（用于从作品详情页面返回）
function editCurrentWork() {
    const editBtn = document.getElementById('editWorkBtn');
    if (editBtn) {
        const workId = editBtn.getAttribute('data-work-id');
        if (workId) {
            editWork(workId);
        }
    }
}

// 编辑作品
function editWork(workId) {
    // 跳转到编辑作品页面
    if (workId) {
        window.location.href = `../edit-work/edit-work.html?workId=${workId}`;
    } else {
        window.location.href = `../edit-work/edit-work.html?composerId=${currentComposerId}`;
    }
}

// 删除作品
function deleteWork(workId, workTitle) {
    if (confirm(`确定要删除作品"${workTitle}"吗？\n\n这个操作将会删除作品及其所有相关的图片文件，且无法恢复！`)) {
        // 显示加载状态
        const confirmBtn = event.target;
        const originalText = confirmBtn.textContent;
        confirmBtn.textContent = '删除中...';
        confirmBtn.disabled = true;
        
        fetch(`/api/works/${workId}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('✅ 作品删除成功！');
                // 重新加载页面数据
                if (currentComposerId) {
                    getComposerWorks(currentComposerId);
                } else {
                    loadAllWorksByComposer();
                }
            } else {
                alert('❌ 删除失败: ' + (data.error || '未知错误'));
            }
        })
        .catch(error => {
            console.error('删除作品失败:', error);
            alert('❌ 删除失败，请检查网络连接');
        })
        .finally(() => {
            // 恢复按钮状态
            confirmBtn.textContent = originalText;
            confirmBtn.disabled = false;
        });
    }
}