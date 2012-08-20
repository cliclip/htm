/*

	jQuery Tags Input Plugin 1.3.3

	Copyright (c) 2011 XOXCO, Inc

	Documentation for this plugin lives here:
	http://xoxco.com/clickable/jquery-tags-input

	Licensed under the MIT license:
	http://www.opensource.org/licenses/mit-license.php

	ben@xoxco.com

*/

(function($) {

  var delimiter = new Array();
  var tags_callbacks = new Array();
  $.fn.doAutosize = function(o){
    var minWidth = $(this).data('minwidth'),
    maxWidth = $(this).data('maxwidth'),
    val = '',
    input = $(this),
    testSubject = $('#'+$(this).data('tester_id'));

    if (val === (val = input.val())) {return;}

    // Enter new content into testSubject
    var escaped = val.replace(/&/g, '&amp;').replace(/\s/g,' ').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    testSubject.html(escaped);
    // Calculate new width + whether to change
    var testerWidth = testSubject.width(),
    newWidth = (testerWidth + o.comfortZone) >= minWidth ? testerWidth + o.comfortZone : minWidth,
    currentWidth = input.width(),
    isValidWidthChange = (newWidth < currentWidth && newWidth >= minWidth)
			   || (newWidth > minWidth && newWidth < maxWidth);

    // Animate width
    if (isValidWidthChange) {
       input.width(newWidth);
     }
  };
  $.fn.resetAutosize = function(options){
    // alert(JSON.stringify(options));
    var minWidth =  $(this).data('minwidth') || options.minInputWidth || $(this).width(),
    maxWidth = $(this).data('maxwidth') || options.maxInputWidth || ($(this).closest('.tagsinput').width() - options.inputPadding),
    val = '',
    input = $(this),
    testSubject = $('<tester/>').css({
      position: 'absolute',
      top: -9999,
      left: -9999,
      width: 'auto',
      fontSize: input.css('fontSize'),
      fontFamily: input.css('fontFamily'),
      fontWeight: input.css('fontWeight'),
      letterSpacing: input.css('letterSpacing'),
      whiteSpace: 'nowrap'
    }),
    testerId = $(this).attr('id')+'_autosize_tester';
    if(! $('#'+testerId).length > 0){
      testSubject.attr('id', testerId);
      testSubject.appendTo('body');
    }

    input.data('minwidth', minWidth);
    input.data('maxwidth', maxWidth);
    input.data('tester_id', testerId);
    input.css('width', minWidth);
  };

  $.fn.addTag = function(value,options) {
    options = jQuery.extend({focus:false,callback:true},options);
    this.each(function() {
      var id = $(this).attr('id');
      var tagslist = $(this).val().split(delimiter[id]);
      if (tagslist[0] == '') {
	tagslist = new Array();
      }
      value = jQuery.trim(value.toLocaleLowerCase());
      // console.log("value :: " + value);
      if (options.unique) {
	var skipTag = $(tagslist).tagExist(value);
	if(skipTag == true) {
	  //Marks fake input as not_valid to let styling it
    	  $('#'+id+'_tag').addClass('not_valid');
    	}
      } else {
	var skipTag = false;
      }
      if (value !='' && skipTag != true) {
        $('<span>').addClass('tag').append(
	  $('<span>').text(value),
	  "<a>&nbsp;&nbsp;&nbsp;</a>",
	  $('<a>', {
              href  : '#',
              title : 'Removing tag',
              text  : ' X'
	  }).addClass('del').click(function () {
	    return $('#' + id).removeTag(escape(value));
	  })
	).mouseover(function(e){
	  $($(e.currentTarget)[0].children[1]).hide();
	  $($(e.currentTarget)[0].children[2]).show();
	}).mouseout(function(e){
	  $($(e.currentTarget)[0].children[1]).show();
	  $($(e.currentTarget)[0].children[2]).hide();
	})
	.insertBefore('#' + id + '_addTag');
	tagslist.push(value);
	$('#'+id+'_tag').val('');
	if (options.focus) {
	  $('#'+id+'_tag').focus();
	} else {
	  $('#'+id+'_tag').blur();
	}
	$.fn.tagsInput.updateTagsField(this,tagslist);
	if (options.callback && tags_callbacks[id] && tags_callbacks[id]['onAddTag']) {
	  var f = tags_callbacks[id]['onAddTag'];
	  f.call(this, value);
	}
	if(tags_callbacks[id] && tags_callbacks[id]['onChange']){
	  var i = tagslist.length;
	  var f = tags_callbacks[id]['onChange'];
	  f.call(this, $(this), tagslist[i-1]);
	}
      }
    });
    return false;
  };

  $.fn.removeTag = function(value) {
    value = unescape(value);
    this.each(function() {
      var id = $(this).attr('id');
      var old = $(this).val().split(delimiter[id]);
      $('#'+id+'_tagsinput .tag').remove();
      str = '';
      for (i=0; i< old.length; i++) {
	if (old[i]!=value) {
	  str = str + delimiter[id] +old[i];
	}
      }
      $.fn.tagsInput.importTags(this,str);
      if (tags_callbacks[id] && tags_callbacks[id]['onRemoveTag']) {
	var f = tags_callbacks[id]['onRemoveTag'];
	f.call(this, value);
      }
    });
    return false;
  };

  $.fn.tagExist = function(val) {
    return (jQuery.inArray(val, $(this)) >= 0); //true when tag exists, false when not
  };

  // clear all existing tags and import new ones from a string
  $.fn.importTags = function(str) {
    id = $(this).attr('id');
    $('#'+id+'_tagsinput .tag').remove();
    $.fn.tagsInput.importTags(this,str);
  };

  $.fn.tagsInput = function(options) {
    var settings = jQuery.extend({
      interactive:true,
      defaultText:_i18n('tag.add_tag'),
      //defaultText:'add a tag',
      minChars:0,
      maxChars:10,
      width:'270px',
      height:'75px',
      autocomplete: {selectFirst: false },
      'hide':true,
      'delimiter':',',
      'unique':true,
      removeWithBackspace:true,
      placeholderColor:'#666666',
      autosize: true,
      comfortZone: 20,
      inputPadding: 6*2
    },options);

    this.each(function() {
      if (settings.hide) {$(this).hide();}
      var id = $(this).attr('id');

      var data = jQuery.extend({
	pid:id,
	real_input: '#'+id,
	holder: '#'+id+'_tagsinput',
	input_wrapper: '#'+id+'_addTag',
	fake_input: '#'+id+'_tag'
      },settings);
      delimiter[id] = data.delimiter;

      if (settings.onAddTag || settings.onRemoveTag || settings.onChange) {
	tags_callbacks[id] = new Array();
	tags_callbacks[id]['onAddTag'] = settings.onAddTag;
	tags_callbacks[id]['onRemoveTag'] = settings.onRemoveTag;
	tags_callbacks[id]['onChange'] = settings.onChange;
      }

      var markup = '<div id="'+id+'_tagsinput" class="tagsinput"><div id="'+id+'_addTag">';

      if (settings.interactive) {
	markup = markup + '<input id="'+id+'_tag" value="" data-default="'+settings.defaultText+'" maxlength="10"/><div class="taglistDiv" style="display:none;" ></div>';
      }

      markup = markup + '</div><div class="tags_clear"></div></div>';

      $(markup).insertAfter(this);

      $(data.holder).css('width',settings.width);
      $(data.holder).css('min-height',settings.height);

      if ($(data.real_input).val()!='') {
	$.fn.tagsInput.importTags($(data.real_input),$(data.real_input).val());
      }
      if (settings.interactive) {
	$(data.fake_input).val($(data.fake_input).attr('data-default'));
	$(data.fake_input).css('color',settings.placeholderColor);
	$(data.fake_input).resetAutosize(settings);

	$(data.holder).bind('click',data,function(event) {
	    $(event.data.fake_input).focus();
	});
	if(false){//  /msie/i.test(navigator.userAgent)){
	  $(data.fake_input).bind('propertychange',data,function(event) {
	    //console.dir(event);
	    var str = $.trim($(data.fake_input).val());
	    App.vent.trigger("app.tagsinput:taglist",str);
	    if( $(".taglistDiv").children().children().length != 0){
	      $(".taglistDiv").show();
	    }else{
	      $(".taglistDiv").hide();
	    }
	  });
	}else{
	  $(data.fake_input).bind('input',data,function(event) {
	    var str = $.trim($(data.fake_input).val());
	    App.vent.trigger("app.tagsinput:taglist",str);
	    if( $(".taglistDiv").children().children().length != 0){
	      $(".taglistDiv").show();
	    }else{
	      $(".taglistDiv").hide();
	    }
	  });
	}

	$(data.fake_input).bind('click',data,function(event) {
	  var str = $.trim($(data.fake_input).val());
	  App.vent.trigger("app.tagsinput:taglist",str);
	});

	$(data.fake_input).bind('blur',data,function(event) {
	  var sflag = true;
	  if($(".taglistDiv").children().length){
	    $(".taglistDiv").scroll(function(){
	      sflag = false;
	    });
	    setTimeout(function(){
	      if(sflag){
		App.vent.trigger("app.clipapp.taglist:close");
		$(".taglistDiv").hide();
	      }
	    },200);
	  }
	});

	App.vent.unbind("app.clipapp.taglist:gettag");// 解决请求多次的问题
	App.vent.bind("app.clipapp.taglist:gettag",function(tag){
	  if(tag){
	    $(data.real_input).addTag(tag,{focus:true,unique:(settings.unique)});
	  }
	});

	$(data.fake_input).bind('focus',data,function(event) {
	  $("#"+id+"_tag").siblings("span.error").remove();
	  $("#"+id+"_tag").removeClass("error");
	  if( $(".taglistDiv").children().children().length != 0){
	    $(".taglistDiv").show();
	  }else{
	    $(".taglistDiv").hide();
	  }
	});

	$(data.fake_input).bind('focus',data,function(event) {
	  if ($(event.data.fake_input).val()==$(event.data.fake_input).attr('data-default')) {
	    $(event.data.fake_input).val('');
	  }
	  $(event.data.fake_input).css('color','#000000');
	});

	if (settings.autocomplete_url != undefined) {
	  autocomplete_options = {source: settings.autocomplete_url};
	  for (attrname in settings.autocomplete) {
	    autocomplete_options[attrname] = settings.autocomplete[attrname];
	  }

	  if (jQuery.Autocompleter !== undefined) {
	    $(data.fake_input).autocomplete(settings.autocomplete_url, settings.autocomplete);
	    $(data.fake_input).bind('result',data,function(event,data,formatted) {
	      if (data) {
		$('#'+id).addTag(data[0] + "",{focus:true,unique:(settings.unique)});
	      }
	    });
	  } else if (jQuery.ui.autocomplete !== undefined) {
	    $(data.fake_input).autocomplete(autocomplete_options);
	    $(data.fake_input).bind('autocompleteselect',data,function(event,ui) {
	      $(event.data.real_input).addTag(ui.item.value,{focus:true,unique:(settings.unique)});
	      return false;
	    });
	  }
	} else {
	  // if a user tabs out of the field, create a new tag
	  // this is only available if autocomplete is not used.
	  $(data.fake_input).bind('blur',data,function(event) {
	    var d = $(this).attr('data-default');
	    if ($(event.data.fake_input).val()!='' && $(event.data.fake_input).val()!=d) {
	      var len = 0;
	      var tag = $(event.data.fake_input).val();
	      for(i=0;i<tag.length;i++){
		if(tag.charCodeAt(i)>256){
		  len   +=   2;
		}else{
		  len++;
		}
	      }
	      if( (event.data.minChars <= $(event.data.fake_input).val().length) && (!event.data.maxChars || (event.data.maxChars >= len)) ){
		$(event.data.real_input).addTag($(event.data.fake_input).val(),{focus:true,unique:(settings.unique)});}else{
		  var error = _i18n("tag.beyond");
		  $("#"+id+"_tag").after("<span class='error'>"+error+"</span>");
		  App.vent.trigger("app.clipapp.tagsinput:error");
	      }
	    } else {
	      $(event.data.fake_input).val($(event.data.fake_input).attr('data-default'));
	      $(event.data.fake_input).css('color',settings.placeholderColor);
	    }
	    return false;
	  });
	}
	// if user types a comma, create a new tag
	$(data.fake_input).bind('keypress',data,function(event) {
	  if (event.which==event.data.delimiter.charCodeAt(0) || event.which==13 ) {
	    var len = 0;
	    var tag = $(event.data.fake_input).val();
	    for(i=0;i<tag.length;i++){
	      if(tag.charCodeAt(i)>256){
		len   +=   2;
	      }else{
		len++;
	      }
	    }
	    if( (event.data.minChars <= $(event.data.fake_input).val().length) && (!event.data.maxChars || (event.data.maxChars >= len)) ){
              $(event.data.real_input).addTag($(event.data.fake_input).val(),{focus:true,unique:(settings.unique)});
	    }else{
	      var error = _i18n("tag.beyond");
	      $("#"+id+"_tag").after("<span class='error'>"+error+"</span>");
	    }
	    $(event.data.fake_input).resetAutosize(settings);
	    App.vent.trigger("app.tagsinput:taglist");
	    return false;
	  } else if (event.data.autosize) {
	    $(event.data.fake_input).doAutosize(settings);
	  }
	});
	 //Delete last tag on backspace
	 data.removeWithBackspace && $(data.fake_input).bind('keydown', function(event){
	 if(event.keyCode == 8 && $(this).val() == ''){
/*	   event.preventDefault();
	   var last_tag = $(this).closest('.tagsinput').find('.tag:last').text();
	   var id = $(this).attr('id').replace(/_tag$/, '');
	   last_tag = last_tag.replace(/[\s]+x$/, '');
	   $('#' + id).removeTag(escape(last_tag));
	   $(this).trigger('focus');*/
	 }else if(event.keyCode == 38){ // Down
	   var flag = true;
	   var div = $(".taglistDiv").children().children();
	   for(var i=0;i<div.length;i++){
	     if(flag && $(div[i]).css("background-color") == "rgb(136, 136, 136)"){
	     $(div[i]).css("background-color","");
	     $(div[i-1]).css("background-color","#888");
	     $(data.fake_input).val($(div[i-1]).text());
	     flag = false;
	     }
	   }
	   if(flag){
	     $(div[div.length-1]).css("background-color","#888");
	     $(data.fake_input).val($(div[length-1]).text());
	   }
	 }else if(event.keyCode == 40){ // UP
	   var flag = true;
	   var div = $(".taglistDiv").children().children();
	   for(var i=0;i<div.length;i++){
	     if(flag && $(div[i]).css("background-color") == "rgb(136, 136, 136)"){
	     $(div[i]).css("background-color","");
	     $(div[i+1]).css("background-color","#888");
	     $(data.fake_input).val($(div[i+1]).text());
	     flag = false;
	     }
	   }
	   if(flag){
	     $(div[0]).css("background-color","#888");
	     $(data.fake_input).val($(div[0]).text());
	   }
	 }
       });

	 //$(data.fake_input).blur();

	 //Removes the not_valid class when user changes the value of the fake input
	 if(data.unique) {
	   $(data.fake_input).keydown(function(event){
	     if(event.keyCode == 8 || String.fromCharCode(event.which).match(/\w+|[áéíóúÁÉÍÓÚñÑ,/]+/)) {
	       $(this).removeClass('not_valid');
	     }
	   });
	 }
       } // if settings.interactive
	 return false;
       });
       return this;
   };

   $.fn.tagsInput.updateTagsField = function(obj,tagslist) {
     var id = $(obj).attr('id');
       $(obj).val(tagslist.join(delimiter[id]));
   };

   $.fn.tagsInput.importTags = function(obj,val) {
     $(obj).val('');
     var id = $(obj).attr('id');
     var tags = val.split(delimiter[id]);
     for (i=0; i<tags.length; i++) {
       $(obj).addTag(tags[i],{focus:false,callback:false});
     }
     if(tags_callbacks[id] && tags_callbacks[id]['onChange']){
       var f = tags_callbacks[id]['onChange'];
       f.call(obj, obj, tags[i]);
     }
   };

})(jQuery);
