

// 获取所有数据
function getData() {
    fetch('/get-data')
        .then(response => response.json())
        .then(data => {
            const dataList = document.getElementById('dataList');
            
            if (data.length === 0) {
                dataList.innerHTML = '<p>暂无数据</p>';
                return;
            }
            
            let html = '<table>';
            html += '<tr><th>编号</th><th>内容</th><th>作曲家</th><th>学生</th><th>创建时间</th><th>操作</th></tr>';
            
            data.forEach(item => {
                html += `<tr>`;
                html += `<td>${item.id}</td>`;
                html += `<td class="clickable-text" onclick="showDetail('homework', ${item.id})">${item.content}</td>`;
                html += `<td>${item.composer_name ? `<span class="clickable-text" onclick="showDetail('composer', ${item.composer_id})">${item.composer_name}</span>` : '-'}</td>`;
                html += `<td>${item.student_name ? `<span class="clickable-text" onclick="showDetail('student', ${item.student_id})">${item.student_name}</span>` : '-'}</td>`;
                html += `<td>${item.created_at}</td>`;
                html += `<td>`;
                if (item.images && item.images.length > 0) {
                    html += `<span>${item.images.length}张图片</span>`;
                } else {
                    html += '<span>无图片</span>';
                }
                html += `</td>`;
                html += `</tr>`;
            });
            
            html += '</table>';
            dataList.innerHTML = html;
        })
        .catch(error => {
            console.error('获取数据失败:', error);
            document.getElementById('dataList').innerHTML = '<p>获取数据失败</p>';
        });
}



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

// 编辑作业
function editHomework(homeworkId) {
    // 显示页面5（编辑页面）
    showPage(5);
    // 加载作业数据到编辑表单
    loadHomeworkToEdit(homeworkId);
}

// 编辑当前作业（右上角按钮）
function editCurrentHomework() {
    const editBtn = document.getElementById('editHomeworkBtn');
    const homeworkId = editBtn.getAttribute('data-homework-id');
    if (homeworkId) {
        editHomework(homeworkId);
    }
}

  
  // 插入数据
function insertData() {
    const content = document.getElementById('contentInput').value.trim();
    const composerId = document.getElementById('composerSelect').value;
    const studentId = document.getElementById('studentSelect').value;
    const fileInput = document.getElementById('imageInput');
    const files = fileInput.files;
    
    if (!content) {
        alert('请输入内容');
        return;
    }
    
    if (!composerId) {
        alert('请选择作曲家');
        return;
    }
    
    if (!studentId) {
        alert('请选择学生');
        return;
    }
    
    // 创建FormData对象
    const formData = new FormData();
    formData.append('content', content);
    formData.append('composer_id', composerId);
    formData.append('student_id', studentId);
    
    // 添加所有选择的图片文件
    if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
            formData.append('images', files[i]);
        }
    }
    
    fetch('/insert', {
        method: 'POST',
        body: formData  // 不需要设置Content-Type，浏览器会自动处理
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // 清空输入框
            document.getElementById('contentInput').value = '';
            // 清空文件输入
            document.getElementById('imageInput').value = '';
            // 刷新数据
            getData();
        } else {
            alert(data.error || '插入失败');
        }
    })
    .catch(error => {
        console.error('插入数据失败:', error);
        alert('插入失败');
    });
}

// 获取作曲家和学生数据
function loadComposersAndStudents() {
    // 获取作曲家数据
    fetch('/composers')
        .then(response => response.json())
        .then(composers => {
            const composerSelect = document.getElementById('composerSelect');
            // 清空现有选项（保留第一个）
            composerSelect.innerHTML = '<option value="">选择作曲家</option>';
            
            composers.forEach(composer => {
                const option = document.createElement('option');
                option.value = composer.id;
                option.textContent = composer.name;
                composerSelect.appendChild(option);
            });
        })
        .catch(error => console.error('获取作曲家数据失败:', error));
    
    // 获取学生数据
    fetch('/students')
        .then(response => response.json())
        .then(students => {
            const studentSelect = document.getElementById('studentSelect');
            // 清空现有选项（保留第一个）
            studentSelect.innerHTML = '<option value="">选择学生</option>';
            
            students.forEach(student => {
                const option = document.createElement('option');
                option.value = student.id;
                option.textContent = student.name;
                studentSelect.appendChild(option);
            });
        })
        .catch(error => console.error('获取学生数据失败:', error));
}

