// 详情页面脚本

// 查看图片
function viewImage(imagePath) {
    // 创建图片查看弹窗
    const modal = document.createElement('div');
    modal.className = 'image-modal';
    modal.innerHTML = `
        <div class="image-modal-content">
            <span class="close-btn" onclick="closeImageModal()">&times;</span>
            <img src="${imagePath}" alt="图片">
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 点击模态框外部关闭
    modal.onclick = function(event) {
        if (event.target === modal) {
            closeImageModal();
        }
    };
}

// 关闭图片弹窗
function closeImageModal() {
    const modal = document.querySelector('.image-modal');
    if (modal) {
        modal.remove();
    }
}

// 显示详细信息
function showDetail(type, id) {
    if (type === 'composer') {
        showComposerDetail(id);
    } else if (type === 'student') {
        showStudentDetail(id);
    } else if (type === 'homework') {
        showHomeworkDetail(id);
    }
}

// 显示作曲家详细信息
function showComposerDetail(composerId) {
    const detailContent = document.getElementById('detailContent');
    detailContent.innerHTML = '加载中...';
    
    // 显示添加作品按钮
    document.getElementById('addWorkBtn').style.display = 'block';
    
    fetch(`/api/composers/${composerId}`)
        .then(response => response.json())
        .then(composer => {
            if (composer.error) {
                detailContent.innerHTML = `<p>获取作曲家信息失败: ${composer.error}</p>`;
                return;
            }
            
            // 构建作曲家详细信息
            let html = '';
            
            // 添加作曲家标题
            html += `<h2>${composer.name}</h2>`;
            
            // 添加基本信息
            html += `<div class="detail-item">`;
            if (composer.birth_year) {
                html += `<span class="detail-label">生卒年份:</span>`;
                html += `<span>${composer.birth_year}</span>`;
            }
            html += `</div>`;
            
            if (composer.nationality) {
                html += `<div class="detail-item">`;
                html += `<span class="detail-label">国籍:</span>`;
                html += `<span>${composer.nationality}</span>`;
                html += `</div>`;
            }
            
            if (composer.description) {
                html += `<div class="detail-item">`;
                html += `<span class="detail-label">简介:</span>`;
                html += `<p>${composer.description}</p>`;
                html += `</div>`;
            }
            
            html += `<hr style="margin: 20px 0;">`;
            
            // 获取该作曲家的所有作品
            fetch(`/composer-works/${composerId}`)
                .then(response => response.json())
                .then(works => {
                    html += `<h3>相关作品</h3>`;
                    
                    if (works.length === 0) {
                        html += `<p>暂无作品数据</p>`;
                    } else {
                        html += `<div class="card-container">`;
                        
                        works.forEach(work => {
                            html += `<div class="detail-card" onclick="showWorkDetail(${work.id})">`;
                            html += `<h4>${work.title}</h4>`;
                            html += `<div class="card-info">难度: ${work.difficulty || '-'}</div>`;
                            html += `<div class="card-date">创建时间: ${work.created_at}</div>`;
                            if (work.images && work.images.length > 0) {
                                html += `<div class="card-info">包含图片: ${work.images.length}张</div>`;
                            }
                            html += `</div>`;
                        });
                        
                        html += `</div>`;
                    }
                    
                    detailContent.innerHTML = html;
                })
                .catch(error => {
                    console.error('获取作曲家作品失败:', error);
                    detailContent.innerHTML = `<p>获取作品数据失败</p>`;
                });
        })
        .catch(error => {
            console.error('获取作曲家信息失败:', error);
            detailContent.innerHTML = `<p>获取作曲家信息失败</p>`;
        });
}

// 显示学生详细信息
function showStudentDetail(studentId) {
    const detailContent = document.getElementById('detailContent');
    detailContent.innerHTML = '加载中...';
    
    fetch(`/api/students/${studentId}`)
        .then(response => response.json())
        .then(student => {
            if (student.error) {
                detailContent.innerHTML = `<p>获取学生信息失败: ${student.error}</p>`;
                return;
            }
            
            // 获取该学生的所有作业
            fetch(`/api/students/${studentId}/homeworks`)
                .then(response => response.json())
                .then(homeworks => {
                    let html = `<h2>${student.name} - 作业列表</h2>`;
                    
                    if (homeworks.length === 0) {
                        html += `<p>暂无作业数据</p>`;
                    } else {
                        html += `<h3>相关作业</h3>`;
                        html += `<div class="card-container">`;
                        
                        homeworks.forEach(homework => {
                            html += `<div class="detail-card" onclick="showHomeworkDetail(${homework.id})">`;
                            html += `<h4>${homework.content}</h4>`;
                            html += `<div class="card-info">作曲家: ${homework.composer_name || '-'}</div>`;
                            html += `<div class="card-date">创建时间: ${homework.created_at}</div>`;
                            if (homework.images && homework.images.length > 0) {
                                html += `<div class="card-info">包含图片: ${homework.images.length}张</div>`;
                            }
                            html += `</div>`;
                        });
                        
                        html += `</div>`;
                    }
                    
                    detailContent.innerHTML = html;
                })
                .catch(error => {
                    console.error('获取学生作业失败:', error);
                    detailContent.innerHTML = `<p>获取作业数据失败</p>`;
                });
        })
        .catch(error => {
            console.error('获取学生信息失败:', error);
            detailContent.innerHTML = `<p>获取学生信息失败</p>`;
        });
}

// 显示作业详细信息
function showHomeworkDetail(homeworkId) {
    const detailContent = document.getElementById('detailContent');
    detailContent.innerHTML = '加载中...';
    
    fetch(`/api/homeworks/${homeworkId}`)
        .then(response => response.json())
        .then(homework => {
            if (homework.error) {
                detailContent.innerHTML = `<p>获取作业信息失败: ${homework.error}</p>`;
                return;
            }
            
            let html = `<h2>作业详情</h2>`;
            html += `<div class="detail-item">`;
            html += `<span class="detail-label">内容:</span>`;
            html += `<span>${homework.content}</span>`;
            html += `</div>`;
            
            html += `<div class="detail-item">`;
            html += `<span class="detail-label">作曲家:</span>`;
            html += `<span>${homework.composer_name ? `<span class="clickable-text" onclick="showComposerDetail(${homework.composer_id})">${homework.composer_name}</span>` : '-'}</span>`;
            html += `</div>`;
            
            html += `<div class="detail-item">`;
            html += `<span class="detail-label">学生:</span>`;
            html += `<span>${homework.student_name ? `<span class="clickable-text" onclick="showStudentDetail(${homework.student_id})">${homework.student_name}</span>` : '-'}</span>`;
            html += `</div>`;
            
            html += `<div class="detail-item">`;
            html += `<span class="detail-label">创建时间:</span>`;
            html += `<span>${homework.created_at}</span>`;
            html += `</div>`;
            
            // 直接显示图片 - 竖直排列，占满宽度
            if (homework.images && homework.images.length > 0) {
                html += `<div class="detail-item">`;
                html += `<span class="detail-label">图片:</span>`;
                html += `<div class="detail-images-vertical">`;
                
                homework.images.forEach((imageName, index) => {
                    if (imageName.trim() !== '') {
                        html += `<img src="/uploads/${imageName.trim()}" alt="图片${index + 1}" class="detail-image-fullwidth" onclick="viewImage('/uploads/${imageName.trim()}')">`;
                    }
                });
                
                html += `</div>`;
                html += `</div>`;
            }
            
            detailContent.innerHTML = html;
            
            // 显示右上角的修改按钮
            const editBtn = document.getElementById('editHomeworkBtn');
            if (editBtn) {
                editBtn.style.display = 'inline-block';
                editBtn.setAttribute('data-homework-id', homework.id);
            }
        })
        .catch(error => {
            console.error('获取作业信息失败:', error);
            detailContent.innerHTML = `<p>获取作业信息失败</p>`;
        });
}

// 显示作品详情（跳转到作品详情页面）
function showWorkDetail(workId) {
    // 跳转到作品详情页面
    window.location.href = `../work-detail/work-detail.html?workId=${workId}`;
}

// 编辑当前作业
function editCurrentHomework() {
    const editBtn = document.getElementById('editHomeworkBtn');
    const homeworkId = editBtn.getAttribute('data-homework-id');
    if (homeworkId) {
        // 跳转到编辑作业页面
        window.location.href = `../edit-homework/edit-homework.html?homeworkId=${homeworkId}`;
    }
}

// 添加新作品
function addNewWork() {
    // 从URL参数获取作曲家ID
    const urlParams = new URLSearchParams(window.location.search);
    const composerId = urlParams.get('composerId');
    
    if (composerId) {
        // 跳转到编辑作品页面，传递作曲家ID
        window.location.href = `../edit-work/edit-work.html?composerId=${composerId}`;
    } else {
        alert('无法获取作曲家信息');
    }
}

// 返回上一页
function goBack() {
    // 尝试返回上一页
    if (document.referrer) {
        window.location.href = document.referrer;
    } else {
        // 如果没有来源页面，可以跳转到主页或其他合适的页面
        window.location.href = '../../index.html';
    }
}

// DOM加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 从URL参数获取类型和ID
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type');
    const id = urlParams.get('id');
    
    if (type && id) {
        // 显示对应的详情
        showDetail(type, parseInt(id));
    } else {
        // 如果没有参数，显示选择界面
        showDetailSelection();
    }
});

// 显示详情选择界面
function showDetailSelection() {
    const detailContent = document.getElementById('detailContent');
    
    // 隐藏所有按钮
    document.getElementById('editHomeworkBtn').style.display = 'none';
    document.getElementById('addWorkBtn').style.display = 'none';
    
    let html = '<div class="detail-selection">';
    html += '<h2>选择要查看的详情</h2>';
    html += '<p>请选择要查看的详细信息类型：</p>';
    
    html += '<div class="selection-grid">';
    
    // 作曲家详情
    html += '<div class="selection-card" onclick="showComposerList()">';
    html += '<div class="selection-icon">🎼</div>';
    html += '<h3>作曲家详情</h3>';
    html += '<p>查看作曲家的基本信息和作品</p>';
    html += '</div>';
    
    // 学生详情
    html += '<div class="selection-card" onclick="showStudentList()">';
    html += '<div class="selection-icon">👨‍🎓</div>';
    html += '<h3>学生详情</h3>';
    html += '<p>查看学生的基本信息和作业</p>';
    html += '</div>';
    
    // 作业详情
    html += '<div class="selection-card" onclick="showHomeworkList()">';
    html += '<div class="selection-icon">📝</div>';
    html += '<h3>作业详情</h3>';
    html += '<p>查看作业的详细信息</p>';
    html += '</div>';
    
    html += '</div>';
    html += '</div>';
    
    detailContent.innerHTML = html;
}

// 显示作曲家列表
function showComposerList() {
    const detailContent = document.getElementById('detailContent');
    detailContent.innerHTML = '<div class="loading">加载中...</div>';
    
    fetch('/api/composers')
        .then(response => response.json())
        .then(composers => {
            let html = '<h2>作曲家列表</h2>';
            
            if (composers.length === 0) {
                html += '<p>暂无作曲家数据</p>';
            } else {
                html += '<div class="card-container">';
                
                composers.forEach(composer => {
                    html += `<div class="detail-card" onclick="showDetail('composer', ${composer.id})">`;
                    html += `<h4>${composer.name}</h4>`;
                    html += `<div class="card-info">${composer.nationality || '-'}</div>`;
                    if (composer.birth_year) {
                        html += `<div class="card-info">${composer.birth_year}</div>`;
                    }
                    html += `</div>`;
                });
                
                html += '</div>';
            }
            
            // 添加返回选择界面的按钮
            html += '<div class="back-to-selection">';
            html += '<button class="back-btn" onclick="showDetailSelection()">返回选择</button>';
            html += '</div>';
            
            detailContent.innerHTML = html;
        })
        .catch(error => {
            console.error('获取作曲家列表失败:', error);
            detailContent.innerHTML = '<p>获取作曲家列表失败</p>';
        });
}

// 显示学生列表
function showStudentList() {
    const detailContent = document.getElementById('detailContent');
    detailContent.innerHTML = '<div class="loading">加载中...</div>';
    
    fetch('/api/students')
        .then(response => response.json())
        .then(students => {
            let html = '<h2>学生列表</h2>';
            
            // 添加添加作业按钮
            html += '<div class="action-buttons" style="text-align: right; margin-bottom: 20px;">';
            html += '<button class="add-homework-btn" onclick="addStudentHomework()">添加作业</button>';
            html += '</div>';
            
            if (students.length === 0) {
                html += '<p>暂无学生数据</p>';
            } else {
                html += '<div class="card-container">';
                
                students.forEach(student => {
                    html += `<div class="detail-card" onclick="showDetail('student', ${student.id})">`;
                    html += `<h4>${student.name}</h4>`;
                    html += `<div class="card-info">${student.email || '-'}</div>`;
                    if (student.age) {
                        html += `<div class="card-info">年龄: ${student.age}</div>`;
                    }
                    html += `</div>`;
                });
                
                html += '</div>';
            }
            
            // 添加返回选择界面的按钮
            html += '<div class="back-to-selection">';
            html += '<button class="back-btn" onclick="showDetailSelection()">返回选择</button>';
            html += '</div>';
            
            detailContent.innerHTML = html;
        })
        .catch(error => {
            console.error('获取学生列表失败:', error);
            detailContent.innerHTML = '<p>获取学生列表失败</p>';
        });
}

// 显示作业列表
function showHomeworkList() {
    const detailContent = document.getElementById('detailContent');
    detailContent.innerHTML = '<div class="loading">加载中...</div>';
    
    fetch('/api/homeworks')
        .then(response => response.json())
        .then(homeworks => {
            let html = '<h2>作业列表</h2>';
            
            if (homeworks.length === 0) {
                html += '<p>暂无作业数据</p>';
            } else {
                html += '<div class="card-container">';
                
                homeworks.forEach(homework => {
                    html += `<div class="detail-card" onclick="showDetail('homework', ${homework.id})">`;
                    html += `<h4>${homework.content}</h4>`;
                    html += `<div class="card-info">学生: ${homework.student_name || '-'}</div>`;
                    html += `<div class="card-info">作曲家: ${homework.composer_name || '-'}</div>`;
                    html += `<div class="card-date">创建时间: ${homework.created_at}</div>`;
                    html += `</div>`;
                });
                
                html += '</div>';
            }
            
            // 添加返回选择界面的按钮
            html += '<div class="back-to-selection">';
            html += '<button class="back-btn" onclick="showDetailSelection()">返回选择</button>';
            html += '</div>';
            
            detailContent.innerHTML = html;
        })
        .catch(error => {
            console.error('获取作业列表失败:', error);
            detailContent.innerHTML = '<p>获取作业列表失败</p>';
        });
}

// 添加学生作业
function addStudentHomework() {
    // 跳转到添加学生作业页面
    window.location.href = '../edit-homework/edit-homework.html';
}