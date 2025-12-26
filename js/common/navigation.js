// 通用导航功能

// 页面加载完成后初始化导航
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
});

// 初始化导航功能
function initializeNavigation() {
    // 获取当前页面路径
    const currentPath = window.location.pathname;
    
    // 清除所有按钮的活动状态
    const allNavButtons = document.querySelectorAll('.top-nav-btn');
    allNavButtons.forEach(btn => btn.classList.remove('active'));
    
    // 根据当前路径设置活动状态
    if (currentPath === '/' || currentPath === '/main.html') {
        // 首页
        const homeBtn = document.querySelector('.top-nav-btn[data-page="home"]');
        if (homeBtn) homeBtn.classList.add('active');
    } else if (currentPath.includes('student-homework-list')) {
        // 学生作业列表
        const homeworkBtn = document.querySelector('.top-nav-btn[data-page="student-homework"]');
        if (homeworkBtn) homeworkBtn.classList.add('active');
    } else if (currentPath.includes('student-management')) {
        // 学生管理
        const studentBtn = document.querySelector('.top-nav-btn[data-page="student-management"]');
        if (studentBtn) studentBtn.classList.add('active');
    } else if (currentPath.includes('composer-management')) {
        // 作曲家管理
        const composerBtn = document.querySelector('.top-nav-btn[data-page="composer-management"]');
        if (composerBtn) composerBtn.classList.add('active');
    } else if (currentPath.includes('composer-works')) {
        // 所有作品
        const worksBtn = document.querySelector('.top-nav-btn[data-page="composer-works"]');
        if (worksBtn) worksBtn.classList.add('active');
    }
}

// 导航到指定页面
function navigateToPage(pageName) {
    const pagePaths = {
        'home': '/',
        'student-homework': '/pages/student-homework-list/student-homework-list.html',
        'student-management': '/pages/student-management/student-management.html',
        'composer-management': '/pages/composer-management/composer-management.html',
        'composer-works': '/pages/composer-works/composer-works.html'
    };
    
    const pagePath = pagePaths[pageName];
    if (pagePath) {
        window.location.href = pagePath;
    } else {
        console.error('页面路径不存在:', pageName);
    }
}

// 获取当前页面标识
function getCurrentPage() {
    const currentPath = window.location.pathname;
    
    if (currentPath === '/' || currentPath === '/main.html') {
        return 'home';
    } else if (currentPath.includes('student-homework-list')) {
        return 'student-homework';
    } else if (currentPath.includes('student-management')) {
        return 'student-management';
    } else if (currentPath.includes('composer-management')) {
        return 'composer-management';
    } else if (currentPath.includes('composer-works')) {
        return 'composer-works';
    }
    
    return 'unknown';
}