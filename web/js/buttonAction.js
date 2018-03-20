var projectId = 0;//项目Id
var projectName;//项目名
var appResult = null;//word报告
var appName = "demo";//将demo改为app名称，与数据库中表名字一致（必填）
var appNameChinese = '创新方法APP';//app中文名（必填）
var USER_NAME = '';//当前登录用户名
console.log("模板层Id为：" + tempProjectID);//当前模板项目ID

// 主功能区和使用帮助
$(document).ready(function () {
    //加载功能界面、帮助页面（word编辑区已经被加载）
    var local = document.querySelector('#local').import;
    $("#mainFunctionDiv").html(local.querySelector("#mainFunctionHtml").innerHTML);//主功能界面
    $("#helpModalBody").prepend(local.querySelector("#helpHtml").innerHTML);//帮助模块
});

//删除项目
function removeProject(index) {
    var target = window.event.target;
    if (confirm("项目删除后将无法恢复，确认要删除吗？")) {
        $.ajax({
            url: "/projectManager/api/v1/project",
            type: "delete",
            data: {
                "id": index,
                "appName": appName
            },
            success: function (result) {
                if (result.state) {
                    if (target.id === 'deleteButton') {
                        $('#dynamic-table').DataTable().row($(target).parents("tr")).remove().draw(false);
                    } else {
                        $(target).parents('li')[0].remove();
                    }
                    location.reload();
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
                    location.reload();
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
    checkBasic();
    //数据库查看项目
    $.ajax({
        url: "/projectManager/api/v1/project",
        type: "get",
        data: {
            "appName": appName,
            "id": projectId
        },
        success: function (result) {
            if (result.state) {
                //将项目数据加载到主功能区
                /*
                * your code.......
                **/
                var oDate = new Date(result.content.createDate);
                var createTime = oDate.toLocaleDateString() + ',' + oDate.getHours() + ':' + oDate.getMinutes();
                $('#timeModal').html(createTime);//创建时间
                $('#remarkModal').html(result.content.memo);//项目备注
                $('#ProjectNameModal').html(result.content.projectName);//项目名
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

//获得内容
function getWordContext() {
    //设置后台请求响应
    var saveURL = "saveResultReport";
    var contextData = $("#WYeditor").html();
    // alert(contextData);
    $.ajax({
        type: 'POST',
        url: saveURL,
        dataType: "json",
        data: {"contextData": contextData},
        success: function () {
            alert('保存成功');
        }
    });
}

//定制初始化内容
function setCustomContext() {
    var title = "**App分析结果";
    var chap1 = "*******";
    var chap2 = "*******";
    var chap3 = "结论****";

    var img1 = $("#imageId");  //选择页面中的img元素

    title = "<h2>1 " + title + "</h2>";
    chap1 = "<h3>1.1 " + chap1 + "</h3>";
    chap2 = "<h3>1.2 " + chap2 + "</h3>";
    chap3 = "<h3>1.3 " + chap3 + "</h3>";
    var editor = $("#WYeditor");
    editor.append(title, chap1, chap2, chap3);
    editor.append(img1); //在指定位置插入图片
}