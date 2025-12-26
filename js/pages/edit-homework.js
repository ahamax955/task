// 编辑作业页面 JavaScript 文件

let currentHomeworkId = null;
let currentStudentId = null;

// 页面初始化
document.addEventListener('DOMContentLoaded', function() {
    // 从 URL 参数获取 homeworkId 或 studentId
    const urlParams = new URLSearchParams(window.location.search);
    currentHomeworkId = urlParams.get('homeworkId');
    currentStudentId = urlParams.get('studentId');
    
    if (currentHomeworkId) {
        // 编辑现有作业
        document.getElementById('pageTitle').textContent = '编辑作业';
        document.getElementById('editHomeworkTitle').textContent = '编辑作业';
        // 编辑时需要显示学生选择框
        setupStudentSelectionMode(true);
        loadHomeworkToEdit(currentHomeworkId);
    } else if (currentStudentId) {
        // 添加新作业 - 从学生列表点击进入，直接显示该学生信息
        document.getElementById('pageTitle').textContent = '添加作业';
        document.getElementById('editHomeworkTitle').textContent = '添加作业';
        
        // 隐藏学生选择框，显示学生信息
        setupStudentSelectionMode(false);
        
        // 设置当前学生ID到隐藏字段
        document.getElementById('editHomeworkStudentSelect').value = currentStudentId;
        
        // 加载学生信息
        loadStudentInfo(currentStudentId);
        
        // 确保加载作曲家列表
        loadComposers();
    } else {
        // 缺少必要参数，显示选择学生界面
        setupStudentSelectionMode(true);
        loadStudentsForSelection();
        // 确保加载作曲家列表
        loadComposers();
    }
});

// 设置学生选择模式
function setupStudentSelectionMode(enableSelection) {
    const studentSelectGroup = document.getElementById('studentSelectGroup');
    const studentInfoSection = document.getElementById('studentInfoSection');
    
    if (enableSelection) {
        // 显示学生选择框，隐藏学生信息显示
        studentSelectGroup.style.display = 'block';
        studentInfoSection.style.display = 'none';
    } else {
        // 隐藏学生选择框，显示学生信息
        studentSelectGroup.style.display = 'none';
        studentInfoSection.style.display = 'block';
    }
}

// 编辑作业
function editHomework(homeworkId, studentId) {
    if (homeworkId) {
        loadHomeworkToEdit(homeworkId);
    } else if (studentId) {
        document.getElementById('editHomeworkStudentSelect').value = studentId;
        loadStudentInfo(studentId);
    }
}

// 加载学生信息
function loadStudentInfo(studentId) {
    fetch(`/api/students/${studentId}`)
        .then(response => response.json())
        .then(student => {
            if (student.error) {
                document.getElementById('studentNameDisplay').innerHTML = `<span style="color: red;">加载失败: ${student.error}</span>`;
                return;
            }
            
            // 显示学生信息
            document.getElementById('studentNameDisplay').textContent = student.name || '未知学生';
            
            let detailsHtml = '';
            if (student.age) {
                detailsHtml += `🎂 年龄: ${student.age}岁<br>`;
            }
            if (student.grade) {
                detailsHtml += `🎓 年级: ${student.grade}<br>`;
            }
            if (student.instrument) {
                detailsHtml += `🎵 乐器: ${student.instrument}<br>`;
            }
            if (student.phone) {
                detailsHtml += `📞 联系电话: ${student.phone}`;
            }
            
            if (!detailsHtml) {
                detailsHtml = '暂无详细信息';
            }
            
            document.getElementById('studentDetailsDisplay').innerHTML = detailsHtml;
        })
        .catch(error => {
            console.error('获取学生信息失败:', error);
            document.getElementById('studentNameDisplay').innerHTML = '<span style="color: red;">加载失败</span>';
            document.getElementById('studentDetailsDisplay').innerHTML = '无法获取学生详细信息';
        });
}

// 加载学生列表供选择
function loadStudentsForSelection(selectedStudentId = null) {
    fetch('/api/students')
        .then(response => response.json())
        .then(students => {
            if (students.error) {
                alert('获取学生列表失败: ' + students.error);
                return;
            }
            
            const select = document.getElementById('editHomeworkStudentSelect');
            select.innerHTML = '<option value="">请选择学生</option>';
            
            students.forEach(student => {
                const option = document.createElement('option');
                option.value = student.id;
                option.textContent = `${student.name} (${student.grade || '未知年级'})`;
                select.appendChild(option);
            });
            
            // 如果有指定的学生ID，设置默认选中
            if (selectedStudentId) {
                select.value = selectedStudentId;
                loadStudentInfo(selectedStudentId);
            }
        })
        .catch(error => {
            console.error('获取学生列表失败:', error);
            alert('获取学生列表失败，请刷新页面重试');
        });
}

