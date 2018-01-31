var projectId = 0;//初始化项目Id
var projectName;
var appResult = null;//word报告
var content = document.querySelector('#frame').import;//页面内容初始化
// var appName = $('.showAppNameDiv').html();
var appName = "demo";//将demo改为app名称，与数据库中表名字一致
var userDomain = null;
var USER_NAME = null;
var tableInitPara = {
    language: {//表格汉化
        "sProcessing": "处理中...",
        "sLengthMenu": "显示 _MENU_ 项结果",
        "sZeroRecords": "没有匹配结果",
        "sInfo": "显示第 _START_ 至 _END_ 项结果，共 _TOTAL_ 项",
        "sInfoEmpty": "显示第 0 至 0 项结果，共 0 项",
        "sInfoFiltered": "(由 _MAX_ 项结果过滤)",
        "sInfoPostFix": "",
        "sSearch": "搜索:",
        "sUrl": "",
        "sEmptyTable": "表中数据为空",
        "sLoadingRecords": "载入中...",
        "sInfoThousands": ",",
        "oPaginate": {
            "sFirst": "首页",
            "sPrevious": "上页",
            "sNext": "下页",
            "sLast": "末页"
        },
        "oAria": {
            "sSortAscending": ": 以升序排列此列",
            "sSortDescending": ": 以降序排列此列"
        }
    },
    "order": [[2, "desc"]],//按照序号进行排列
    "ajax": {//请求数据库
        "url": "/projectManager/api/v1/project",
        "data": {
            "appName": appName
        },
        "dataType": "json",
        "type": "get",
        "dataSrc": function (json) {//获取返回数据，数据中不只是有data，还包括状态等信息
            return json.content;
        },
        "error": function (XMLHttpRequest, textStatus, errorThrown) {
            console.log("XMLHttpRequest请求状态码：" + XMLHttpRequest.status);
            console.log("XMLHttpRequest状态码：" + XMLHttpRequest.readyState);
            console.log("textStatus是：" + textStatus);
            console.log("errorThrown是：" + errorThrown);
        }
    },
    "columns":
         [
             {"data": "id"},
             {"data": "username"},
             {"data": "projectName"},
             {"render": timeInit},//初始化时间
             {"data": "memo"},
             {"render": addButtonId}//初始化按钮
         ],
    "columnDefs": [
        {
            "targets": [1],
            "visible": false
        }
    ]
};
// 页面初始化
$(document).ready(function () {
    //加载导航栏、侧边栏、底的div（不要删除）
    $("#navbarDiv").html(content.querySelector("#navbarHtml").innerHTML);
    $("#copyRightDiv").html(content.querySelector("#copyRightHtml").innerHTML);
    $("#modalFrameDiv").html(content.querySelector("#modalFrameHtml").innerHTML);
    $("#wordEditDiv").html(content.querySelector("#wordEditHtml").innerHTML);
    $("#sidebarDiv").html(content.querySelector("#sidebarHtml").innerHTML);
    $("#breadcrumbs").html(content.querySelector("#breadcrumbsHtml").innerHTML);

    //加载项目管理、功能界面、帮助页面（word编辑区已经被加载）
    var local = document.querySelector('#local').import;
    $("#projectManagementDiv").html(local.querySelector("#projectManagementHtml").innerHTML);//主功能界面
    $("#mainFunctionDiv").html(local.querySelector("#mainFunctionHtml").innerHTML);//主功能界面
    $("#helpDiv").html(local.querySelector("#helpHtml").innerHTML);//帮助模块
    getUserInfo();//获取用户信息
    getTempProjectID();//获取模板Id
});

