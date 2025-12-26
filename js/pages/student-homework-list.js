// 学生作业列表页面脚本

// 全局变量
let allHomeworks = [];
let allStudents = [];
let allComposers = [];
let currentStudentId = null;  // 当前查看的学生ID

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
});

// 初始化页面
async function initializePage() {
    try {
        // 显示加载状态
        showLoadingState();
        
        // 检查URL参数
        checkUrlParams();
        
        // 加载数据
        await loadAllData();
        
        // 加载筛选选项
        loadStudentFilter();
        loadComposerFilter();
        
        // 如果有特定学生ID，设置筛选状态
        if (currentStudentId) {
            setStudentFilter(currentStudentId);
            updatePageTitleForSpecificStudent();
        }
        
        // 更新统计信息
        updateStatistics();
        
        // 渲染作业列表
        renderHomeworkList();
        
    } catch (error) {
        console.error('页面初始化失败:', error);
        showErrorState('加载数据失败，请刷新页面重试');
    }
}

// 检查URL参数
function checkUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const studentId = urlParams.get('studentId');
    if (studentId) {
        currentStudentId = parseInt(studentId);
    }
}

// 为特定学生更新页面标题
function updatePageTitleForSpecificStudent() {
    const student = allStudents.find(s => s.id === currentStudentId);
    if (student) {
        const pageTitle = document.getElementById('pageTitle');
        if (pageTitle) {
            pageTitle.textContent = `${student.name} 的作业`;
        }
    }
}

// 设置学生筛选器
function setStudentFilter(studentId) {
    const studentFilter = document.getElementById('studentFilter');
    if (studentFilter && studentId) {
        studentFilter.value = studentId.toString();
    }
}

// 显示加载状态
function showLoadingState() {
    document.getElementById('homeworkList').innerHTML = `
        <div class="loading-text">
            <div style="font-size: 1.5rem; margin-bottom: 12px;">⏳</div>
            <div>正在加载学生作业数据...</div>
        </div>
    `;
}

// 显示错误状态
function showErrorState(message) {
    document.getElementById('homeworkList').innerHTML = `
        <div class="empty-state">
            <h3>😞</div>
            <h3>加载失败</h3>
            <p>${message}</p>
            <button onclick="initializePage()" style="margin-top: 16px; padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer;">
                重新加载
            </button>
        </div>
    `;
}

// 显示空状态
function showEmptyState() {
    document.getElementById('homeworkList').innerHTML = `
        <div class="empty-state">
            <div style="font-size: 3rem; margin-bottom: 16px;">📝</div>
            <h3>暂无作业数据</h3>
            <p>系统中还没有任何学生作业记录</p>
            <p>请先添加学生和作业数据</p>
        </div>
    `;
}

// 加载所有数据
async function loadAllData() {
    try {
        // 获取所有作业数据
        const homeworkResponse = await fetch('/api/homeworks');
        if (!homeworkResponse.ok) {
            throw new Error('获取作业数据失败');
        }
        allHomeworks = await homeworkResponse.json();
        
        // 获取所有学生数据
        const studentResponse = await fetch('/api/students');
        if (!studentResponse.ok) {
            throw new Error('获取学生数据失败');
        }
        allStudents = await studentResponse.json();
        
        // 获取所有作曲家数据
        const composerResponse = await fetch('/api/composers');
        if (!composerResponse.ok) {
            throw new Error('获取作曲家数据失败');
        }
        allComposers = await composerResponse.json();
        
    } catch (error) {
        console.error('加载数据失败:', error);
        throw error;
    }
}

// 加载学生筛选选项
function loadStudentFilter() {
    console.log('开始加载学生筛选选项');
    const studentFilter = document.getElementById('studentFilter');
    
    if (!studentFilter) {
        console.error('找不到学生筛选器元素');
        return;
    }
    
    console.log(`找到学生筛选器，学生数量: ${allStudents.length}`);
    
    // 清空现有选项
    studentFilter.innerHTML = '<option value="">所有学生</option>';
    
    if (allStudents.length === 0) {
        console.warn('没有学生数据');
        return;
    }
    
    // 添加学生选项
    allStudents.forEach(student => {
        const option = document.createElement('option');
        option.value = student.id;
        option.textContent = student.name;
        studentFilter.appendChild(option);
    });
    
    console.log('学生筛选选项加载完成');
}

