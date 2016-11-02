    function h5ToJsonToH5(documentNode) {
        //function main(obj, parentNode) {
        //    for (var key in obj) {
        //        var value = obj[key];
        //        if (typeof value !== 'object' && key != 'innerText') {
        //            try {
        //                parentNode.setAttribute(key, value);
        //            } catch (e) {
        //                console.log("属性" + key + "，用setAttribute属性设置出错，使用另一种设置方法");
        //                parentNode[key] = value;
        //            }
        //        } else if (parentNode.tagName != 'SCRIPT' && typeof value !== 'object' && key == 'innerText') {
        //            parentNode.innerText = value;
        //        } else if (parentNode.tagName == 'SCRIPT' && typeof value !== 'object' && key == 'innerText') {
        //            parentNode.innerText = value.replace(/\<\$\>/g, '"');
        //        } else if (typeof value === 'object') {
        //            var keyName = key.match(/[A-Z]{1,}/g);
        //            var newEle = document.createElement(keyName);
        //            if (keyName != 'BODY') {
        //                parentNode.appendChild(newEle);
        //            }
        //            main(value, newEle);
        //        }
        //    }
        //}


        function generator(obj, parentNode) {
            var htmlHandler;
            function main(obj, parentNode) {
                for (var key in obj) {
                    var keyName = key.match(/[A-Z]{1,}/g);
                    var value = obj[key];
                    if (typeof value !== 'object' && key != 'innerText') {
                        try {
                            parentNode.setAttribute(key, value);
                        } catch (e) {
                            console.log("属性" + key + "，用setAttribute属性设置出错，使用另一种设置方法");
                            parentNode[key] = value;
                        }
                    } else if (parentNode.tagName != 'SCRIPT' && typeof value !== 'object' && key == 'innerText') {
                        parentNode.innerText = value;
                    } else if (parentNode.tagName == 'SCRIPT' && typeof value !== 'object' && key == 'innerText') {
                        parentNode.innerText = value.replace(/\<\$\>/g, '"').replace(/\<\%\>/g, '\r').replace(/\<\&\>/g, ' ');
                    } else if (typeof value === 'object' && keyName !='TEXTNODE') {
                        var newEle = document.createElement(keyName);
                        if (keyName != 'HTML') {
                            parentNode.appendChild(newEle);
                        } else {
                            htmlHandler = newEle;
                        }
                        main(value, newEle);
                    } else if (typeof value === 'object' && keyName == 'TEXTNODE') {
                        parentNode.appendChild(document.createTextNode(value.textContent));
                    }
                }
            }
            main(obj, parentNode);
            return htmlHandler;
        }

            function htmlToJson(targetNode) {
                var attrStr = '';
                var jsonStr = inner(targetNode);//第一次调用，不传入第二个参数。
                function inner(targetNode, nodeLevel) {
                    var attrLen = targetNode.attributes.length, //元素属性长度
                        childNum = targetNode.children.length,
                        childNodesNum = targetNode.childNodes.length;
                    if (arguments.length < 2) {
                        attrStr += '{"' + targetNode.nodeName + '":{'; //json的第一个标签 {"html":{
                    } else {
                        attrStr += '"' + nodeLevel + targetNode.nodeName + '"' + ':{';  //"100DIV":{
                    }
                    if (attrLen > 0) { //如果元素属性个数大于0
                        Array.prototype.slice.call(targetNode.attributes).forEach(function (item) {
                            attrStr += '"' + item.name + '": "' + item.value.replace(/\n|\t|\r/g, '')
                           .replace(/"/g, "'").replace(/\t/g, '').replace(/\\/g, '\\\\') + '",';  //"id":"idname",
                        });
                        if (childNum == 0) {
                            attrStr = attrStr.slice(0, -1);
                        }
                    }
                    var condition = childNum == 0 && targetNode.childNodes.length == 1;//&& targetNode.innerText != '';
                    var textContent = targetNode.innerText.replace(/\n|\t|\r/g, '')
                        .replace(/"/g, "'").replace(/\\/g, '\\\\');
                    var scriptTextCon = targetNode.innerText.replace(/\t/g, '')
                        .replace(/"/g, "<$>").replace(/\\/g, '\\\\').replace(/\n/g, '<&>').replace(/\r/g, '<%>');
                    if (condition && attrLen > 0 && targetNode.nodeName != 'SCRIPT') { //如果当前元素属性个数不为0
                        attrStr += ',"innerText":"' + textContent + '"';//如果存在文本节点，前面要加','。
                    } else if (condition && attrLen == 0 && targetNode.nodeName != 'SCRIPT') {
                        attrStr += '"innerText":"' + textContent + '"';
                    } else if (condition && attrLen > 0 && targetNode.nodeName == 'SCRIPT') {
                        attrStr += ',"innerText":"' + scriptTextCon + '"';
                    } else if (condition && attrLen == 0 && targetNode.nodeName == 'SCRIPT') {
                        attrStr += '"innerText":"' + scriptTextCon + '"';
                    }
                        //if (childNum > 0) {  //如果当前元素存在子节点，则继续递归   
                        //    for (var i = 0 ; i < childNum; i++) {
                        //        inner(targetNode.children[i], i + 1);
                        //        attrStr += "},";
                        //    }
                        //    attrStr = attrStr.slice(0, -1);
                    //}
                    if (childNum > 0) {
                        for (var i = 0 ; i < childNodesNum; i++) {
                            var childNode = targetNode.childNodes[i];
                            if (childNode.nodeType == 1) {
                                inner(childNode, i);
                                attrStr += "},";
                            } else if (childNode.nodeType == 3 && childNode.nodeValue.trim().length > 0) {
                                // targetNode.appendChild(document.createTextNode(targetNode.childeNodes[i].nodeValue));
                                attrStr += '"'+i +'TEXTNODE' +  '":{"textContent":"' + childNode.nodeValue.trim()+'"},'
                            }

                        }
                        attrStr = attrStr.slice(0, -1);
                    }
                    return attrStr.slice(0, -1) + "},";//删除多余的逗号，并拼接上}，
                }
                return jsonStr.slice(0, -1) + "}}";//删除html最后一个子节点外的逗号，并加上}
            }
        var json = htmlToJson(documentNode);
        var jsonObj = JSON.parse(json);
        document.removeChild(documentNode);
       // main(jsonObj, document.documentElement);
        (function (NodeHandler) {
            document.appendChild(NodeHandler);
        })(generator(jsonObj, document));
        return jsonObj;
    }
h5ToJsonToH5(document.documentElement);