//获取用户信息
function getUserInfo() {
    $.ajax({
        url: '.login',
        mehtod: 'get',
        data: {
            "rq": "getUserInfo"
        },
        success: function (data) {
            if (data.state === false) {//匿名用户
                $('#projectManagementDiv,#wordEditDiv,#projectManagementBar,#wordEditBar,#saveProject,.showProjectNameDiv,#userManage').css('display', 'none');
                $($('ul.nav.nav-list li')[1]).addClass('active');//激活功能界面侧边栏
                $('#mainFunctionDiv').addClass('active');//激活功能界面
                $($('ul.nav.nav-list li a')[1]).css('pointer-events', 'auto');//解开鼠标点击事件
                $("#userName").html("游客");
                $("#userDropDown").html('<li><a href="#" onclick="gotoLogin()"><i class="icon-key"></i>登录</a></li><li><a href="#" onclick="gotoRegister()"><i class="icon-plus"></i>注册</a></li>')
            }
            else {//登录用户
                USER_NAME = data.username;
                userDomain = data.domain;
                if (data.permission !== 'user') {//群组权限
                    delete tableInitPara.columnDefs;//表格显示用户名
                    $('#buttonNew,#mainFunctionBar,#mainFunctionHtml').css('display', 'none');//不能新建项目
                    groupCheck(data.domain);
                } else {//普通用户权限
                    $('#userManage').css('display', 'none');
                }
                tableInit();//初始化表格
                $("#userName").html(data.username);
                $("#userDropDown").html(' <li><a href="#" onclick="gotoUserInfo()"><i class="icon-user"></i> 个人资料</a></li><li class="divider"></li><li><a href="#" onclick="logout()" style="cursor:pointer;"><i class="icon-off"></i> 退出</a></li>');
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            console.log("XMLHttpRequest请求状态码：" + XMLHttpRequest.status);
            console.log("XMLHttpRequest状态码：" + XMLHttpRequest.readyState);
            console.log("textStatus是：" + textStatus);
            console.log("errorThrown是：" + errorThrown);
        }
    })
}

// 表格初始化
function tableInit() {
    //初始化表格
    $('#dynamic-table').DataTable(tableInitPara);
    // 将数据按照顺序进行排列，序号不是项目的真实id
    $('#dynamic-table').DataTable().on('order.dt search.dt', function () {
        $('#dynamic-table').DataTable().column(0, {
            search: 'applied',
            order: 'applied'
        }).nodes().each(function (cell, i) {
            cell.innerHTML = i + 1;
        });
    }).draw();
}

// 按钮初始化函数
function addButtonId(data, type, row, meta) {
    return '  <div class="hidden-sm hidden-xs action-buttons">\n' +
         '    <a class="btn btn-xs btn-info">\n' +
         '      <i class="ace-icon fa fa-eye bigger-120" id="checkButton" onclick="checkProject(' + row.id + ')">查看</i>\n' +
         '    </a>\n' +
         '\n' +
         '    <a class="btn btn-xs btn-danger">\n' +
         '      <i class="ace-icon fa fa-trash-o bigger-120" id="deleteButton" onclick="removeProject(' + row.id + ')">删除</i>\n' +
         '    </a>\n' +
         '  </div>' +
         '  <div class="hidden-md hidden-lg">\n' +
         '    <div class="inline pos-rel">\n' +
         '      <button class="btn btn-minier btn-yellow dropdown-toggle" data-toggle="dropdown" data-position="auto">\n' +
         '        <i class="ace-icon fa fa-caret-down icon-only bigger-120"></i>\n' +
         '      </button>\n' +
         '\n' +
         '      <ul class="dropdown-menu dropdown-only-icon dropdown-yellow dropdown-menu-right dropdown-caret dropdown-close">\n' +
         '        <li>\n' +
         '          <a  class="tooltip-info" data-rel="tooltip" title="View">\n' +
         '            <span class="blue">\n' +
         '              <i class="ace-icon fa fa-search-plus bigger-120" id="checkButton" onclick="checkProject(' + row.id + ')"></i>\n' +
         '            </span>\n' +
         '          </a>\n' +
         '        </li>\n' +
         '\n' +
         '        <li>\n' +
         '          <a class="tooltip-error" data-rel="tooltip" title="Delete">\n' +
         '            <span class="red">\n' +
         '              <i class="ace-icon fa fa-trash-o bigger-120" id="deleteButton" onclick="removeProject(' + row.id + ')"></i>\n' +
         '            </span>\n' +
         '          </a>\n' +
         '        </li>\n' +
         '      </ul>\n' +
         '    </div>\n' +
         '  </div>';
}

//时间初始化函数
function timeInit(data, type, row, meta) {
    var oDate = new Date(row.createDate);
    return oDate.toLocaleDateString() + ',' + oDate.getHours() + ':' + oDate.getMinutes();
}

//删除项目
function removeProject(index) {
    var target = window.event.target;
    if (confirm("项目删除后将无法恢复，确认要删除吗？")) {
        //数据库删除相关记录
        $.ajax({
            url: "/projectManager/api/v1/project",
            type: "delete",
            data: {
                "id": index,
                "appName": appName
            },
            success: function (result) {
                if (result.state) {
                    console.log("删除成功");
                    $('#dynamic-table').DataTable().row($(target).parents("tr")).remove().draw(false);
                    $('#deleteProject').modal('hide');
                } else {
                    console.log(result.error);
                }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                console.log("XMLHttpRequest请求状态码：" + XMLHttpRequest.status);
                console.log("XMLHttpRequest状态码：" + XMLHttpRequest.readyState);
                console.log("textStatus是：" + textStatus);
                console.log("errorThrown是：" + errorThrown);
            }
        })
    }
}

// 添加项目函数
function addProject() {
    // 获取输入框中的内容
    var projectName = $('#projectNameModal')[0].value;
    var createDate = new Date().toLocaleDateString() + ',' + new Date().getHours() + ':' + new Date().getMinutes();
    var memo = $('#projectRemarkModal')[0].value;
    var data = {
        "appName": appName,
        "id": 0,
        "createDate": createDate,
        "projectName": projectName,
        "memo": memo,
        "appResult": appResult,
        "tempProjectID": tempProjectID
    };

    //表格添加数据
    if (projectName === '') {
        alert("请输入项目名！！！");
    } else {
        // 添加数据库
        $.ajax({
            type: "post",
            url: "/projectManager/api/v1/project",
            data: data,
            success: function (result) {
                if (result.state) {
                    alert("项目添加成功，继续进行下一步操作吧");
                    data['id'] = result.content.id;//修改数据ID，将该项目的主键id和按钮绑定起来
                    data['username'] = USER_NAME;//修改数据ID，将该项目的主键id和按钮绑定起来
                    $('#dynamic-table').DataTable().row.add(data).draw(false);
                } else {
                    console.log(result.error);
                }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                console.log("XMLHttpRequest请求状态码：" + XMLHttpRequest.status);
                console.log("XMLHttpRequest状态码：" + XMLHttpRequest.readyState);
                console.log("textStatus是：" + textStatus);
                console.log("errorThrown是：" + errorThrown);
            }
        });
        $('#newProjectModal').modal('hide');
        // 在前台添加表格
    }
}

// 查看项目
function checkProject(index) {

    projectId = index;
    $('.showProjectNameDiv').html($(window.event.target).parents("tr")[0].children[1].innerHTML);//面包屑显示项目名
    $($('ul.nav.nav-list li a')[1]).css('pointer-events', 'auto');
    //数据库查看项目
    $.ajax({
        url: "/projectManager/api/v1/project",
        type: "get",
        data: {
            "appName": appName,
            "id": projectId
        },
        success: function (result) {
            if (userDomain == null) {//普通用户
                $($('ul.nav.nav-list li a')[1]).click();
            } else {//群组用户
                $($('ul.nav.nav-list li a')[2]).click();
                editor.append(result.content.appResult);
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            console.log("XMLHttpRequest请求状态码：" + XMLHttpRequest.status);
            console.log("XMLHttpRequest状态码：" + XMLHttpRequest.readyState);
            console.log("textStatus是：" + textStatus);
            console.log("errorThrown是：" + errorThrown);
        }
    })
}

//word编辑区高度屏幕自适应
$(window).resize(function () {
    wordAdapt();
});

function wordAdapt() {
    var height = $(window).get(0).innerHeight;
    $('#wordEditDiv').css("height", height - 220);
    $('#WYeditor').css("height", height - 220);
}