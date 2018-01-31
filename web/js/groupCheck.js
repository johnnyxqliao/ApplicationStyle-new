function groupCheck(domain) {
    var userData = null;
    //根据用户权限、群组以及app名进行项目管理
    $.ajax({
        url: "/projectManager/api/v1/project",
        type: "get",
        //群组ID
        data: {
            "appName": appName,
            "domain": domain
        },
        success: function (result) {
            if (result.state) {
                userData = result.content;
                var userArr = [];
                result.content.forEach(function (value) {
                    if (userArr.indexOf(value.username) === -1) {
                        userArr.push(value.username);
                        $('ul.dropdown-menu.user').append('<li><a>' + value.username + '</a></li>');
                    }
                });
                $('ul.dropdown-menu.user').append('<li class="divider"></li>');
                $('ul.dropdown-menu.user').append('<li> <a>所有项目</a> </li>');
                //将用户名添加到下拉菜单中
                $('ul.dropdown-menu.user li').click(function () {//为每个用户名绑定点击事件
                    $('#userManage').html('<span class="glyphicon glyphicon-user"></span>'+$(this).text()+'<i class="ace-icon fa fa-angle-down icon-on-right"></i>');
                    loadUserTable($(this).text());
                });
            } else {
                //请求错误
                console.log(result.error);
            }
        }
    });

//点击事件
    function loadUserTable(user) {
        var totalRows = $('#dynamic-table').DataTable().page.info().recordsTotal;
        for (var i = totalRows - 1; i > 0 || i === 0; i--) {//清空表格
            $('#dynamic-table').DataTable().row(i).remove().draw(false);
        }
        //添加数据
        if (user === " 所有项目 ") {
            userData.forEach(function (value) {
                $('#dynamic-table').DataTable().row.add(value).draw(false);
            });
        } else {
            userData.forEach(function (value) {
                if (value.username === user) {//添加表格
                    $('#dynamic-table').DataTable().row.add(value).draw(false);
                }
            });
        }

    }
}