// 获取作曲家列表
function getComposers() {
    fetch('/composers')
        .then(response => response.json())
        .then(composers => {
            const composersList = document.getElementById('composersList');
            
            if (composers.length === 0) {
                composersList.innerHTML = '<p>暂无作曲家数据</p>';
                return;
            }
            
            let html = '<table>';
            html += '<tr><th>ID</th><th>名称</th><th>操作</th></tr>';
            
            composers.forEach(composer => {
                html += `<tr>`;
                html += `<td>${composer.id}</td>`;
                html += `<td><input type="text" id="composerEditInput${composer.id}" value="${composer.name}" class="edit-input"></td>`;
                html += `<td>`;
                html += `<button onclick="updateComposer(${composer.id})" class="update-btn">更新</button>`;
                html += `<button onclick="deleteComposer(${composer.id})" class="delete-btn">删除</button>`;
                html += `<button onclick="showComposerWorks(${composer.id})" class="view-btn">详情</button>`;
                html += `</td>`;
                html += `</tr>`;
            });
            
            html += '</table>';
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
    
    fetch('/composers', {
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
    const input = document.getElementById(`composerEditInput${id}`);
    const name = input.value.trim();
    
    if (!name) {
        alert('请输入作曲家名称');
        return;
    }
    
    fetch(`/composers/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: name })
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
        fetch(`/composers/${id}`, {
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

// 获取学生列表
function getStudents() {
    fetch('/students')
        .then(response => response.json())
        .then(students => {
            const studentsList = document.getElementById('studentsList');
            
            if (students.length === 0) {
                studentsList.innerHTML = '<p>暂无学生数据</p>';
                return;
            }
            
            let html = '<table>';
            html += '<tr><th>ID</th><th>姓名</th><th>操作</th></tr>';
            
            students.forEach(student => {
                html += `<tr>`;
                html += `<td>${student.id}</td>`;
                html += `<td><input type="text" id="studentEditInput${student.id}" value="${student.name}" class="edit-input"></td>`;
                html += `<td>`;
                html += `<button onclick="updateStudent(${student.id})" class="update-btn">更新</button>`;
                html += `<button onclick="deleteStudent(${student.id})" class="delete-btn">删除</button>`;
                html += `</td>`;
                html += `</tr>`;
            });
            
            html += '</table>';
            studentsList.innerHTML = html;
        })
        .catch(error => {
            console.error('获取学生数据失败:', error);
            document.getElementById('studentsList').innerHTML = '<p>获取数据失败</p>';
        });
}

// 添加学生
function addStudent() {
    const name = document.getElementById('studentNameInput').value.trim();
    
    if (!name) {
        alert('请输入学生姓名');
        return;
    }
    
    fetch('/students', {
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
            document.getElementById('studentNameInput').value = '';
            // 刷新学生列表
            getStudents();
            // 同时刷新界面1中的学生下拉列表
            loadComposersAndStudents();
        }
    })
    .catch(error => {
        console.error('添加学生失败:', error);
        alert('添加失败');
    });
}

// 更新学生
function updateStudent(id) {
    const input = document.getElementById(`studentEditInput${id}`);
    const name = input.value.trim();
    
    if (!name) {
        alert('请输入学生姓名');
        return;
    }
    
    fetch(`/students/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: name })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // 刷新学生列表
            getStudents();
            // 同时刷新界面1中的学生下拉列表
            loadComposersAndStudents();
        } else {
            alert(data.error || '更新失败');
        }
    })
    .catch(error => {
        console.error('更新学生失败:', error);
        alert('更新失败');
    });
}