// 加载作曲家筛选选项
function loadComposerFilter() {
    const composerFilter = document.getElementById('composerFilter');
    if (!composerFilter || allComposers.length === 0) return;
    
    // 清空现有选项（保留第一个）
    composerFilter.innerHTML = '<option value="">所有作曲家</option>';
    
    // 添加作曲家选项
    allComposers.forEach(composer => {
        const option = document.createElement('option');
        option.value = composer.id;
        option.textContent = composer.name;
        composerFilter.appendChild(option);
    });
}

// 更新统计信息
function updateStatistics() {
    // 计算参与学生数量（有作业的学生）
    const studentsWithHomework = new Set(allHomeworks.map(h => h.student_id));
    document.getElementById('totalStudents').textContent = studentsWithHomework.size;
    
    // 计算涉及作曲家数量（有作业的作曲家）
    const composersWithHomework = new Set(allHomeworks.map(h => h.composer_id));
    document.getElementById('totalComposers').textContent = composersWithHomework.size;
    
    // 总作业数
    document.getElementById('totalHomeworks').textContent = allHomeworks.length;
}

// 渲染作业列表
function renderHomeworkList(homeworks = null) {
    // 如果没有传递homeworks参数，则根据当前状态决定
    let filteredHomeworks = homeworks;
    
    if (!filteredHomeworks) {
        // 如果有特定学生ID，筛选该学生的作业
        if (currentStudentId) {
            filteredHomeworks = allHomeworks.filter(h => h.student_id === currentStudentId);
        } else {
            filteredHomeworks = allHomeworks;
        }
    }
    
    const homeworkList = document.getElementById('homeworkList');
    
    if (homeworkList && filteredHomeworks.length === 0) {
        showEmptyState();
        return;
    }
    
    // 按学生ID对作业进行分组
    const homeworksByStudent = {};
    filteredHomeworks.forEach(homework => {
        if (!homeworksByStudent[homework.student_id]) {
            homeworksByStudent[homework.student_id] = [];
        }
        homeworksByStudent[homework.student_id].push(homework);
    });
    
    // 对每个学生组内的作业按时间倒序排序（最新的在前）
    Object.keys(homeworksByStudent).forEach(studentId => {
        homeworksByStudent[studentId].sort((a, b) => {
            return new Date(b.created_at) - new Date(a.created_at);
        });
    });
    
    // 按学生姓名的字母顺序排列学生组
    const sortedStudentIds = Object.keys(homeworksByStudent).sort((a, b) => {
        const studentA = allStudents.find(s => s.id == a);
        const studentB = allStudents.find(s => s.id == b);
        const nameA = studentA ? studentA.name : '';
        const nameB = studentB ? studentB.name : '';
        return nameA.localeCompare(nameB, 'zh-CN');
    });
    
    let html = '<div class="student-cards-grid">';
    
    // 渲染每个学生的卡片
    sortedStudentIds.forEach(studentId => {
        const student = allStudents.find(s => s.id == studentId);
        const studentHomeworks = homeworksByStudent[studentId];
        
        // 学生卡片开始
        html += `
            <div class="student-card">
                <div class="student-card-header">
                    <div class="student-card-title">
                        <span class="student-icon">👨‍🎓</span>
                        <span class="student-name">${student ? student.name : '未知学生'}</span>
                    </div>
                    <div class="card-header-buttons">
                        <div class="homework-count-badge">${studentHomeworks.length} 个作业</div>
                        <button class="add-homework-btn" onclick="addHomework(${studentId})">添加作业</button>
                    </div>
                </div>
                <div class="student-homeworks">
        `;
        
        // 渲染该学生的所有作业（紧凑显示）
        studentHomeworks.forEach(homework => {
            const composer = allComposers.find(c => c.id === homework.composer_id);
            
            // 格式化日期
            const date = new Date(homework.created_at).toLocaleDateString('zh-CN');
            
            // 处理图片数量
            const imageCount = homework.images && homework.images.length > 0 ? homework.images.length : 0;
            
            html += `
                <div class="homework-item" onclick="showHomeworkDetail(${homework.id})">
                    <div class="homework-header">
                        <div class="homework-title">${homework.content || '无标题作业'}</div>
                        <div class="homework-date">${date}</div>
                    </div>
                    <div class="homework-info">
                        <div class="homework-composer">
                            <span class="composer-icon">🎼</span>
                            <span class="composer-name">${composer ? composer.name : '未知作曲家'}</span>
                        </div>
                        ${imageCount > 0 ? `
                            <div class="homework-images">
                                📷 包含 ${imageCount} 张图片
                            </div>
                        ` : ''}
                    </div>
                    <div class="homework-actions">
                        <button onclick="editHomework(${homework.id})" class="edit-btn">编辑</button>
                        <button onclick="deleteHomework(${homework.id}, '${homework.content || '无标题作业'}')" class="delete-btn">删除</button>
                    </div>
                </div>
            `;
        });
        
        // 学生卡片结束
        html += `
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    
    homeworkList.innerHTML = html;
}

// 筛选作业
function filterHomeworks() {
    const studentFilter = document.getElementById('studentFilter').value;
    const composerFilter = document.getElementById('composerFilter').value;
    
    let filteredHomeworks = allHomeworks;
    
    // 按学生筛选
    if (studentFilter) {
        filteredHomeworks = filteredHomeworks.filter(h => h.student_id == studentFilter);
    }
    
    // 按作曲家筛选
    if (composerFilter) {
        filteredHomeworks = filteredHomeworks.filter(h => h.composer_id == composerFilter);
    }
    
    // 重新渲染列表
    renderHomeworkList(filteredHomeworks);
    
    // 更新统计信息（可选）
    if (filteredHomeworks.length !== allHomeworks.length) {
        const filteredStudentCount = new Set(filteredHomeworks.map(h => h.student_id)).size;
        const filteredComposerCount = new Set(filteredHomeworks.map(h => h.composer_id)).size;
        
        document.getElementById('totalStudents').textContent = filteredStudentCount;
        document.getElementById('totalComposers').textContent = filteredComposerCount;
        document.getElementById('totalHomeworks').textContent = filteredHomeworks.length;
    }
}

// 重置筛选
function resetFilters() {
    document.getElementById('studentFilter').value = '';
    document.getElementById('composerFilter').value = '';
    
    // 重新渲染所有作业
    renderHomeworkList();
    
    // 恢复原始统计信息
    updateStatistics();
}

// 返回上一页
function goBack() {
    window.history.back();
}

// 查看作业详情
function showHomeworkDetail(homeworkId) {
    // 跳转到作业详情页面
    window.location.href = `/pages/detail/detail.html?type=homework&id=${homeworkId}`;
}

// 添加新作业
function addHomework(studentId) {
    // 跳转到编辑作业页面，传递学生ID参数
    window.location.href = `/pages/edit-homework/edit-homework.html?studentId=${studentId}`;
}

// 编辑作业
function editHomework(homeworkId) {
    // 跳转到作业编辑页面
    window.location.href = `/pages/edit-homework/edit-homework.html?homeworkId=${homeworkId}`;
}

// 删除作业
function deleteHomework(homeworkId, homeworkTitle) {
    if (confirm(`确定要删除作业"${homeworkTitle}"吗？\n\n这个操作将会删除作业及其所有相关的图片文件，且无法恢复！`)) {
        // 显示加载状态
        const confirmBtn = event.target;
        const originalText = confirmBtn.textContent;
        confirmBtn.textContent = '删除中...';
        confirmBtn.disabled = true;
        
        fetch(`/api/homeworks/${homeworkId}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('✅ 作业删除成功！');
                // 重新加载页面数据
                initializePage();
            } else {
                alert('❌ 删除失败: ' + (data.error || '未知错误'));
            }
        })
        .catch(error => {
            console.error('删除作业失败:', error);
            alert('❌ 删除失败，请检查网络连接');
        })
        .finally(() => {
            // 恢复按钮状态
            confirmBtn.textContent = originalText;
            confirmBtn.disabled = false;
        });
    }
}