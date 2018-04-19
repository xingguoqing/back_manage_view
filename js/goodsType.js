$(function () {
    query();
})

function query() {
    $('#tg').treegrid({
        url: selGoodsType,
        idField: 'id',
        treeField: 'name',
        rownumbers: true,//第一列显示序号
        fitColumns: true,//列宽按比例扩展到最大  ·
        onDblClickRow: function (row) {
            edit()
        },
        onClickRow: function () {
            click();
        },
        onLoadSuccess: function (row) {
            //$(this).treegrid('enableDnd', row?row.id:null);  
            //上面的代码是demo中的，但是对于要保存更改到数据库显然走不通，需要向其他办法
            //启用拖动排序
            rowLength = $("#tg").datagrid("getRows").length;
            enableDnd($('#tg'));
        },
        columns: [[
            {
                field: 'name',
                title: '分类名称',
                width: 100,
                align: 'left',
                halign: 'center',
                editor: "text"
            },
            {field: 'bz', title: '备注', width: 100, align: 'center', editor: "text"}
            // {field:'icon',title:'icon',width:160,align:'center',editor:"text"},
            // {field:'seq',title:'seq',width:160,align:'center',editor:"numberbox" }  
        ]],
        toolbar: [
            {
                text: '添加一级分类', iconCls: 'icon-add', handler: function () {
                appendMain();
            }
            }, '-',
            {
                text: '添加子分类', iconCls: 'icon-add', handler: function () {
                append();
            }
            }, '-',
            // {
            //     text: '删除', iconCls: 'icon-remove', handler: function () {
            //     remove();
            // }
            // }, '-',
            // { text: '编辑', iconCls: 'icon-edit', handler: function () {
            //     edit();
            //   }
            // }, '-',
            // {
            //     text: '保存', iconCls: 'icon-save', handler: function () {
            //     save();
            // }
            // }, '-',
            {
                text: '取消编辑', iconCls: 'icon-undo', handler: function () {
                cancelEdit();
            }
            }, '-',
            {
                text: '刷新', iconCls: 'icon-reload', handler: function () {
                query();
            }
            }, '-'
            // { text: '更新到数据库', iconCls: 'icon-save', handler: function () {
            //     saveToDB();
            //   }
            // }, '-'
        ]
    });
}

var editingId;
var i = 1;

/**
 * 添加主分类
 */
function appendMain() {

    // console.log(obj);
    $.ajax({
        type: 'post',
        url: addGoodsType,
        contentType: "application/json",
        data: "{\"pid\":" + 0 + ",\"name\":\"" + '新建分类' + (i++) + "\"}",
        success: function (data) {
            if (data.code == '0000') {
                id = data.data.id;
                var obj = {
                    id: id,
                    name: data.data.name,
                    parent: 0,
                    left: true,
                    visible: true
                };
                $('#tg').treegrid('append', {
                    parent: 0,  // the node has a 'id' value that defined through 'idField' property
                    data: [obj]
                });
            } else {
                $.messager.alert('提示', '添加失败,' + data.msg);
            }

        }, error: function (XMLHttpRequest, textStatus, errorThrown) {
            $.messager.alert('提示', '添加失败，请稍后再试或联系管理员！');
        }
    });
}

/**
 * 添加子分类
 */
function append() {
    var node = $('#tg').treegrid('getSelected');
    if (node) {
        // console.log(node);
        $.ajax({
            type: 'post',
            url: addGoodsType,
            contentType: "application/json",
            data: "{\"pid\":" + node.id + ",\"name\":\"" + '新建分类' + (i++) + "\"}",
            success: function (data) {
                if (data.code == '0000') {
                    id = data.data.id;
                    // console.log(datas);
                    var obj = {
                        id: id,
                        name: data.data.name,
                        parent: {id: node.id},
                        left: true,
                        visible: true,
                        // seq:99
                    };
                    $('#tg').treegrid('append', {
                        parent: node.id,  // the node has a 'id' value that defined through 'idField' property
                        data: [obj]
                    });
                } else {
                    $.messager.alert('提示', '添加失败,' + data.msg);
                }
            }, error: function (XMLHttpRequest, textStatus, errorThrown) {
                $.messager.alert('提示', '添加失败，请稍后再试或联系管理员！');
            }
        });

        // enableDnd($('#tg'));
        // params_data.add.push($('#tg').treegrid('find', obj.id));
    }
}

function insert() {
    var node = $('#tg').treegrid('getSelected');
    if (node) {
        var obj = {
            id: -1 * Math.random(),
            name: '新建菜单',
            parent: node.parent,
            left: true,
            visible: true,
            // seq:99
        };
        $('#tg').treegrid('insert', {
            after: node.id,
            data: obj
        });
        enableDnd($('#tg'));
        params_data.add.push($('#tg').treegrid('find', obj.id));
    }

}