// 删除学生
function deleteStudent(id) {
    if (confirm('确定要删除这个学生吗？')) {
        fetch(`/students/${id}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // 刷新学生列表
                getStudents();
                // 同时刷新界面1中的学生下拉列表
                loadComposersAndStudents();
            } else {
                alert(data.error || '删除失败');
            }
        })
        .catch(error => {
            console.error('删除学生失败:', error);
            alert('删除失败');
        });
    }
}



// DOM加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 初始加载数据
    getData();
    loadComposersAndStudents();
    
    // 为插入按钮添加点击事件
    document.getElementById('insertBtn').addEventListener('click', insertData);
    
    // 为输入框添加回车键事件
    document.getElementById('contentInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            insertData();
        }
    });
    
    // 作曲家管理事件绑定
    document.getElementById('addComposerBtn').addEventListener('click', addComposer);
    document.getElementById('composerNameInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addComposer();
        }
    });
    
    // 学生管理事件绑定
    document.getElementById('addStudentBtn').addEventListener('click', addStudent);
    document.getElementById('studentNameInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addStudent();
        }
    });
    
    // 编辑页面事件绑定
    document.getElementById('editContentInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            updateHomework();
        }
    });
});

// 显示详细信息
function showDetail(type, id) {
    if (type === 'work') {
        showWorkDetail(id);
    } else {
        showPage(4);
        if (type === 'composer') {
            showComposerDetail(id);
        } else if (type === 'student') {
            showStudentDetail(id);
        } else if (type === 'homework') {
            showHomeworkDetail(id);
        }
    }
}

// 显示作曲家详细信息
function showComposerDetail(composerId) {
    const detailContent = document.getElementById('detailContent');
    detailContent.innerHTML = '加载中...';
    
    // 显示添加作品按钮
    document.getElementById('addWorkBtn').style.display = 'block';
    
    fetch(`/composers/${composerId}`)
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
                            html += `<div class="detail-card" onclick="showDetail('work', ${work.id})">`;
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
    
    fetch(`/students/${studentId}`)
        .then(response => response.json())
        .then(student => {
            if (student.error) {
                detailContent.innerHTML = `<p>获取学生信息失败: ${student.error}</p>`;
                return;
            }
            
            // 获取该学生的所有作业
            fetch(`/student-homeworks/${studentId}`)
                .then(response => response.json())
                .then(homeworks => {
                    let html = `<h2>${student.name} - 作业列表</h2>`;
                    
                    if (homeworks.length === 0) {
                        html += `<p>暂无作业数据</p>`;
                    } else {
                        html += `<h3>相关作业</h3>`;
                        html += `<div class="card-container">`;
                        
                        homeworks.forEach(homework => {
                            html += `<div class="detail-card" onclick="showDetail('homework', ${homework.id})">`;
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

// 加载作业数据到编辑表单
function loadHomeworkToEdit(homeworkId) {
    fetch(`/homeworks/${homeworkId}`)
        .then(response => response.json())
        .then(homework => {
            if (homework.error) {
                alert('获取作业信息失败: ' + homework.error);
                return;
            }
            
            // 填充编辑表单
            document.getElementById('editContentInput').value = homework.content;
            document.getElementById('editComposerSelect').value = homework.composer_id || '';
            document.getElementById('editStudentSelect').value = homework.student_id || '';
            document.getElementById('editHomeworkId').value = homework.id;
            
            // 显示当前图片
            const currentImagesDiv = document.getElementById('currentImagesDiv');
            if (homework.images && homework.images.length > 0) {
                let html = '<h4>当前图片:</h4>';
                homework.images.forEach((imageName, index) => {
                    html += `<div class="current-image-item">
                        <img src="/uploads/${imageName.trim()}" alt="图片${index + 1}" class="current-image">
                        <button onclick="removeImage(${homework.id}, '${imageName.trim()}', this)" class="remove-image-btn">删除</button>
                    </div>`;
                });
                currentImagesDiv.innerHTML = html;
            } else {
                currentImagesDiv.innerHTML = '<p>无图片</p>';
            }
        })
        .catch(error => {
            console.error('获取作业信息失败:', error);
            alert('获取作业信息失败');
        });
}

// 删除图片
function removeImage(homeworkId, imageName, buttonElement) {
    if (confirm('确定要删除这张图片吗？')) {
        fetch('/remove-image', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                homework_id: homeworkId,
                image_name: imageName
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // 移除DOM中的图片元素
                buttonElement.parentElement.remove();
                alert('图片已删除');
            } else {
                alert(data.error || '删除失败');
            }
        })
        .catch(error => {
            console.error('删除图片失败:', error);
            alert('删除失败');
        });
}

// 更新作业
function updateHomework() {
    const homeworkId = document.getElementById('editHomeworkId').value;
    const content = document.getElementById('editContentInput').value.trim();
    const composerId = document.getElementById('editComposerSelect').value;
    const studentId = document.getElementById('editStudentSelect').value;
    const fileInput = document.getElementById('editImageInput');
    const files = fileInput.files;
    
    if (!content) {
        alert('请输入内容');
        return;
    }
    
    if (!composerId) {
        alert('请选择作曲家');
        return;
    }
    
    if (!studentId) {
        alert('请选择学生');
        return;
    }
    
    // 创建FormData对象
    const formData = new FormData();
    formData.append('homework_id', homeworkId);
    formData.append('content', content);
    formData.append('composer_id', composerId);
    formData.append('student_id', studentId);
    
    // 添加所有选择的图片文件
    if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
            formData.append('images', files[i]);
        }
    }
    
    fetch('/update-homework', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('更新成功');
            // 返回作业详情页面
            showPage(4);
            // 刷新数据
            getData();
        } else {
            alert(data.error || '更新失败');
        }
    })
    .catch(error => {
        console.error('更新失败:', error);
        alert('更新失败');
    });
}
}

// 显示作业详细信息
function showHomeworkDetail(homeworkId) {
    const detailContent = document.getElementById('detailContent');
    detailContent.innerHTML = '加载中...';
    
    fetch(`/homeworks/${homeworkId}`)
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
            html += `<span>${homework.composer_name ? `<span class="clickable-text" onclick="showDetail('composer', ${homework.composer_id})">${homework.composer_name}</span>` : '-'}</span>`;
            html += `</div>`;
            
            html += `<div class="detail-item">`;
            html += `<span class="detail-label">学生:</span>`;
            html += `<span>${homework.student_name ? `<span class="clickable-text" onclick="showDetail('student', ${homework.student_id})">${homework.student_name}</span>` : '-'}</span>`;
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

// 扩展界面切换功能，支持页面4
function showPage(pageNumber) {
    // 隐藏所有页面
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.classList.remove('active');
    });
    
    // 显示当前页面
    const currentPage = document.getElementById(`page${pageNumber}`);
    currentPage.classList.add('active');
    
    // 更新导航按钮状态
    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(btn => {
        btn.classList.remove('active');
    });
    
    // 设置当前导航按钮为激活状态
    const currentBtn = document.querySelector(`[onclick="showPage(${pageNumber})"]`);
    if (currentBtn) {
        currentBtn.classList.add('active');
    }
    
    // 根据页面加载相应数据
    if (pageNumber === 1) {
        getData();
        loadComposersAndStudents();
    } else if (pageNumber === 2) {
        getComposers();
    } else if (pageNumber === 3) {
        getStudents();
    } else if (pageNumber === 4) {
        // 在页面4时，不自动加载数据，而是保持当前内容
        // 但是隐藏修改按钮（如果存在的话）
        const editBtn = document.getElementById('editHomeworkBtn');
        if (editBtn) {
            editBtn.style.display = 'none';
        }
    } else if (pageNumber === 5) {
        // 编辑页面也需要加载作曲家和学生数据
        loadComposersAndStudents();
        // 隐藏修改按钮
        const editBtn = document.getElementById('editHomeworkBtn');
        if (editBtn) {
            editBtn.style.display = 'none';
        }
    } else if (pageNumber === 6) {
        // 作品列表页面，隐藏修改按钮
        const editBtn = document.getElementById('editHomeworkBtn');
        if (editBtn) {
            editBtn.style.display = 'none';
        }
    } else if (pageNumber === 7) {
        // 编辑作品页面，隐藏修改按钮
        const editBtn = document.getElementById('editHomeworkBtn');
        if (editBtn) {
            editBtn.style.display = 'none';
        }
    }
}

// 显示作曲家的作品列表
function showComposerWorks(composerId) {
    // 保存作曲家ID，供后续使用
    window.currentComposerId = composerId;
    
    // 切换到作品列表页面
    showPage(6);
    
    // 获取作曲家作品
    getComposerWorks(composerId);
}

// 显示作品详情
function showWorkDetail(workId) {
    // 切换到作品详情页面
    showPage(8);
    
    // 显示加载中
    document.getElementById('workDetailContent').innerHTML = '<p>加载中...</p>';
    
    // 获取作品详情
    fetch(`/works/${workId}`)
        .then(response => response.json())
        .then(work => {
            if (work.error) {
                document.getElementById('workDetailContent').innerHTML = `<p>${work.error}</p>`;
                return;
            }
            
            // 构建作品详情内容
            let html = '';
            
            // 添加作品标题和作曲家
            html += `<h2>${work.title}</h2>`;
            html += `<p class="composer-name">作曲家: ${work.composer_name}</p>`;
            
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
                    html += `<div class="image-item">`;
                    html += `<img src="${imagePath}" alt="作品图片" onclick="viewImage('${imagePath}')">`;
                    html += `</div>`;
                });
                html += `</div>`;
            } else {
                html += `<p>暂无图片</p>`;
            }
            
            html += `</div>`;
            
            // 添加创建时间
            html += `<p class="work-date">创建时间: ${work.created_at}</p>`;
            
            // 设置作品详情内容
            document.getElementById('workDetailContent').innerHTML = html;
            
            // 设置编辑按钮数据属性
            const editBtn = document.getElementById('editWorkBtn');
            editBtn.setAttribute('data-work-id', workId);
        })
        .catch(error => {
            console.error('获取作品详情失败:', error);
            document.getElementById('workDetailContent').innerHTML = '<p>获取作品详情失败</p>';
        });
}

// 获取作曲家的作品列表
function getComposerWorks(composerId) {
    fetch(`/composer-works/${composerId}`)
        .then(response => response.json())
        .then(works => {
            const contentDiv = document.getElementById('composerWorksContent');
            
            if (works.length === 0) {
                contentDiv.innerHTML = '<p>暂无作品</p>';
                return;
            }
            
            let html = '<table>';
            html += '<tr><th>编号</th><th>内容</th><th>作曲家</th><th>学生</th><th>创建时间</th><th>操作</th></tr>';
            
            works.forEach(work => {
                html += `<tr>`;
                html += `<td>${work.id}</td>`;
                html += `<td class="clickable-text" onclick="showDetail('work', ${work.id})">${work.title}</td>`;
                html += `<td>${work.composer_name ? `<span class="clickable-text" onclick="showDetail('composer', ${work.composer_id})">${work.composer_name}</span>` : '-'}</td>`;
                html += `<td>-</td>`; // 作品没有学生信息，用'-'代替
                html += `<td>${work.created_at}</td>`;
                html += `<td>`;
                if (work.images && work.images.length > 0) {
                    html += `<span>${work.images.length}张图片</span>`;
                } else {
                    html += '<span>无图片</span>';
                }
                html += `</td>`;
                html += `</tr>`;
            });
            
            html += '</table>';
            contentDiv.innerHTML = html;
            
            // 设置添加作品按钮事件
            const addWorkBtn = document.getElementById('addWorkBtn');
            if (addWorkBtn) {
                addWorkBtn.onclick = function() {
                    editWork(null, composerId);
                };
            }
        })
        .catch(error => {
            console.error('获取作品列表失败:', error);
            document.getElementById('composerWorksContent').innerHTML = '<p>获取作品列表失败</p>';
        });
}

// 编辑作品
function editWork(workId, composerId) {
    // 如果没有提供composerId，从当前作曲家ID获取
    if (!composerId) {
        composerId = window.currentComposerId;
    }
    
    // 切换到编辑作品页面
    showPage(7);
    
    // 设置表单标题
    document.getElementById('editWorkTitle').textContent = workId ? '编辑作品' : '添加作品';
    
    // 设置隐藏字段
    document.getElementById('editWorkId').value = workId || '';
    document.getElementById('editWorkComposerId').value = composerId;
    
    // 如果是编辑模式，加载现有作品数据
    if (workId) {
        fetch(`/works/${workId}`)
            .then(response => response.json())
            .then(work => {
                if (work.error) {
                    alert(work.error);
                    return;
                }
                
                // 填充表单
                document.getElementById('editWorkTitleInput').value = work.title;
                document.getElementById('editWorkDifficultyInput').value = work.difficulty || '';
                document.getElementById('editWorkDescriptionInput').value = work.description || '';
            })
            .catch(error => {
                console.error('获取作品信息失败:', error);
                alert('获取作品信息失败');
            });
    } else {
        // 清空表单
        document.getElementById('editWorkTitleInput').value = '';
        document.getElementById('editWorkDifficultyInput').value = '';
        document.getElementById('editWorkDescriptionInput').value = '';
    }
}

// 添加新作品（从作品详情页面的按钮）
function addNewWork() {
    // 切换到编辑作品页面，传递空的作品ID和当前的作曲家ID
    editWork(null, window.currentComposerId);
}

// 编辑当前作品（详情页面右上角按钮）
function editCurrentWork() {
    const editBtn = document.getElementById('editWorkBtn');
    const workId = editBtn.getAttribute('data-work-id');
    if (workId) {
        editWork(workId);
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
    
    if (!title) {
        alert('请输入作品标题');
        return;
    }
    
    if (!composerId) {
        alert('缺少作曲家信息');
        return;
    }
    
    // 创建FormData对象
    const formData = new FormData();
    formData.append('title', title);
    formData.append('composer_id', composerId);
    formData.append('difficulty', difficulty);
    formData.append('description', description);
    
    // 添加所有选择的图片文件
    if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
            formData.append('images', files[i]);
        }
    }
    
    const url = workId ? `/update-work` : '/works';
    const method = 'POST'; // 新增和更新都使用POST
    
    fetch(url, {
        method: method,
        body: formData  // 不需要设置Content-Type，浏览器会自动处理
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
        } else {
            // 返回作品列表页面
            showPage(6);
            // 刷新作品列表
            getComposerWorks(composerId);
        }
    })
    .catch(error => {
        console.error('保存作品失败:', error);
        alert('保存作品失败');
    });
}

// 删除作品
function deleteWork(workId) {
    if (!confirm('确定要删除这个作品吗？')) {
        return;
    }
    
    fetch(`/works/${workId}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
        } else {
            // 刷新作品列表
            getComposerWorks(window.currentComposerId);
        }
    })
    .catch(error => {
        console.error('删除作品失败:', error);
        alert('删除作品失败');
    });
}