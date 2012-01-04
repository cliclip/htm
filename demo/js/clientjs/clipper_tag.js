var clipper_tag = (function(){

// ---- public

function show(el, vals, tags){
    var html = '';
    for(var i=0; i<vals.length; i++) {
        html += '<span class="enable">'+vals[i]+'</span>';
    }
    for(var i=0; i<tags.length; i++) {
        if (vals.indexOf(tags[i]) == -1){
            html += '<span class="disable">'+tags[i]+'</span>';
        }
    }
    el.innerHTML = html;
    bind(el);
}

function hide(el){
    unbind(el);
}

function get(el){
    var val = [];
    var tags = el.getElementsByClassName("enable");
    for(var i=0; i<tags.length; i++){
        var v = tags[i].textContent;
        if(val.indexOf(v) == -1) val.push(v);
    }
    return val;
}

// ---- private

function bind(el){
    var tag = el.getElementsByTagName("span");
    for(var i=0; i<tag.length; i++) {
        tag[i].addEventListener("click", tag_click, false);
    }
    var tagadd = el.parentNode.getElementsByClassName("tag_add");
    if(tagadd.length == 1)
      tagadd[0].addEventListener("click", tagadd_click, false)
}
function unbind(el){
    var tag = el.getElementsByTagName("span");
    for(var i=0; i<tag.length; i++) {
        tag[i].removeEventListener("click", tag_click, false);
    }
    var tagadd = el.parentNode.getElementsByClassName("tag_add");
    if(tagadd.length == 1)
      tagadd[0].removeEventListener("click", tagadd_click, false)
}

// 标签点击事件响应
function tag_click(e) {
    var el = e.target;
    if (!el) return;
    el.className = (el.className == "enable") ? "disable" : "enable";
}

// 增加标签点击事件响应
function tagadd_click(e) {
    var el = e.target.parentNode.getElementsByTagName("input")[0];
    if (!el) return;
    if (el.style.display == "none"){
        el.style.display = "";
    }
    el.focus();
    el.removeEventListener("keydown", tagadd_input_keydown, false);
    el.addEventListener("keydown", tagadd_input_keydown, false);
    el.removeEventListener("blur", tagadd_input_blur, false);
    el.addEventListener("blur", tagadd_input_blur, false);
}

// 增加标签按键事件响应
function tagadd_input_keydown(e){
    if (e.keyCode == 13){
        tagadd_input_blur(e);
    }
}

// 增加标签焦点移开事件响应
function tagadd_input_blur(e){
    var el = e.target;
    if (!el) return;
    var val = el.value.trim();
    if(val.length > 0){
        var tags = el.parentNode.getElementsByClassName("tags")[0];
        var firstTag = tags.firstChild;
        var doc = el.ownerDocument;
        var tag = doc.createElement("span");
        tag.className = "enable";
        tag.textContent = val;
        tag.addEventListener("click", tag_click, false);
        tags.insertBefore(tag, firstTag);
    }
    el.value = "";
    el.style.display = "none";
    el.removeEventListener("blur", tagadd_input_blur, false);
    el.removeEventListener("keydown", tagadd_input_keydown, false);
}

// ---- exports

return {
  show: show,
  hide: hide,
  get: get
};

})();