function edit() {
    if (editingId != undefined) {
        save();
    }
    var row = $('#tg').treegrid('getSelected');
    if (row) {
        editingId = row.id
        $('#tg').treegrid('beginEdit', editingId);
        //解决添加拖拽功能后无法编辑问题  
        /* 
        var eds = $('#tg').treegrid('getEditors',editingId); 
        for(var i=0;i<eds.length;i++){ 
            $(eds[i].target).bind('mousedown',function(e){ 
                e.stopPropagation(); 
            }); 
        }*/
        $(".datagrid-row-editing input").each(function () {
            $(this).bind('mousedown', function (e) {
                e.stopPropagation();
            });
        });

    }
}

/**
 * 单击
 */
function click() {
    var node = $('#tg').treegrid('getSelected');
    if (editingId != undefined) {
        // $.messager.alert('提示', '保存失败,');
        save();
        $('#tg').treegrid('endEdit', editingId);
        editingId = undefined;
    }
    // console.log(node);
}

function save() {

    if (editingId != undefined) {
        $('#tg').treegrid('endEdit', editingId);
        var row = $('#tg').treegrid('find', editingId);
        // if (row.id > 0) {
        //     params_data.update.push(row);
        // }
        // editingId = undefined;
        // console.log(row);
        $.ajax({
            type: 'post',
            url: saveGoodsType,
            contentType: "application/json",
            data: "{\"id\":" + row.id + ",\"name\":\"" + row.name + "\"}",
            success: function (data) {
                if (data.code == '0000') {
                    $.messager.show({
                        title: '提示',
                        msg: '保存成功.',
                        timeout: 2000,
                        showType: 'slide'
                    });
                } else {
                    $.messager.alert('提示', '保存失败,' + data.msg);
                    query();
                }
            }, error: function (XMLHttpRequest, textStatus, errorThrown) {
                $.messager.alert('提示', '保存失败，请稍后再试或联系管理员！');
            }
        });
    }
}

function remove() {
    var node = $('#tg').treegrid('getSelected');
    if (node) {
        if (editingId != undefined && editingId == node.id) {
            editingId = undefined;
        }
        if (node.id > 0) {
            $.ajax({
                type: 'get',
                url: removeGoodsType,
                // contentType: "application/json",
                data: "name=" + node.name,
                success: function (data) {
                    if (data.code == '0000') {
                        $('#tg').treegrid('remove', node.id);
                        $.messager.show({
                            title: '提示',
                            msg: '删除成功.',
                            timeout: 2000,
                            showType: 'slide'
                        });
                    } else {
                        $.messager.alert('提示', '删除失败,' + data.msg);
                        query();
                    }
                }, error: function (XMLHttpRequest, textStatus, errorThrown) {
                    $.messager.alert('提示', '删除失败，请稍后再试或联系管理员！');
                }
            });
        } else {
            // var idx = params_data.add.indexOf(node);
            // params_data.add.remove(idx);
        }
    }
}

function cancelEdit() {
    if (editingId != undefined) {
        $('#tg').treegrid('cancelEdit', editingId);
        editingId = undefined;
    }
}

/**保存到数据库*/
// var params_data = {add: [],update: [],delete: []};
// function saveToDB(){
//     save();
//     var data = {
//             add: [],
//             update: [],
//             delete: []
//     };
//     for(var i=0;i<params_data.add.length;i++){
//         delete params_data.add[i]._parentId;
//         delete params_data.add[i].checkState;
//         delete params_data.add[i].checked;
//         delete params_data.add[i].state;
//     }
//     for(var i=0;i<params_data.update.length;i++){
//         delete params_data.update[i]._parentId;
//         delete params_data.update[i].checkState;
//         delete params_data.update[i].checked;
//         delete params_data.update[i].state;
//     }
//     for(var i=0;i<params_data.update.length;i++){
//         delete params_data.update[i]._parentId;
//         delete params_data.update[i].checkState;
//         delete params_data.update[i].checked;
//         delete params_data.update[i].state;
//     }
//     var req_data = {};
//     req_data.add = JSON.stringify(params_data.add);
//     req_data.update = JSON.stringify(params_data.update);
//     req_data.delete = JSON.stringify(params_data.delete);
//     $.ajax({
//         type: "POST",
//         url: 'menu/save',
//         dataType: "json",
//         data: req_data,
//         success: function (rarg) {
//             if (rarg.err == undefined) {
//                 $.messager.show({ title: '提示',
//                     msg: '保存成功.',
//                     timeout: 3000,
//                     showType: 'slide'
//                 });
//                 params_data = {add: [],update: [],delete: []};
//                 query();
//             }
//             else $.messager.alert('提示', rarg.err);
//             //refreshTab();
//         },
//         error: function (XMLHttpRequest, textStatus, errorThrown) {
//             $.messager.alert('提示', '保存失败,系统繁忙，请稍后再试！');
//         }
//     });
// }

function enableDnd(t) {
    var nodes = t.treegrid('getPanel').find('tr[node-id]');
    nodes.find('span.tree-hit').bind('mousedown.treegrid', function () {
        return false;
    });
}  
