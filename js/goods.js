var editId = undefined;
var datagrid;
var pipingLevel;
var goodsType;
var Address = [{"value": "1", "text": "CHINA"}, {"value": "2", "text": "USA"}, {
    "value": "3",
    "text": "Koren"
}];
$(function () {
    $.ajax({
        url: selGoodsType,
        type: "POST",
        dataType: "json",
        success: function (dataResult) {
            if (dataResult.code == "0000") {
                var reg = /name/g;
                var reg1 = /id/g;
                goodsType = dataResult.data;
                pipingLevel = dataResult.data;
                goodsType = goodsType.replace(reg, 'text');
                pipingLevel = goodsType.replace(reg1, 'value');
                goodsType = JSON.parse(goodsType);
                pipingLevel = JSON.parse(pipingLevel);
                query();
                $('#cc2').combotree({
                    prompt: '商品分类',
                    onChange: function (newValue, oldValue) {
                        $("#dataGrid").datagrid("load");
                    }
                });
                $('#cc2').combotree('loadData', goodsType);
            }
        }
    });

})

function query() {
    datagrid = $("#dataGrid").datagrid({
        rownumbers: true,//第一列显示序号
        fitColumns: true,//列宽按比例扩展到最大
        collapsible: true,
        singleSelect: true,
        pagination: true,//表示在datagrid设置分页
        idField: 'code',
        loader: function (param, success, error) {
            if ($("#ty").val() == undefined || $("#ty").val() == "A") {
                param["status"] = "";
            } else {
                param["status"] = $("#ty").val();
            }
            $.ajax({
                type: 'POST',
                url: selGoods,
                dataType: 'json',
                // data:{status:"12", dtTitle1: ""},
                contentType: 'application/json;charset=utf-8', // 设置请求头信息
                data: JSON.stringify(param),
                success: function (result) {
                    typeFilt($("#ty").val());//表头类型下拉框
                    if (result.code = '0000') {
                        success(JSON.parse(result.data));
                    } else {
                        $.messager.show({
                            title: '提示',
                            msg: '查询失败.',
                            timeout: 2000,
                            showType: 'slide'
                        });
                    }
                }
            });
        },
        reload: function () {
            alert("reload");
        },
        columns: [[
            {field: 'code', title: '编号', width: '5%', algin: 'center'},
            {
                field: 'typeName', title: '所属分类', width: '10%', align: 'center', editor: 'text',
                editor: {
                    type: 'combotree',
                    // options: {data: Address, valueField: "value", textField: "text"}
                    options: {
                        // data: [{"value": 1, "text": "1231"}],
                        data: pipingLevel,
                        valueField: "value",
                        textField: "text"
                    }
                }
            },
            {field: 'goodName', title: '商品名称', width: '10%', algin: 'center', editor: 'text'},
            {field: 'goodDesc', title: '商品描述', width: '20%', algin: 'center'},
            {field: 'goodKey', title: '关键字', width: '20%', algin: 'center'},
            {field: 'costPrice', title: '进价(元)', width: '5%', algin: 'center'},
            {field: 'groupPrice', title: '团购价(元)', width: '5%', algin: 'center'},
            {field: 'singlePrice', title: '零售价(元)', width: '5%', algin: 'center'},
            {field: 'proxyPrice', title: '代理价(元)', width: '5%', algin: 'center'},
            {
                field: 'status', title: '状态', algin: 'center',
                formatter: function (value, rowData, rowIndex) {
                    if (value == 'Y') {
                        return "上架";
                    }
                    return "下架";
                },
            }
        ]],
        toolbar: [{
            id: 'btnAdd',
            text: "添加",
            iconCls: 'icon-add',
            handler: function () {
                // if (editId != undefined) {
                //
                //     $("#Student_Table").datagrid('endEdit', editId);
                //
                // }

                // if (editId == undefined) {

                $("#dataGrid").datagrid('insertRow', {
                    index: 0,
                    row: {}
                });
                $('#dataGrid').datagrid("beginEdit", 0);

                // $("#Student_Table").datagrid('beginEdit', 0);
                //
                // editId = 0;

                // }

            }
        }, '-', {
            id: 'btnAdd',
            text: "保存",
            iconCls: 'icon-save',
            handler: function () {
                // $("#winAdd").window("open");
                editId = undefined;
                $("#dataGrid").datagrid("load");
            }
        }, '-', {
            id: 'btnEdit',
            text: "修改",
            iconCls: 'icon-edit',
            handler: function () {
                if (editId != undefined) {
                    var selRow = $('#dataGrid').datagrid("getSelected");
                    if (editId == datagrid.datagrid("getRowIndex", selRow)) {
                        return;
                    }
                    $.messager.confirm('温馨提示', '是否保存修改', function (r) {
                        if (r)//选择确定或者OK
                        {

                        } else {

                        }
                        editId = undefined;
                        $("#dataGrid").datagrid("load");
                    })
                } else {
                    var selRow = $('#dataGrid').datagrid("getSelected");
                    if (selRow != undefined) {
                        editId = datagrid.datagrid("getRowIndex", selRow);
                        $('#dataGrid').datagrid("beginEdit", editId);
                    } else {
                        $.messager.show({
                            title: '提示',
                            msg: '点我干嘛.',
                            timeout: 2000,
                            showType: 'slide'
                        });
                    }
                }
            }
        }, '-', {
            text: '取消编辑',
            iconCls: 'icon-undo',
            handler: function () {
                if (editId == undefined) {
                    $.messager.show({
                        title: '提示',
                        msg: '不许点我',
                        timeout: 2000,
                        showType: 'slide'
                    });
                    return;
                }
                editId = undefined;
                $("#dataGrid").datagrid("load");
            }
        }, '-', {
            id: 'search',
            text: '搜索',
            iconCls: 'icon-search',

            handler: function () {
                alert('cut')
            }
        }, {
            text: '<input type="text" id="id" placeholder="编号"/><input type="text" id="userAccount" placeholder="名称"/><input type="text" id="identityNum" placeholder="关键字"/>'
        }
        ],

        view: detailview,
        detailFormatter: function (rowIndex, rowData) {
            var str = '<table id="pictable' + rowIndex + '">' +
                '<tr>' +
                '<td rowspan=2 style="border:0">' +
                '<div>' +
                '<input id="idFile" style="width:224px" runat="server" name="pic" onchange="javascript:setImagePreview(this,localImag,preview);" type="file" />' +
                '</div>' +
                '<div id="localImag">' +
                '<img id="preview" alt="预览图片" onclick="over(preview,divImage,imgbig);"style="width: 400px; height: 50px;"/>' +
                '</div>' +
                '上传图片（支持后缀为gif，jpeg，png，jpg，bmp等格式的图片）:' +
                '<p><a class="button" href="javascript:void(0);"><span>上传图片</span></a></p>' +
                '</td>' +
                '</tr>' +
                '</table>';
            return str;
        },
        onExpandRow: function (index, row) {
            $("#pictable" + index + " tr:eq(0)").append(
                "<td rowspan=2 style=\"border:0\"><img src=\"images/' + rowData.pic1Path + '.png\" style=\"height:50px;\"><p><a class=\"button\" href=\"javascript:void(0);\"><span>删除</span></a></p></td>" +
                "<td rowspan=2 style=\"border:0\"><img src=\"images/' + rowData.pic1Path + '.png\" style=\"height:50px;\"><p><a class=\"button\" href=\"javascript:void(0);\"><span>删除</span></a></p></td>"
            );
        }
    });
    $('#cc2').appendTo('.datagrid-toolbar  tbody tr');

    function typeFilt(status) {
        var title = $('.datagrid-header-row td[field="status"] span');//素材类型列头标签
        var combobox = '<select name="type" id="ty" class ="easyui-combobox seleInput" style =" padding :2px;width : 100%;">'
            + '<option value="A"'
            + (status == "A" ? 'selected="true"' : '')
            + '>商品状态（全部）</option>'
            + '<option value="Y" '
            + (status == "Y" ? 'selected="true"' : '')
            + ' >商品状态（上架)</option>'
            + '<option value="N" '
            + (status == 'N' ? 'selected="true"' : '')
            + '>商品状态（下架)</option>'
            + '</select>';
        title.html(combobox);
        $('#ty').combobox({
            panelHeight: 'auto',
            editable: false,
            onChange: function (newValue, oldValue) {
                $("#dataGrid").datagrid("load");
            }
        });
    }


}
