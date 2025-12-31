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
        // 编辑时学生信息从作业数据中获取
        setupStudentSelectionMode(false);
        loadHomeworkToEdit(currentHomeworkId);
    } else if (currentStudentId) {
        // 添加新作业 - 从学生列表点击进入，直接显示该学生信息
        document.getElementById('pageTitle').textContent = '添加作业';
        document.getElementById('editHomeworkTitle').textContent = '添加作业';
        
        // 显示学生信息
        setupStudentSelectionMode(false);
        
        // 设置当前学生ID到隐藏字段
        document.getElementById('editHomeworkStudentId').value = currentStudentId;
        
        // 加载学生信息
        loadStudentInfo(currentStudentId);
        
        // 确保加载作曲家列表
        loadComposers();
    } else {
        // 缺少必要参数，返回学生作业列表
        alert('缺少必要参数，请从学生列表进入');
        window.location.href = '/pages/student-homework-list/student-homework-list.html';
        return;
    }
    
    // 设置作曲家选择变化事件
    const composerSelect = document.getElementById('editHomeworkComposerSelect');
    if (composerSelect) {
        composerSelect.addEventListener('change', function() {
            const composerId = this.value;
            loadWorks(composerId);
        });
    }
});

// 设置学生选择模式
function setupStudentSelectionMode(enableSelection) {
    const studentInfoSection = document.getElementById('studentInfoSection');
    
    if (enableSelection) {
        // 隐藏学生信息显示
        studentInfoSection.style.display = 'none';
    } else {
        // 显示学生信息
        studentInfoSection.style.display = 'block';
    }
}

// 编辑作业
function editHomework(homeworkId, studentId) {
    if (homeworkId) {
        loadHomeworkToEdit(homeworkId);
    } else if (studentId) {
        document.getElementById('editHomeworkStudentId').value = studentId;
        loadStudentInfo(studentId);
    }
}

// 加载学生信息
function loadStudentInfo(studentId) {
    console.log('开始加载学生信息, studentId:', studentId);
    
    if (!studentId) {
        console.error('studentId为空');
        document.getElementById('studentNameDisplay').textContent = '未选择学生';
        return;
    }
    
    fetch(`/api/students/${studentId}`)
        .then(response => {
            console.log('API响应状态:', response.status);
            return response.json();
        })
        .then(student => {
            console.log('获取到的学生数据:', student);
            
            if (student.error) {
                console.error('API返回错误:', student.error);
                document.getElementById('studentNameDisplay').innerHTML = `<span style="color: white;">加载失败: ${student.error}</span>`;
                return;
            }
            
            // 显示学生信息
            const studentNameDisplay = document.getElementById('studentNameDisplay');
            if (studentNameDisplay) {
                studentNameDisplay.textContent = student.name || '未知学生';
                console.log('学生姓名已设置:', student.name);
            } else {
                console.error('找不到studentNameDisplay元素');
            }
        })
        .catch(error => {
            console.error('获取学生信息失败:', error);
            const studentNameDisplay = document.getElementById('studentNameDisplay');
            if (studentNameDisplay) {
                studentNameDisplay.innerHTML = '<span style="color: white;">加载失败</span>';
            }
        });
}

// 加载学生列表供选择
function loadStudentsForSelection(selectedStudentId = null) {
    // 学生选择功能已移除，此函数保留以避免错误
    console.log('学生选择功能已移除');
}

// 加载作曲家列表
function loadComposers() {
    return fetch('/api/composers')
        .then(response => response.json())
        .then(composers => {
            if (composers.error) {
                console.error('获取作曲家列表失败:', composers.error);
                return Promise.reject(composers.error);
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
            throw error;
        });
}

// 加载作品列表
function loadWorks(composerId) {
    const workSelect = document.getElementById('editHomeworkWorkSelect');
    
    if (!composerId) {
        // 没有选择作曲家，清空作品列表
        workSelect.innerHTML = '<option value="">请先选择作曲家</option>';
        return Promise.resolve();
    }
    
    return fetch(`/api/composers/${composerId}/works`)
        .then(response => response.json())
        .then(works => {
            if (works.error) {
                console.error('获取作品列表失败:', works.error);
                workSelect.innerHTML = '<option value="">加载失败</option>';
                return;
            }
            
            workSelect.innerHTML = '<option value="">请选择作品</option>';
            
            if (works && works.length > 0) {
                works.forEach(work => {
                    const option = document.createElement('option');
                    option.value = work.id;
                    option.textContent = work.title;
                    workSelect.appendChild(option);
                });
            } else {
                workSelect.innerHTML = '<option value="">该作曲家暂无作品</option>';
            }
        })
        .catch(error => {
            console.error('获取作品列表失败:', error);
            workSelect.innerHTML = '<option value="">加载失败</option>';
        });
}

// 加载作业数据到编辑表单
function loadHomeworkToEdit(homeworkId) {
    fetch(`/api/homeworks/${homeworkId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(homework => {
            if (homework.error) {
                throw new Error('获取作业信息失败: ' + homework.error);
            }
            
            // 填充表单
            document.getElementById('editHomeworkId').value = homework.id;
            document.getElementById('editHomeworkTitleInput').value = homework.content || '';
            document.getElementById('editHomeworkDescriptionInput').value = homework.description || '';
            document.getElementById('editHomeworkStudentId').value = homework.student_id;
            
            // 加载作曲家列表
            loadComposers().then(() => {
                // 设置作曲家选择
                if (homework.composer_id) {
                    document.getElementById('editHomeworkComposerSelect').value = homework.composer_id;
                    // 加载该作曲家的作品
                    loadWorks(homework.composer_id).then(() => {
                        // 设置作品选择
                        if (homework.work_id) {
                            document.getElementById('editHomeworkWorkSelect').value = homework.work_id;
                        }
                    });
                }
            });
            
            // 加载学生信息
            if (homework.student_id) {
                loadStudentInfo(homework.student_id);
            }
            
            // 显示当前图片
            displayHomeworkImages(homework.images);
        })
        .catch(error => {
            console.error('获取作业信息失败:', error);
            alert('获取作业信息失败: ' + error.message + '，请刷新页面重试');
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

// 学生选择变化时加载学生信息
// 学生选择功能已移除，此事件监听器已移除

// 添加图片选择事件监听器
document.addEventListener('DOMContentLoaded', function() {
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
    const imageInput = document.getElementById('editHomeworkImageInput');
    const files = imageInput.files;
    const composerId = document.getElementById('editHomeworkComposerSelect').value;
    const workId = document.getElementById('editHomeworkWorkSelect').value;
    
    // 获取学生ID - 从隐藏字段获取
    let studentId = document.getElementById('editHomeworkStudentId').value;
    
    // 表单验证
    if (!title) {
        alert('请输入作业标题');
        document.getElementById('editHomeworkTitleInput').focus();
        return;
    }
    
    if (!studentId) {
        alert('学生信息异常，请重新选择学生');
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
    
    // 添加作曲家和作品信息
    if (composerId) {
        formData.append('composer_id', composerId);
    }
    if (workId) {
        formData.append('work_id', workId);
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