// 加载作业数据到编辑表单
function loadHomeworkToEdit(homeworkId) {
    fetch(`/api/homeworks/${homeworkId}`)
        .then(response => response.json())
        .then(homework => {
            if (homework.error) {
                alert('获取作业信息失败: ' + homework.error);
                return;
            }
            
            // 填充表单
            document.getElementById('editHomeworkId').value = homework.id;
            document.getElementById('editHomeworkTitleInput').value = homework.content || '';
            document.getElementById('editHomeworkDescriptionInput').value = homework.description || '';
            document.getElementById('editHomeworkStudentSelect').value = homework.student_id;
            document.getElementById('editHomeworkComposerSelect').value = homework.composer_id || '';
            
            // 加载学生信息
            if (homework.student_id) {
                loadStudentInfo(homework.student_id);
            }
            
            // 加载作曲家列表
            loadComposers();
            
            // 显示当前图片
            displayHomeworkImages(homework.images);
        })
        .catch(error => {
            console.error('获取作业信息失败:', error);
            alert('获取作业信息失败，请刷新页面重试');
        });
}

// 显示作业图片
function displayHomeworkImages(images) {
    const currentHomeworkImagesDiv = document.getElementById('currentHomeworkImagesDiv');
    const homeworkImagesList = document.getElementById('homeworkImagesList');
    
    if (images && images.length > 0) {
        let html = '<div class="homework-images-grid">';
        images.forEach((imageName, index) => {
            if (imageName.trim() !== '') {
                html += `<div class="homework-image-item">
                    <img src="/uploads/${imageName.trim()}" alt="作业图片${index + 1}">
                    <div class="homework-image-name">${imageName.trim()}</div>
                    <button onclick="removeHomeworkImage(${currentHomeworkId}, '${imageName.trim()}', this)" class="remove-homework-image-btn">删除</button>
                </div>`;
            }
        });
        html += '</div>';
        homeworkImagesList.innerHTML = html;
        currentHomeworkImagesDiv.style.display = 'block';
    } else {
        homeworkImagesList.innerHTML = '<p>无图片</p>';
        currentHomeworkImagesDiv.style.display = 'block';
    }
}

// 加载作曲家列表
function loadComposers() {
    fetch('/api/composers')
        .then(response => response.json())
        .then(composers => {
            if (composers.error) {
                alert('获取作曲家列表失败: ' + composers.error);
                return;
            }
            
            const select = document.getElementById('editHomeworkComposerSelect');
            select.innerHTML = '<option value="">请选择作曲家</option>';
            
            composers.forEach(composer => {
                const option = document.createElement('option');
                option.value = composer.id;
                option.textContent = composer.name;
                select.appendChild(option);
            });
        })
        .catch(error => {
            console.error('获取作曲家列表失败:', error);
        });
}

// 学生选择变化时加载学生信息
document.addEventListener('DOMContentLoaded', function() {
    const studentSelect = document.getElementById('editHomeworkStudentSelect');
    if (studentSelect) {
        studentSelect.addEventListener('change', function() {
            const studentId = this.value;
            if (studentId) {
                loadStudentInfo(studentId);
            } else {
                document.getElementById('studentNameDisplay').textContent = '';
                document.getElementById('studentDetailsDisplay').innerHTML = '';
            }
        });
    }
    
    // 添加图片选择事件监听器
    const imageInput = document.getElementById('editHomeworkImageInput');
    if (imageInput) {
        imageInput.addEventListener('change', function() {
            previewNewImages(this.files);
        });
    }
});

// 预览新上传的图片
function previewNewImages(files) {
    const previewDiv = document.getElementById('newImagesPreview');
    const previewList = document.getElementById('newImagesList');
    
    if (files && files.length > 0) {
        // 显示预览区域
        previewDiv.style.display = 'block';
        
        // 清空之前的预览
        previewList.innerHTML = '';
        
        // 遍历所有选中的文件
        Array.from(files).forEach((file, index) => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    // 创建图片预览元素
                    const imgContainer = document.createElement('div');
                    imgContainer.className = 'image-preview-container';
                    
                    imgContainer.innerHTML = `
                        <img src="${e.target.result}" alt="预览图片${index + 1}" class="detail-image-fullwidth" onclick="viewImage('${e.target.result}')">
                        <div class="image-info">文件名: ${file.name}</div>
                    `;
                    
                    previewList.appendChild(imgContainer);
                };
                
                reader.readAsDataURL(file);
            }
        });
    } else {
        // 没有文件时隐藏预览区域
        previewDiv.style.display = 'none';
        previewList.innerHTML = '';
    }
}

