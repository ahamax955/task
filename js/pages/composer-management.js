// 作曲家管理页面脚本

// 获取作曲家列表
function getComposers() {
    fetch('/api/composers')
        .then(response => response.json())
        .then(composers => {
            const composersList = document.getElementById('composersList');
            
            if (composers.length === 0) {
                composersList.innerHTML = '<p>暂无作曲家数据</p>';
                return;
            }
            
            let html = '';
            
            composers.forEach(composer => {
                html += `<div class="composer-item">`;
                html += `<div class="composer-name" onclick="showComposerWorks(${composer.id})" title="点击查看该作曲家的作品">${composer.name}</div>`;
                html += `<div class="composer-actions">`;
                html += `<button onclick="updateComposer(${composer.id})" class="update-btn">更新</button>`;
                html += `<button onclick="deleteComposer(${composer.id})" class="delete-btn">删除</button>`;
                html += `</div>`;
                html += `</div>`;
            });
            
            composersList.innerHTML = html;
        })
        .catch(error => {
            console.error('获取作曲家数据失败:', error);
            document.getElementById('composersList').innerHTML = '<p>获取数据失败</p>';
        });
}

// 添加作曲家
function addComposer() {
    const name = document.getElementById('composerNameInput').value.trim();
    
    if (!name) {
        alert('请输入作曲家名称');
        return;
    }
    
    fetch('/api/composers', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: name })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
        } else {
            // 清空输入框
            document.getElementById('composerNameInput').value = '';
            // 刷新作曲家列表
            getComposers();
            // 同时刷新界面1中的作曲家下拉列表
            loadComposersAndStudents();
        }
    })
    .catch(error => {
        console.error('添加作曲家失败:', error);
        alert('添加失败');
    });
}

// 更新作曲家
function updateComposer(id) {
    const name = prompt('请输入新的作曲家名称:');
    
    if (!name || name.trim() === '') {
        alert('请输入有效的作曲家名称');
        return;
    }
    
    fetch(`/api/composers/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: name.trim() })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // 刷新作曲家列表
            getComposers();
            // 同时刷新界面1中的作曲家下拉列表
            loadComposersAndStudents();
        } else {
            alert(data.error || '更新失败');
        }
    })
    .catch(error => {
        console.error('更新作曲家失败:', error);
        alert('更新失败');
    });
}

// 删除作曲家
function deleteComposer(id) {
    if (confirm('确定要删除这个作曲家吗？')) {
        fetch(`/api/composers/${id}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // 刷新作曲家列表
                getComposers();
                // 同时刷新界面1中的作曲家下拉列表
                loadComposersAndStudents();
            } else {
                alert(data.error || '删除失败');
            }
        })
        .catch(error => {
            console.error('删除作曲家失败:', error);
            alert('删除失败');
        });
    }
}

// 获取作曲家和学生数据（用于其他页面的下拉列表）
function loadComposersAndStudents() {
    // 获取作曲家数据
    fetch('/api/composers')
        .then(response => response.json())
        .then(composers => {
            const composerSelect = document.getElementById('composerSelect');
            if (composerSelect) {
                // 清空现有选项（保留第一个）
                composerSelect.innerHTML = '<option value="">选择作曲家</option>';
                
                composers.forEach(composer => {
                    const option = document.createElement('option');
                    option.value = composer.id;
                    option.textContent = composer.name;
                    composerSelect.appendChild(option);
                });
            }
        })
        .catch(error => console.error('获取作曲家数据失败:', error));
    
    // 获取学生数据
    fetch('/api/students')
        .then(response => response.json())
        .then(students => {
            const studentSelect = document.getElementById('studentSelect');
            if (studentSelect) {
                // 清空现有选项（保留第一个）
                studentSelect.innerHTML = '<option value="">选择学生</option>';
                
                students.forEach(student => {
                    const option = document.createElement('option');
                    option.value = student.id;
                    option.textContent = student.name;
                    studentSelect.appendChild(option);
                });
            }
        })
        .catch(error => console.error('获取学生数据失败:', error));
}

// 显示作曲家的作品列表
function showComposerWorks(composerId) {
    // 保存作曲家ID，供后续使用
    window.currentComposerId = composerId;
    
    // 跳转到作曲家作品页面
    window.location.href = `../composer-works/composer-works.html?composerId=${composerId}`;
}

// 页面切换函数（仅用于作曲家管理页面内的导航）
function showPage(pageNumber) {
    // 这个函数在重构后不再使用，因为每个页面都是独立的HTML文件
    console.log('页面切换功能已在重构中移除');
}

// DOM加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 加载作曲家列表
    getComposers();
    
    // 为添加作曲家按钮添加点击事件
    document.getElementById('addComposerBtn').addEventListener('click', addComposer);
    
    // 为输入框添加回车键事件
    document.getElementById('composerNameInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addComposer();
        }
    });
});