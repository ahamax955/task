// 学生管理页面脚本

// 获取学生列表
function getStudents() {
    fetch('/api/students')
        .then(response => response.json())
        .then(students => {
            const studentsList = document.getElementById('studentsList');
            
            if (students.length === 0) {
                studentsList.innerHTML = '<p>暂无学生数据</p>';
                return;
            }
            
            let html = '';
            
            // 按学生姓名的字母顺序排列
            students.sort((a, b) => {
                return a.name.localeCompare(b.name, 'zh-CN');
            });

            html = '<div class="student-cards-grid">';
            
            students.forEach(student => {
                // 学生卡片开始
                html += `
                    <div class="student-card">
                        <div class="student-card-header">
                            <div class="student-card-title">
                                <span class="student-icon">👨‍🎓</span>
                                <span class="student-name" onclick="viewStudentHomeworks(${student.id})" title="点击查看该学生的作业">${student.name}</span>
                            </div>
                            <div class="card-header-buttons">
                                <div class="student-count-badge">管理</div>
                                <button class="add-homework-btn" onclick="addStudentHomework(${student.id})">添加作业</button>
                            </div>
                        </div>
                        <div class="student-management-buttons">
                            <button onclick="updateStudent(${student.id})" class="update-btn">更新</button>
                            <button onclick="deleteStudent(${student.id})" class="delete-btn">删除</button>
                        </div>
                    </div>
                `;
            });
            
            html += '</div>';
            
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
    
    fetch('/api/students', {
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
    const name = prompt('请输入新的学生姓名:');
    
    if (!name || name.trim() === '') {
        alert('请输入有效的学生姓名');
        return;
    }
    
    fetch(`/api/students/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: name.trim() })
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
        fetch(`/api/students/${id}`, {
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

// 查看所有学生作业
function viewAllStudentHomeworks() {
    // 跳转到学生作业列表页面
    window.location.href = '/pages/student-homework-list/student-homework-list.html';
}

// 查看特定学生的作业
function viewStudentHomeworks(studentId) {
    // 跳转到学生作业列表页面，并传递学生ID参数
    window.location.href = `/pages/student-homework-list/student-homework-list.html?studentId=${studentId}`;
}

// 添加学生作业
function addStudentHomework(studentId) {
    // 跳转到添加学生作业页面，传递学生ID
    window.location.href = `/pages/edit-homework/edit-homework.html?studentId=${studentId}`;
}

// 页面切换函数（仅用于学生管理页面内的导航）
function showPage(pageNumber) {
    // 这个函数在重构后不再使用，因为每个页面都是独立的HTML文件
    console.log('页面切换功能已在重构中移除');
}

// DOM加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 加载学生列表
    getStudents();
    
    // 为添加学生按钮添加点击事件
    document.getElementById('addStudentBtn').addEventListener('click', addStudent);
    
    // 为输入框添加回车键事件
    document.getElementById('studentNameInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addStudent();
        }
    });
});