// 查看图片（与详情页面相同的函数）
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

// 添加新作业（从作业列表页面的按钮）
function addNewHomework() {
    if (currentStudentId) {
        window.location.href = `../edit-homework/edit-homework.html?studentId=${currentStudentId}`;
    } else {
        // 没有指定学生，显示学生选择
        loadStudentsForSelection();
    }
}

// 编辑当前作业（用于从作业详情页面返回）
function editCurrentHomework() {
    if (currentHomeworkId) {
        editHomework(currentHomeworkId);
    }
}

// 保存作业
function saveHomework() {
    const homeworkId = document.getElementById('editHomeworkId').value;
    const title = document.getElementById('editHomeworkTitleInput').value.trim();
    const description = document.getElementById('editHomeworkDescriptionInput').value.trim();
    const composerId = document.getElementById('editHomeworkComposerSelect').value;
    const imageInput = document.getElementById('editHomeworkImageInput');
    const files = imageInput.files;
    
    // 获取学生ID - 优先使用 currentStudentId（从学生列表点击进入），否则从选择框获取
    let studentId = currentStudentId;
    if (!studentId) {
        studentId = document.getElementById('editHomeworkStudentSelect').value;
    }
    
    // 表单验证
    if (!title) {
        alert('请输入作业标题');
        document.getElementById('editHomeworkTitleInput').focus();
        return;
    }
    
    if (!studentId) {
        alert('请选择学生');
        const studentSelect = document.getElementById('editHomeworkStudentSelect');
        if (studentSelect && studentSelect.style.display !== 'none') {
            studentSelect.focus();
        } else {
            alert('学生信息异常，请重新选择学生');
        }
        return;
    }
    
    // 确认对话框
    const confirmMessage = homeworkId ? '确定要更新这个作业吗？' : '确定要添加这个作业吗？';
    if (!confirm(confirmMessage)) {
        return;
    }
    
    // 显示保存中的状态
    const saveBtn = document.querySelector('.save-homework-btn');
    const originalText = saveBtn.textContent;
    saveBtn.textContent = '⏳ 保存中...';
    saveBtn.disabled = true;
    
    // 创建FormData对象
    const formData = new FormData();
    formData.append('content', title);
    formData.append('student_id', studentId);
    formData.append('description', description);
    if (composerId) {
        formData.append('composer_id', composerId);
    }
    
    // 如果是编辑模式，添加作业ID
    if (homeworkId) {
        formData.append('homework_id', homeworkId);
    }
    
    // 添加所有选择的图片文件
    if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
            formData.append('images', files[i]);
        }
    }
    
    const url = homeworkId ? `/api/homeworks/${homeworkId}` : '/api/homeworks';
    const method = homeworkId ? 'PUT' : 'POST'; // 新增使用POST，更新使用PUT
    
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
            alert(homeworkId ? '✅ 作业更新成功！' : '✅ 作业添加成功！');
            
            // 清除新上传图片预览
            const previewDiv = document.getElementById('newImagesPreview');
            const previewList = document.getElementById('newImagesList');
            const imageInput = document.getElementById('editHomeworkImageInput');
            
            if (previewDiv && previewList) {
                previewDiv.style.display = 'none';
                previewList.innerHTML = '';
            }
            
            if (imageInput) {
                imageInput.value = '';
            }
            
            // 返回作业列表页面
            const returnUrl = studentId ? 
                `/pages/student-homework-list/student-homework-list.html?studentId=${studentId}` : 
                '/pages/student-homework-list/student-homework-list.html';
            window.location.href = returnUrl;
        }
    })
    .catch(error => {
        // 恢复按钮状态
        saveBtn.textContent = originalText;
        saveBtn.disabled = false;
        
        console.error('保存作业失败:', error);
        alert('❌ 保存作业失败，请检查网络连接');
    });
}

// 删除作业图片
function removeHomeworkImage(homeworkId, imageName, buttonElement) {
    if (confirm('确定要删除这张图片吗？')) {
        fetch('/api/homeworks/' + homeworkId + '/images', {
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
                buttonElement.closest('.homework-image-item').remove();
                alert('图片已删除');
                
                // 如果没有图片了，隐藏图片区域
                const homeworkImagesList = document.getElementById('homeworkImagesList');
                if (homeworkImagesList.children.length === 0) {
                    homeworkImagesList.innerHTML = '<p>无图片</p>';
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
    if (pageNumber === 7) {
        // 返回到作业列表页面
        if (currentStudentId) {
            window.location.href = `/pages/student-homework-list/student-homework-list.html?studentId=${currentStudentId}`;
        } else {
            window.location.href = '/pages/student-homework-list/student-homework-list.html';
        }
    } else {
        alert('请使用返回按钮');
    }
}