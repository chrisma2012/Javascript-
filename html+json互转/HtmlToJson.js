

function htmlToJson(targetNode, nodeLevel) {
    var attrStr = '';
    var jsonStr = inner(targetNode, nodeLevel);
    function inner(targetNode, nodeLevel) {
        var attrLen = targetNode.attributes.length; //元素属性长度
        if (nodeLevel == 100) {
            attrStr += '{"' + targetNode.nodeName + '":{'; //json的第一个标签 {"html":{
        } else {
            attrStr += '"' + nodeLevel + targetNode.nodeName + '"' + ':{';  //"100DIV":{
        }
        if (attrLen > 0) { //如果元素属性个数大于0
            Array.prototype.slice.call(targetNode.attributes).forEach(function (item) {
                attrStr += '"' + item.name + '": "' + item.value + '",';  //"id":"idname",
            });
            if (targetNode.children.length == 0) {
                attrStr = attrStr.slice(0, -1);
            }
        }
        if (targetNode.children.length == 0 && targetNode.childNodes.length == 1 && targetNode.innerText != '' && attrLen >0) {
            var textContent = targetNode.innerText.replace(/\n/g, '').replace(/\s/g, '').replace(/"/g, "'");
            attrStr += ',"innerText":"' + textContent + '"';//如果存在文本节点
        } else if (targetNode.children.length == 0 && targetNode.childNodes.length == 1 && targetNode.innerText != '' &&attrLen ==0) {
            var textContent = targetNode.innerText.replace(/\n/g, '').replace(/\s/g, '').replace(/"/g, "'");
            attrStr += '"innerText":"' + textContent + '"';
        }

        if (targetNode.children.length > 0) {//如果当前元素存在子节点，则继续递归
            for (var i = 0 ; i < targetNode.children.length; i++) {
                inner(targetNode.children[i], i * 100 + 1);
                attrStr += "},";
            }
            attrStr = attrStr.slice(0, -1);
        }

        return attrStr.slice(0, -1) + "},";//删除多余的逗号，并拼接上}，
    }
    return jsonStr.slice(0, -1) + "}}";//删除html最后一个子节点外的逗号，并加上}
}