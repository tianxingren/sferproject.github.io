var AWS =
{
	//全局loading
	loading: function (type)
	{
		if (!$('#aw-loading').length)
		{
			$('#aw-ajax-box').append(AW_TEMPLATE.loadingBox);
		}

		if (type == 'show')
		{
			if ($('#aw-loading').css('display') == 'block')
			{
				return false;
			}

			$('#aw-loading').fadeIn();

			AWS.G.loading_timer = setInterval(function ()
			{
				AWS.G.loading_bg_count -= 1;

				$('#aw-loading-box').css('background-position', '0px ' + AWS.G.loading_bg_count * 40 + 'px');

				if (AWS.G.loading_bg_count == 1)
				{
					AWS.G.loading_bg_count = 12;
				}
			}, 100);
		}
		else
		{
			$('#aw-loading').fadeOut();

			clearInterval(AWS.G.loading_timer);
		}
	},

	dowmload :function(url,uid){
		$.ajax({
			url:G_BASE_URL+'/down/download_file/',
			type:'post',
			dataType:'json',
			data:{url:url,uid:uid},
			success:function(res){
				if(res.errno==1){
					location.href=res.rsm;
				}else{
					layer.msg(res.err);
				}
			}
		});
	},

	loading_mini: function (selector, type)
	{
		if (!selector.find('#aw-loading-mini-box').length)
		{
			selector.append(AW_TEMPLATE.loadingMiniBox);
		}

		if (type == 'show')
		{
			selector.find('#aw-loading-mini-box').fadeIn();
			AWS.G.loading_timer = setInterval(function ()
			{
				AWS.G.loading_mini_bg_count -= 1;

				$('#aw-loading-mini-box').css('background-position', '0px ' + AWS.G.loading_mini_bg_count * 16 + 'px');

				if (AWS.G.loading_mini_bg_count == 1)
				{
					AWS.G.loading_mini_bg_count = 9;
				}
			}, 100);
		}
		else
		{
			selector.find('#aw-loading-mini-box').fadeOut();

			clearInterval(AWS.G.loading_timer);
		}
	},

	ajax_request: function(url, params)
	{
		AWS.loading('show');

		if (params)
		{
			$.post(url, params + '&_post_type=ajax', function (result)
			{
                _callback(result);
			}, 'json').error(function (error)
			{
				_error(error);
			});
		}
		else
		{
			$.get(url, function (result)
			{
				_callback(result);
			}, 'json').error(function (error)
			{
				_error(error);
			});
		}

		function _callback (result)
		{
			AWS.loading('hide');
			if (!result)
			{
				return false;
			}
			if (result.errno == 3)
			{
				layer.msg(result.err,{offset:['50%'],time: 2000},function(){ window.location.reload(); });
				return false;
			}
			if (result.err)
			{
				AWS.alert(result.err);
			}
			else if (result.rsm && result.rsm.url)
			{
				window.location = decodeURIComponent(result.rsm.url);
			}
			else if (result.errno == 1)
			{
				window.location.reload();
			}
			else if(result.errno==2){
				var total=result.rsm.total;
				if(total>2){
						if(result.rsm.best_count==2)
						layer.confirm('您已经设置了'+ (result.rsm.best_count+1)+'个最佳回复,将进入公示阶段', {icon: 3, title:'提示',btn:['知道了']}, function(index){
							window.location.reload();
						    layer.close(index);
						});
						else
						layer.confirm('您已经设置了'+ (result.rsm.best_count+1)+'个最佳回复,最多可以设置3个,完成设置将进入公示期,是否继续设置？', {icon: 3, title:'提示',btn:['完成设置','设置其他']},
								function(index){
								        $.ajax({
								            url:G_BASE_URL + '/pay/check_show/',
								            type:"POST",
								            async:false,
								            data:{question_id:result.rsm.question_id},
								            dataType:'json',
								            success:function(result){
								            	layer.msg(result.rsm,{icon:-1},function(){
													window.location.reload();

								            	});
								            }
								        });
								},
								 function(index){
									window.location.reload();
								    layer.close(index);
								}
						);

				}else if(total==2){
						if(result.rsm.best_count==0){
								layer.confirm('您已经设置了'+ (result.rsm.best_count+1)+'个最佳回复,最多可以设置3个,完成设置将进入公示期,是否继续设置？', {icon: 3, title:'提示',btn:['完成设置','设置其他']},
										function(index){
										        $.ajax({
										            url:G_BASE_URL + '/pay/check_show/',
										            type:"POST",
										            async:false,
										            data:{question_id:result.rsm.question_id},
										            dataType:'json',
										            success:function(result){
										            	layer.msg(result.rsm,{icon:-1},function(){
															window.location.reload();

										            	});
										            }
										        });
										},
										 function(index){
											window.location.reload();
										    layer.close(index);
										}
								);
						}else{

					window.location.reload();
						}
						
				}else{
					window.location.reload();
				}
			}
		}

		function _error (error)
		{
			AWS.loading('hide');

			if ($.trim(error.responseText) != '')
			{
				alert(_t('发生错误, 返回的信息:') + ' ' + error.responseText);
			}
		}

		return false;
	},

	ajax_post: function(formEl, processer, type) // 表单对象，用 jQuery 获取，回调函数名
	{
		$('#publish_submit,#quick_submit').addClass('disabled');
		// 若有编辑器的话就更新编辑器内容再提交
		if (typeof CKEDITOR != 'undefined')
		{
			for ( instance in CKEDITOR.instances ) {
				CKEDITOR.instances[instance].updateElement();
			}
		}
		if (typeof (processer) != 'function')
		{
			var processer = AWS.ajax_processer;

			AWS.loading('show');
		}

		if (!type)
		{
			var type = 'default';
		}
		else if (type == 'reply_question')
		{
			AWS.loading('show');

			$('.btn-reply').addClass('disabled');

			// 删除草稿绑定事件
			if (EDITOR != undefined)
			{
				EDITOR.removeListener('blur', EDITOR_CALLBACK);
			}
		}


		var custom_data = {
			_post_type: 'ajax'
		};

		formEl.ajaxSubmit(
		{
			dataType: 'json',
			data: custom_data,
			success: function (result)
			{
				$('#publish_submit,#quick_submit').removeClass('disabled');
				if(typeof (processer)!='function')
				{
					AWS.ajax_processer(type, result)
				}else{
					processer(type, result);
				}
			},
			error: function (error)
			{
				$('#publish_submit,#quick_submit').removeClass('disabled');
				if ($.trim(error.responseText) != '')
				{
					AWS.loading('hide');
					alert(_t('发生错误, 返回的信息:') + ' ' + error.responseText);
				}
				else if (error.status == 0)
				{
					AWS.loading('hide');

					alert(_t('网络链接异常'));
				}
				else if (error.status == 500)
				{
					AWS.loading('hide');

					alert(_t('内部服务器错误'));
				}
			}
		});
	},

	// ajax提交callback
	ajax_processer: function (type, result)
	{
		AWS.loading('hide');

		if (typeof (result.errno) == 'undefined')
		{
			AWS.alert(result);
		}
		else if (result.errno != 1)
		{
			switch (type)
			{
				case 'default':
				case 'comments_form':
				case 'reply':
				case 'consult_commit':
				case 'member_commit':
				case 'reply_question':
					AWS.alert(result.err);
					$('.aw-comment-box-btn .btn-success, .btn-reply').removeClass('disabled');
				break;
				case 'invitation_message':
					AWS.alert(result.err);
				break;
				case 'ajax_post_alert':
				case 'ajax_post_modal':
				case 'error_message':
					if (!$('.error_message').length)
					{
						alert(result.err);
					}
					else if ($('.error_message em').length)
					{
						$('.error_message em').html(result.err);
					}
					else
					{
						 $('.error_message').html(result.err);
					}

					if ($('.error_message').css('display') != 'none')
					{
						AWS.shake($('.error_message'));
					}
					else
					{
						$('.error_message').fadeIn();
					}

					if ($('#captcha').length)
					{
						$('#captcha').click();
					}
				break;
				case 'publish_question':
					if(result.errno == 999){
						pay_data.order_id=result.err.question_id;
						pay_data.reward_time=result.err.reward_time;
						pay_data.pay_type=1;
						pay_data.remarks='发布悬赏问题';
						showpay();
					}else if(result.errno == 1){
						location.href=result.rsm.url;
					}else{
						layer.msg(result.err);
					}
				break;
				// 提现
				case 'withdraw_back':
					AWS.loading('hide');
					if (result.errno == 11)
					{
						AWS.alert(result.err);
						window.location.reload();
					}
					else
					{
						AWS.alert(result.err);
					}
				break;
			}
		}
		else
		{
			if (type == 'comments_form')
			{
				AWS.reload_comments_list(result.rsm.item_id, result.rsm.item_id, result.rsm.type_name);
				$('#aw-comment-box-' + result.rsm.type_name + '-' + result.rsm.item_id + ' form textarea').val('');
				$('.aw-comment-box-btn .btn-success').removeClass('disabled');
				if(result.rsm.type_name=='question'){
					var sele=$("#aw-comment-box-question-"+result.rsm.item_id).prev().find('.aw-add-comment');
					sele.html('<i class="icon icon-comment"></i> '+(parseInt(0+sele.text())+1)+' 条评论');
				}else{
				$('#answer_list_'+result.rsm.item_id).find(".aw-add-comment").html('<i class="icon icon-comment"></i> '+(parseInt($('#answer_list_'+result.rsm.item_id).find(".aw-add-comment").text())+1));
				}
			}

			if (result.rsm && result.rsm.url)
			{
				// 判断返回url跟当前url是否相同
				if (window.location.href == result.rsm.url)
				{
					window.location.reload();
				}
				else
				{
					window.location = decodeURIComponent(result.rsm.url);
				}
			}
			else
			{
				switch (type)
				{
					case 'default':
					case 'ajax_post_alert':
					case 'error_message':
						window.location.reload();
					break;
					case 'invitation_message':
						layer.msg(result.err,{offset:['50%'], time: 2000 },function(){window.location.reload();});
					break;
					case 'appeal':
						AWS.alert(result.err);
						$(".modal-backdrop").removeClass('modal-backdrop');
					break;
					case 'ajax_post_modal':
						$('#aw-ajax-box div.modal').modal('hide');
					break;
					case 'publish_question':
						if(result.errno == 999){
							pay_data.order_id=result.err.question_id;
							pay_data.reward_time=result.err.reward_time;
							pay_data.pay_type=1;
							pay_data.remarks='发布悬赏问题';
							showpay();
						}else if(result.errno == 1){
							location.href=result.rsm.url;
						}else{
							layer.msg(result.err);
						}
					break;
					// 问题回复
					case 'reply_question':
						AWS.loading('hide');
						if (result.rsm.ajax_html)
						{
							$('.aw-feed-list').append(result.rsm.ajax_html);
							$('.aw-comment-box-btn .btn-success, .btn-reply').removeClass('disabled');
							$.scrollTo($('#' + $(result.rsm.ajax_html).attr('id')), 600, {queue:true});
							$('.aw-question-comment').find('.aw-nav-tabs').find('h2.hidden-xs').html((parseInt($('.aw-question-comment').find('.aw-nav-tabs').find('h2.hidden-xs').html())+1)+' 个回复');
							// 问题
							$('.question_answer_form').detach();
							if ($('.aw-replay-box.question').length)
							{
								if (USER_ANSWERED)
								{
									$('.aw-replay-box').append('<p align="center">一个问题只能回复一次, 你可以在发言后 ' + ANSWER_EDIT_TIME + ' 分钟内编辑回复过的内容</p>');
								}
							}
						}
						else if(result.rsm.url)
						{
							window.location = decodeURIComponent(result.rsm.url);
						}
						else
						{
							window.location.reload();
						}
					break;
					// 文章回复
					case 'reply':
						AWS.loading('hide');
						if (result.rsm.ajax_html)
						{
							$('.aw-feed-list').append(result.rsm.ajax_html);
							$('.aw-comment-box-btn .btn-success, .btn-reply').removeClass('disabled');
							$.scrollTo($('#' + $(result.rsm.ajax_html).attr('id')), 600, {queue:true});
							$('#comments_count').html(parseInt($('#comments_count').html())+1);
							if (typeof CKEDITOR != 'undefined')
							{
								CKEDITOR.instances['wmd-input'].setData('');
							}if (typeof UE != 'undefined')
							{
								UE.getEditor('wmd-input').setContent('');
							}if (typeof window.wangEditor != 'undefined')
							{
								var E = window.wangEditor;
    							var editor = new E('#wmd-input');
    							editor.create();
								editor.txt.clear();
							}else{
								$('#wmd-input').val('');
							}
							$('.upload-list').html('');
							// 文章
							$('#comment_editor').val('');
							$('#answer_form').detach();
						}
						else if(result.rsm.url)
						{
							window.location = decodeURIComponent(result.rsm.url);
						}
						else
						{
							window.location.reload();
						}
					break;
					case 'consult_commit':
						pay_data.id = result.rsm.id;
						pay_data.price = result.rsm.price;
						showpay();
					break;

					case 'member_commit':
						pay_data.uid = result.rsm.uid
						pay_data.price = result.rsm.price
						// pay_data.url = '/account/ajax/member_before/'
						showpay()
					break;
				}
			}
		}
	},

	// 加载更多
	load_list_view: function(url, selector, container, start_page, callback)
	{
		if (!selector.attr('id'))
		{
			return false;
		}

		if (!start_page)
		{
			start_page = 0
		}

		// 把页数绑定在元素上面
		if (selector.attr('data-page') == undefined)
		{
			selector.attr('data-page', start_page);
		}
		else
		{
			selector.attr('data-page', parseInt(selector.attr('data-page')) + 1);
		}

		selector.bind('click', function ()
		{
			var _this = this;

			$(this).addClass('loading');

			$.get(url + '__page-' + $(_this).attr('data-page'), function (result)
			{
				$(_this).removeClass('loading');

				if ($.trim(result) != '')
				{
					if ($(_this).attr('data-page') == start_page && $(_this).attr('auto-load') != 'false')
					{
						container.html(result);
					}
					else
					{
						container.append(result);
					}

					var new_num = container.find('.ajax_result'+$(_this).attr('data-page')).val();
					var totle_num = container.find('.per_page').val();
					if(parseInt(new_num) < parseInt(totle_num)){
						$(_this).addClass('disabled').unbind('click').bind('click', function () { return false; });
						$(_this).find('span').html(_t('没有更多了'));
					}

					// 页数增加1
					$(_this).attr('data-page', parseInt($(_this).attr('data-page')) + 1);
				}
				else
				{
					//没有内容
					if ($(_this).attr('data-page') == start_page && $(_this).attr('auto-load') != 'false')
					{
						container.html('<p style="padding: 15px 0" align="center">' + _t('没有内容') + '</p>');
					}

					$(_this).addClass('disabled').unbind('click').bind('click', function () { return false; });

					$(_this).find('span').html(_t('没有更多了'));
				}

				if (callback != null)
				{
					callback();
				}
			});

			return false;
		});

		// 自动加载
		if (selector.attr('auto-load') != 'false')
		{
			selector.click();
		}
	},

	// 重新加载评论列表
	reload_comments_list: function(item_id, element_id, type_name)
	{
		$('#aw-comment-box-' + type_name + '-' + element_id + ' .aw-comment-list').html('<p align="center" class="aw-padding10"><i class="aw-loading"></i></p>');

		$.get(G_BASE_URL + '/question/ajax/get_' + type_name + '_comments/' + type_name + '_id-' + item_id, function (data)
		{
			$('#aw-comment-box-' + type_name + '-' + element_id + ' .aw-comment-list').html(data);
		});
	},

	// 警告弹窗
	alert: function (text)
	{
		if ($('.alert-box').length)
		{
			$('.alert-box').remove();
		}

		$('#aw-ajax-box').append(Hogan.compile(AW_TEMPLATE.alertBox).render(
		{
			message: text
		}));

		$(".alert-box").modal('show');
	},

	/**
	 *	公共弹窗
	 *	publish     : 发起
	 *	redirect    : 问题重定向
	 *	imageBox    : 插入图片
	 *	videoBox    : 插入视频
	 *  linkbox     : 插入链接
	 *	commentEdit : 评论编辑
	 *  favorite    : 评论添加收藏
	 *	inbox       : 私信
	 *  report      : 举报问题
	 */
	dialog: function (type, data, callback)
	{   

		switch (type)
		{
			case 'alertImg':
				var template = Hogan.compile(AW_TEMPLATE.alertImg).render(
				{
					'hide': data.hide,
					'url': data.url,
					'message': data.message
				});
			break;

			case 'publish':
				var quick_publish=G_QUICK_PUBLISH_HUMAN_VALID>0?false:true;
				var template = Hogan.compile(AW_TEMPLATE.publishBox).render(
				{
					'category_id': data.category_id,
					'quick_publish': quick_publish,
					'ask_user_id': data.ask_user_id
				});
			break;

			case 'redirect':
				var template = Hogan.compile(AW_TEMPLATE.questionRedirect).render(
				{
					'data_id': data
				});
			break;
			case 'appeal':
				var template = Hogan.compile(AW_TEMPLATE.appeal).render(
				{
					'item_id': data
				});
			break;
			case 'commentEdit':
				var ueditor=editor_type=='ueditor'?true:false;
				var ckeditor=editor_type=='ckeditor'?true:false;
				var wangeditor= (editor_type=='wangeditor' || editor_type=='all' || editor_type=='rich')?true:false;
				var template = Hogan.compile(AW_TEMPLATE.editCommentBox).render(
				{
					'answer_id': data.answer_id,
					'ueditor': ueditor,
					'ckeditor': ckeditor,
					'wangeditor': wangeditor,
					'attach_access_key': data.attach_access_key
				});
			break;

			case 'favorite':
				var template = Hogan.compile(AW_TEMPLATE.favoriteBox).render(
				{
					 'item_id': data.item_id,
					 'item_type': data.item_type
				});
			break;

			case 'inbox':
				var template = Hogan.compile(AW_TEMPLATE.inbox).render(
				{
					'recipient': data
				});
			break;

			case 'report':
			var reson=data.item_reson.split(',');
				var template = Hogan.compile(AW_TEMPLATE.reportBox,'').render(
				{
					'item_type': data.item_type,
					'item_id': data.item_id,
					'item_reson': reson,
				});
			break;
			case 'preview':
				var template = Hogan.compile(AW_TEMPLATE.previewBox,'').render(
					{
						'item_content': data.item_content,
					});
				break;
			case 'topicEditHistory':
				var template = AW_TEMPLATE.ajaxData.replace('{{title}}', _t('编辑记录')).replace('{{data}}', data);
			break;

			case 'ajaxData':
				var template = AW_TEMPLATE.ajaxData.replace('{{title}}', data.title).replace('{{data}}', '<div id="aw_dialog_ajax_data"></div>');
			break;

			case 'imagePreview':
				var template = AW_TEMPLATE.ajaxData.replace('{{title}}', data.title).replace('{{data}}', '<p align="center"><img src="' + data.image + '" alt="" style="max-width:520px" /></p>');
			break;

			case 'confirm':
				var template = Hogan.compile(AW_TEMPLATE.confirmBox).render(
				{
					'message': data.message
				});
			break;

			case 'recommend':
				var template = Hogan.compile(AW_TEMPLATE.recommend).render();
			break;

			// modify by wecenter 活动模块
			case 'projectEventForm':
				var template = Hogan.compile(AW_TEMPLATE.projectEventForm).render(
				{
					'project_id': data.project_id,
					'contact_name': data.contact_name,
					'contact_tel': data.contact_tel,
					'contact_email': data.contact_email
				});
			break;

			case 'projectStockForm':
				var template = Hogan.compile(AW_TEMPLATE.projectStockForm).render(
				{
					'project_id': data.project_id,
					'contact_name': data.contact_name,
					'contact_tel': data.contact_tel,
					'contact_email': data.contact_email
				});
			break;

			case 'activityBox':
				var template = Hogan.compile(AW_TEMPLATE.activityBox).render(
				{
					'contact_name': data.contact_name,
					'contact_tel': data.contact_tel,
					'contact_qq': data.contact_qq
				});

			break;
		}

		if (template)
		{
			if ($('.alert-box').length)
			{
				$('.alert-box').remove();
			}

			$('#aw-ajax-box').html(template).show();

			switch (type)
			{
				case 'redirect' :
					AWS.Dropdown.bind_dropdown_list($('.aw-question-redirect-box #question-input'), 'redirect');
				break;

				case 'inbox' :
					AWS.Dropdown.bind_dropdown_list($('.aw-inbox #invite-input'), 'inbox');
					//私信用户下拉点击事件
					$(document).on('click','.aw-inbox .aw-dropdown-list li a',function() {
						$('.alert-box #quick_publish input.form-control').val($(this).text());
						$(this).parents('.aw-dropdown').hide();
					});
				break;

				case 'publish':
					AWS.Dropdown.bind_dropdown_list($('.aw-publish-box #quick_publish_question_content'), 'publish');
					AWS.Dropdown.bind_dropdown_list($('.aw-publish-box #aw_edit_topic_title'), 'topic');
					if (parseInt(data.category_enable) == 1)
					{
						$.get(G_BASE_URL + '/publish/ajax/fetch_question_category/', function (result)
						{
							AWS.Dropdown.set_dropdown_list('.aw-publish-box .dropdown', eval(result), data.category_id);

							$('.aw-publish-title .dropdown li a').click(function ()
							{
								$('.aw-publish-box #quick_publish_category_id').val($(this).attr('data-value'));
								$('.aw-publish-box #aw-topic-tags-select').html($(this).text());
							});
						});
					}
					else
					{
						$('.aw-publish-box .aw-publish-title').hide();
					}

					if (data.ask_user_id != '' && data.ask_user_id != undefined)
					{
						$('.aw-publish-box .modal-title').html('向 ' + data.ask_user_name + ' 提问');
					}

					if ($('#aw-search-query').val() && $('#aw-search-query').val() != $('#aw-search-query').attr('placeholder'))
					{
						$('#quick_publish_question_content').val($('#aw-search-query').val());
					}

					AWS.Init.init_topic_edit_box('#quick_publish .aw-edit-topic');

					$('#quick_publish .aw-edit-topic').click();

					$('#quick_publish .close-edit').hide();

					if (data.topic_title)
					{
						$('#quick_publish .aw-edit-topic').parents('.aw-topic-bar').prepend('<span class="topic-tag"><a class="text">' + data.topic_title + '</a><a class="close" onclick="$(this).parents(\'.topic-tag\').detach();"><i class="icon icon-delete"></i></a><input type="hidden" value="' + data.topic_title + '" name="topics[]" /></span>')
					}
					if (G_QUICK_PUBLISH_HUMAN_VALID != 0)
					{
						$('#quick_publish_captcha').show();
				        var handlerEmbed = function (captchaObj) {
				            $('#quick_publish_question').click(function(){
				                var validate = captchaObj.getValidate();
				                if (!validate) {
				                    AWS.alert("请先完成验证");
									$('.modal-backdrop').hide();
				                    
				                    return false;
				                } else{
				                    AWS.ajax_post($('#quick_publish'),AWS.ajax_processer, 'publish_question');
				                    captchaObj.reset(); // 调用该接口进行重置 
				                    return false;
				                }

				            });
				            // 将验证码加到id为captcha的元素里，同时会有三个input的值：geetest_challenge, geetest_validate, geetest_seccode
				            captchaObj.appendTo(".quick-embed-captcha");
				            captchaObj.onReady(function () {
				                $(".wait").css('display','none');
				            });
				        };
				        $.ajax({
				            // 获取id，challenge，success（是否启用failback）
				            url: G_BASE_URL+ "/account/slide_captcha/?t=" + (new Date()).getTime()+"&client_type='web'", // 加随机数防止缓存
				            type: "get",
				            dataType: "json",
				            success: function (data) {
				                var dataObj = eval('(' + data.rsm + ')');
				                // 使用initGeetest接口
				                // 参数1：配置参数
				                // 参数2：回调，回调的第一个参数验证码对象，之后可以使用它做appendTo之类的事件
				                initGeetest({
				                    gt: dataObj.gt,
				                    challenge: dataObj.challenge,
				                    new_captcha: dataObj.new_captcha,
				                    offline: !dataObj.success, // 表示用户后台检测极验服务器是否宕机，一般不需要关注
				                    product: "embed", // 产品形式，包括：float，embed，popup。注意只对PC版验证码有效
				                    width: '100%' // 设置按钮宽度, 与父元素宽度一致
				                }, handlerEmbed);
				            }
				        });
					}
				break;

				case 'favorite':
					$.get(G_BASE_URL + '/favorite/ajax/get_favorite_tags/', function (result)
					{
						var html = ''

						$.each(result, function (i, e)
						{
							html += '<li><a data-value="' + e['title'] + '"><span class="title">' + e['title'] + '</span></a><i class="icon icon-followed"></i></li>';
						});

						$('.aw-favorite-tag-list ul').append(html);

						$.post(G_BASE_URL + '/favorite/ajax/get_item_tags/', {
							'item_id' : $('#favorite_form input[name="item_id"]').val(),
							'item_type' : $('#favorite_form input[name="item_type"]').val()
						}, function (result)
						{
							if (result != null)
							{
								$.each(result, function (i, e)
								{
									var index = i;

									$.each($('.aw-favorite-tag-list ul li .title'), function (i, e)
									{
										if ($(this).text() == result[index])
										{
											$(this).parents('li').addClass('active');
										}
									});
								});
							}
						}, 'json');

						$(document).on('click', '.aw-favorite-tag-list ul li', function()
						{
							if ($(this).hasClass('disabled'))
							{
								layer.msg('已收藏');
								return false;
							}

							var tag = $(this).find('a').data('value');
							if ($(this).hasClass('active'))
							{
								$(this).removeClass('active');
								$(this).find('input').remove();
							}else{
								$(this).addClass('active');
								$(this).append('<input type="hidden" value="'+tag+'" name="tags[]">');
							}

						});

					}, 'json');
				break;

				case 'report':
					$('.aw-report-box ul.dropdown-menu li').click(function ()
					{
						$("#aw-report-tags-select").text($(this).attr('value'));
						$('.aw-report-box textarea').text($(this).attr('value'));
					});
				break;

				case 'commentEdit':
					$.get(G_BASE_URL + '/question/ajax/fetch_answer_data/' + data.answer_id, function (result)
					{
                        $('#editor_reply').html(result.answer_content.replace('&amp;', '&'));
                        if(editor_type=='ueditor'){
                        	UE.delEditor('editor_reply');
							var editor = UE.getEditor("editor_reply", {
							    initialFrameHeight :350,
								autoHeightEnabled: false,
							      scaleEnabled:true,
								toolbars: [
									['fullscreen', 'source', 'undo', 'redo','bold','strikethrough','removeformat','pasteplain', '|', 'forecolor', 'backcolor', 'insertorderedlist', 'insertunorderedlist', 'selectall', 'cleardoc','|','fontfamily','fontsize','insertimage','simpleupload','link','emotion','map','justifyleft','justifyright','justifycenter','attachment','insertvideo','insertcode']
								]
							});
						}else if(editor_type=='ckeditor'){
                        	var editor = CKEDITOR.replace( 'editor_reply',{height:350} );
						}else{
							window.wangEditor.attach = {
								init: function(editorSelector,cat){
									$(editorSelector + " .w-e-toolbar").append('<div class="w-e-menu"><input id="_upfile" type="file" style="display:none;" onchange="window.wangEditor.attach.callback(this.files[0],\''+cat+'\')" /><a class="_wangEditor_btn_fullscreen" href="javascript:;" onclick="window.wangEditor.attach.upfile()"><i title="上传附件" class="w-e-icon-upload2"></i></a></div>');
								},
								upfile:function(){
									if(!upload_ass){
										layer.msg('没有上传权限');
									}else{

										$("#_upfile").click();
									}
								},
								callback:function(files,cat){
									const $file = $('#_upfile');
									const fileElem = $file[0];
									const fileList = fileElem.files;
									const uploadImg = editor.uploadImg;
									editor.customConfig.uploadImgServer= "/?/explore/doact/?p=editor&a=upload_file&cat="+cat;
									uploadImg.uploadFile(fileList);

								}
							};

							$('#editor_reply').empty();
							$('#_wangcontent').html(result.answer_content.replace('&amp;', '&'));
							var E = window.wangEditor;
							var $text1 = $('#_wangcontent');
							var editor = new E('#editor_reply');
							editor.customConfig.onchange = function (html)
							{
								$text1.val(html);
							};
							editor.customConfig.codeType={
								title:"选择代码类型:",
								type:[
									"Nginx.conf","Lua","Bash/Shell","C/C++","Php","C#","Java","Css","Sql","Html"
								]
							};
							editor.customConfig.uploadImgServer = G_BASE_URL+"/explore/doact/?p=editor&a=upload_file&cat=answer";
							editor.customConfig.onchangeTimeout = 1;
							editor.customConfig.uploadFileName = 'upload[]';
							editor.customConfig.uploadImgMaxLength = 5;
							editor.customConfig.uploadImgHooks = {
								customInsert: function (insertImg, result, editor) {
									const data = result.data;
									var newData = Object.keys(data).map(function(i){return data[i]});
									for(var j=0;j<newData.length;j++){
										insertImg(newData[j]);
									}
								},
								fail: function (xhr, editor, result) {
									if(result.error){
										layer.msg(result.msg);
										return false;
									}
								},
								error: function error(xhr, editor) {
								},
							};
							editor.customConfig.uploadVideoServer = G_BASE_URL+"/explore/doact/?p=editor&a=upload_file&cat=answer";
							editor.customConfig.uploadVideoHooks = {
								customInsert: function (insertVideo, result) {
									if (result.errno === 0) {
										insertVideo(result.data);
									} else {
										layer.msg(result.msg);
									}
								}
							};
							editor.create();
							editor.txt.html($text1.val());
							E.attach.init('#editor_reply',"answer");
							//E.fullscreen.init(editor);
						}
					}, 'json');
				break;

				case 'ajaxData':
					$.get(data.url, function (result) {
						$('#aw_dialog_ajax_data').html(result);
					});
				break;

				case 'confirm':
					$('.aw-confirm-box .yes').click(function()
					{
						if (callback)
						{
							callback();
						}

						$(".alert-box").modal('hide');

						return false;
					});
				break;

				case 'recommend':
					$.get(G_BASE_URL + '/help/ajax/list/', function (result)
					{
						if (result && result != 0)
						{
							var html = '';

							$.each(result, function (i, e)
							{
								html += '<li class="aw-border-radius-5"><img class="aw-border-radius-5" src="' + e.icon + '"><a data-id="' + e.id + '" class="aw-hide-txt">' + e.title + '</a><i class="icon icon-followed"></i></li>'
							});

							$('.aw-recommend-box ul').append(html);

							$.each($('.aw-recommend-box ul li'), function (i, e)
							{
								if (data.focus_id == $(this).find('a').attr('data-id'))
								{
									$(this).addClass('active');
								}
							});

							$(document).on('click', '.aw-recommend-box ul li a', function()
							{
								var _this = $(this), url = G_BASE_URL + '/help/ajax/add_data/', removeClass = false;

								if ($(this).parents('li').hasClass('active'))
								{
									url =  G_BASE_URL + '/help/ajax/remove_data/';

									removeClass = true;
								}

								$.post(url,
								{
									'item_id' : data.item_id,
									'id' : _this.attr('data-id'),
									'title' : _this.text(),
									'type' : data.type
								}, function (result)
								{
									if (result.errno == 1)
									{
										if (removeClass)
										{
											_this.parents('li').removeClass('active');
										}
										else
										{
											$('.aw-recommend-box ul li').removeClass('active');

											_this.parents('li').addClass('active');
										}
									}
								}, 'json');
							});
						}
						else
						{
							$('.error_message').html(_t('请先去后台创建好章节'));

							if ($('.error_message').css('display') != 'none')
							{
								AWS.shake($('.error_message'));
							}
							else
							{
								$('.error_message').fadeIn();
							}
						}
					}, 'json');
				break;
			}

			$(".alert-box").modal('show');
		}
	},

	// 兼容placeholder
	check_placeholder: function(selector)
	{
		$.each(selector, function()
		{
			if (typeof ($(this).attr("placeholder")) != "undefined")
			{
				$(this).attr('data-placeholder', 'true');

				if ($(this).val() == '')
				{
					$(this).addClass('aw-placeholder').val($(this).attr("placeholder"));
				}

				$(this).focus(function () {
					if ($(this).val() == $(this).attr('placeholder'))
					{
						$(this).removeClass('aw-placeholder').val('');
					}
				});

				$(this).blur(function () {
					if ($(this).val() == '')
					{
						$(this).addClass('aw-placeholder').val($(this).attr('placeholder'));
					}
				});
			}
		});
	},

	// 回复背景高亮
	hightlight: function(selector, class_name)
	{
		if (selector.hasClass(class_name))
		{
			return true;
		}

		var hightlight_timer_front = setInterval(function ()
		{
			selector.addClass(class_name);
		}, 500);

		var hightlight_timer_background = setInterval(function ()
		{
			selector.removeClass(class_name);
		}, 600);

		setTimeout(function ()
		{
			clearInterval(hightlight_timer_front);
			clearInterval(hightlight_timer_background);

			selector.addClass(class_name);
		}, 1200);

		setTimeout(function ()
		{
			selector.removeClass(class_name);
		}, 6000);
	},

	nl2br: function(str)
	{
		return str.replace(new RegExp("\r\n|\n\r|\r|\n", "g"), "<br />");
	},

	content_switcher: function(hide_el, show_el)
	{
		hide_el.hide();
		show_el.fadeIn();
	},

	htmlspecialchars: function(text)
	{
		return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
	},

	/*
	 * 用户头像提示box效果
	 *  @params
	 *  type : user/topic
	 *	nTop    : 焦点到浏览器上边距
	 *	nRight  : 焦点到浏览器右边距
	 *	nBottom : 焦点到浏览器下边距
	 *	left    : 焦点距离文档左偏移量
	 *	top     : 焦点距离文档上偏移量
	 **
	 */
	show_card_box: function(selector, type, time) //selector -> .aw-user-name/.topic-tag
	{
		if (!time)
		{
			var time = 300;
		}

		$(document).on('mouseover', selector, function ()
		{
			clearTimeout(AWS.G.card_box_hide_timer);
			var _this = $(this);
			AWS.G.card_box_show_timer = setTimeout(function ()
			{
				//判断用户id or 话题id 是否存在
				if (_this.attr('data-id'))
				{
					 switch (type)
					{
						case 'user' :
							//检查是否有缓存
							if (AWS.G.cashUserData.length == 0)
							{
								_getdata('user', '/people/ajax/user_info/uid-');
							}
							else
							{
								var flag = 0;
								//遍历缓存中是否含有此id的数据
								_checkcash('user');
								if (flag == 0)
								{
									_getdata('user', '/people/ajax/user_info/uid-');
								}
							}
						break;

						case 'topic' :
							//检查是否有缓存
							if (AWS.G.cashTopicData.length == 0)
							{
								_getdata('topic', '/topic/ajax/topic_info/topic_id-');
							}
							else
							{
								var flag = 0;
								//遍历缓存中是否含有此id的数据
								_checkcash('topic');
								if (flag == 0)
								{
									_getdata('topic', '/topic/ajax/topic_info/topic_id-');
								}
							}
						break;
					}
				}

				//获取数据
				function _getdata(type, url)
				{
					if (type == 'user')
					{
						$.get(G_BASE_URL + url + _this.attr('data-id'), function(result)
						{
							var focus = result.focus, verified = result.verified, focusTxt;

							if (focus == 1)
							{
								focus = 'active';
								focusTxt = _t('取消关注');
							}
							else
							{
								focus = '';
								focusTxt = _t('关注');
							}

							if(result.verified == 'enterprise')
							{
								verified_enterprise = 'icon-v i-ve';
								verified_title = _t('企业认证');
							}
							else if(result.verified == 'personal')
							{
								verified_enterprise = 'icon-v';
								verified_title = _t('个人认证');
							}
							else
							{
								verified_enterprise = verified_title = '';
							}
							user_honors_class = '';
							if(result.user_verified && result.verified)
							{
								user_honors = '';
								if(result.user_honors){
									honors = result.user_honors.split('|');
									for(x in honors){
										user_honors += "{'title':'" + honors[x] + "'},";
									}
								}
								user_honors_class = 'user-rank';
							}else if(result.user_verified && !result.verified){

								//user_honors = "{'title':'"+result.user_honors+"'}";
								user_honors = '';
								if(result.user_honors){
									honors = result.user_honors.split('|');
									for(x in honors){
										user_honors += "{'title':'" + honors[x] + "'},";
									}
								}
								user_honors_class = 'user-no-rank';
							}else{
								user_honors = '';
							}

							//动态插入盒子
							$('#aw-ajax-box').html(Hogan.compile(AW_TEMPLATE.userCard).render(
							{
								'user_honors_class' : user_honors_class,
								'user_honors' : eval('[' + user_honors + ']'),
								'verified_enterprise' : verified_enterprise,
								'verified_title' : verified_title,
								'uid': result.uid,
								'avatar_file': result.avatar_file,
								'user_name': result.user_name,
								'reputation': result.reputation,
								'agree_count': result.agree_count,
								'signature': result.signature,
								'url' : result.url,
								'category_enable' : result.category_enable,
								'focus': focus,
								'focusTxt': focusTxt,
								'ask_name': "'" + result.user_name + "'",
								'fansCount': result.fans_count
							}));

							//判断是否为游客or自己
							if (G_USER_ID == '' || G_USER_ID == result.uid || result.uid < 0)
							{
								$('#aw-card-tips .mod-footer').hide();
							}
							_init();
							//缓存
							AWS.G.cashUserData.push($('#aw-ajax-box').html());
						}, 'json');
					}
					if (type == 'topic')
					{
						$.get(G_BASE_URL + url + _this.attr('data-id'), function(result)
						{
							var focus = result.focus,
								focusTxt;
								if (focus == false)
								{
									focus = '';
									focusTxt = _t('关注');
								}
								else
								{
									focus = 'active';
									focusTxt = _t('取消关注');
								}
								//动态插入盒子
								$('#aw-ajax-box').html(Hogan.compile(AW_TEMPLATE.topicCard).render(
								{
									'topic_id': result.topic_id,
									'topic_pic': result.topic_pic,
									'topic_title': result.topic_title,
									'topic_description': result.topic_description,
									'discuss_count': result.discuss_count,
									'focus_count': result.focus_count,
									'focus': focus,
									'focusTxt': focusTxt,
									'url' : result.url,
									'fansCount': result.fans_count
								}));
								//判断是否为游客
								if (G_USER_ID == '')
								{
									$('#aw-card-tips .mod-footer .follow').hide();
								}
								_init();
								//缓存
								AWS.G.cashTopicData.push($('#aw-ajax-box').html());
						}, 'json');
					}
				}

				//检测缓存
				function _checkcash(type)
				{
					if (type == 'user')
					{
						$.each(AWS.G.cashUserData, function (i, a)
						{
							if (a.match('data-id="' + _this.attr('data-id') + '"'))
							{
								$('#aw-ajax-box').html(a);
								$('#aw-card-tips').removeAttr('style');
								_init();
								flag = 1;
							}
						});
					}
					if (type == 'topic')
					{

						$.each(AWS.G.cashTopicData, function (i, a)
						{
							if (a.match('data-id="' + _this.attr('data-id') + '"'))
							{
								$('#aw-ajax-box').html(a);
								$('#aw-card-tips').removeAttr('style');
								_init();
								flag = 1;
							}
						});
					}
				}

				//初始化
				function _init()
				{
					var left = _this.offset().left,
						top = _this.offset().top + _this.height() + 5,
						nTop = _this.offset().top - $(window).scrollTop();

					//判断下边距离不足情况
					if (nTop + $('#aw-card-tips').innerHeight() > $(window).height())
					{
						top = _this.offset().top - ($('#aw-card-tips').innerHeight()) - 10;
					}

					//判断右边距离不足情况
					if (left + $('#aw-card-tips').innerWidth() > $(window).width())
					{
						left = _this.offset().left - $('#aw-card-tips').innerWidth() + _this.innerWidth();
					}

					$('#aw-card-tips').css(
					{
						left: left,
						top: top
					}).fadeIn();
				}
			}, time);
		});

		$(document).on('mouseout', selector, function ()
		{
			clearTimeout(AWS.G.card_box_show_timer);
			AWS.G.card_box_hide_timer = setTimeout(function ()
			{
				$('#aw-card-tips').fadeOut();
			}, 600);
		});
	},

	// @人功能
	at_user_lists: function(selector, limit) {
		$(selector).keyup(function (e) {
			var _this = $(this),
				flag = _getCursorPosition($(this)[0]).start;
			if ($(this).val().charAt(flag - 1) == '@')
			{
				_init();
				$('#aw-ajax-box .content_cursor').html($(this).val().substring(0, flag));
			} else
			{
				var lis = $('.aw-invite-dropdown li');
				switch (e.which)
				{
					case 38:
						var _index;
						if (!lis.hasClass('active'))
						{
							lis.eq(lis.length - 1).addClass('active');
						}
						else
						{
							$.each(lis, function (i, e)
							{
								if ($(this).hasClass('active'))
								{
									$(this).removeClass('active');
									if ($(this).index() == 0)
									{
										_index = lis.length - 1;
									}
									else
									{
										_index = $(this).index() - 1;
									}
								}
							});
							lis.eq(_index).addClass('active');
						}
						break;
					case 40:
						var _index;
						if (!lis.hasClass('active'))
						{
							lis.eq(0).addClass('active');
						}
						else
						{
							$.each(lis, function (i, e)
							{
								if ($(this).hasClass('active'))
								{
									$(this).removeClass('active');
									if ($(this).index() == lis.length - 1)
									{
										_index = 0;
									}
									else
									{
										_index = $(this).index() + 1;
									}
								}
							});
							lis.eq(_index).addClass('active');
						}
						break;
					case 13:
						$.each($('.aw-invite-dropdown li'), function (i, e)
						{
							if ($(this).hasClass('active'))
							{
								$(this).click();
							}
						});
						break;
					default:
						if ($('.aw-invite-dropdown')[0])
						{
							var ti = 0;
							for (var i = flag; i > 0; i--)
							{
								if ($(this).val().charAt(i) == "@")
								{
									ti = i;
									break;
								}
							}
							$.get(G_BASE_URL + '/search/ajax/search/?type=users&q=' + encodeURIComponent($(this).val().substring(flag, ti).replace('@', '')) + '&limit=' + limit, function (result)
							{
								if ($('.aw-invite-dropdown')[0])
								{
									if (result.length != 0)
									{
										var html = '';

										$('.aw-invite-dropdown').html('');

										$.each(result, function (i, a)
										{
											html += '<li><img src="' + a.detail.avatar_file + '"/><a>' + a.name + '</a></li>'
										});

										$('.aw-invite-dropdown').append(html);

										_display();

										$('.aw-invite-dropdown li').click(function ()
										{
											_this.val(_this.val().substring(0, ti) + '@' + $(this).find('a').html() + " ").focus();
											$('.aw-invite-dropdown').detach();
										});
									}
									else
									{
										$('.aw-invite-dropdown').hide();
									}
								}
								if (_this.val().length == 0)
								{
									$('.aw-invite-dropdown').hide();
								}
							}, 'json');
						}
				}
			}
		});

		$(selector).keydown(function (e) {
			var key = e.which;
			if ($('.aw-invite-dropdown').is(':visible')) {
				if (key == 38 || key == 40 || key == 13) {
					return false;
				}
			}
		});

		//初始化插入定位符
		function _init() {
			if (!$('.content_cursor')[0]) {
				$('#aw-ajax-box').append('<span class="content_cursor"></span>');
			}
			$('#aw-ajax-box').find('.content_cursor').css({
				'left': parseInt($(selector).offset().left + parseInt($(selector).css('padding-left')) + 2),
				'top': parseInt($(selector).offset().top + parseInt($(selector).css('padding-left')))
			});
			if (!$('.aw-invite-dropdown')[0])
			{
				$('#aw-ajax-box').append('<ul class="aw-invite-dropdown"></ul>');
			}
		};

		//初始化列表和三角型
		function _display() {
			$('.aw-invite-dropdown').css({
				'left': $('.content_cursor').offset().left + $('.content_cursor').innerWidth(),
				'top': $('.content_cursor').offset().top + 24
			}).show();
		};

		//获取当前textarea光标位置
		function _getCursorPosition(textarea)
		{
			var rangeData = {
				text: "",
				start: 0,
				end: 0
			};

			textarea.focus();

			if (textarea.setSelectionRange) { // W3C
				rangeData.start = textarea.selectionStart;
				rangeData.end = textarea.selectionEnd;
				rangeData.text = (rangeData.start != rangeData.end) ? textarea.value.substring(rangeData.start, rangeData.end) : "";
			} else if (document.selection) { // IE
				var i,
					oS = document.selection.createRange(),
					// Don't: oR = textarea.createTextRange()
					oR = document.body.createTextRange();
				oR.moveToElementText(textarea);

				rangeData.text = oS.text;
				rangeData.bookmark = oS.getBookmark();

				// object.moveStart(sUnit [, iCount])
				// Return Value: Integer that returns the number of units moved.
				for (i = 0; oR.compareEndPoints('StartToStart', oS) < 0 && oS.moveStart("character", -1) !== 0; i++) {
					// Why? You can alert(textarea.value.length)
					if (textarea.value.charAt(i) == '\n') {
						i++;
					}
				}
				rangeData.start = i;
				rangeData.end = rangeData.text.length + rangeData.start;
			}

			return rangeData;
		};
	},

	// 错误提示效果
	shake: function(selector)
	{
		var length = 6;
		selector.css('position', 'relative');
		for (var i = 1; i <= length; i++)
		{
			if (i % 2 == 0)
			{
				if (i == length)
				{
					selector.animate({ 'left': 0 }, 50);
				}
				else
				{
					selector.animate({ 'left': 10 }, 50);
				}
			}
			else
			{
				selector.animate({ 'left': -10 }, 50);
			}
		}
	}
}

// 全局变量
AWS.G =
{
	cashUserData: [],
	cashTopicData: [],
	card_box_hide_timer: '',
	card_box_show_timer: '',
	dropdown_list_xhr: '',
	loading_timer: '',
	loading_bg_count: 12,
	loading_mini_bg_count: 9,
	notification_timer: ''
}

AWS.User =
{

	// 关注
	follow: function(selector, type, data_id ,status)
	{   
		if (selector.html())
		{   
			if(status){
				
				if (selector.hasClass('active'))
				{
					selector.find('span').html(_t('关注'));
					
				}
				else
				{
					selector.find('span').html(_t('取消关注'));
				}

			}else
			{   
				if (selector.hasClass('active'))
				{
					selector.find('span').html(_t('关注'));

					selector.find('b').html(parseInt(selector.find('b').html()) - 1);
				}
				else
				{
					selector.find('span').html(_t('取消关注'));

					selector.find('b').html(parseInt(selector.find('b').html()) + 1);
				}
				
			}
			
		}
		else
		{
			if (selector.hasClass('active'))
			{
				selector.attr('data-original-title', _t('关注'));
			}
			else
			{
				selector.attr('data-original-title', _t('取消关注'));
			}
		}

		selector.addClass('disabled');
        
		switch (type)
		{
			case 'question':
				var url = '/question/ajax/focus/';

				var data = {
					'question_id': data_id
				};

				break;

			case 'topic':
				var url = '/topic/ajax/focus_topic/';

				var data = {
					'topic_id': data_id
				};

				break;

			case 'user':
				var url = '/follow/ajax/follow_people/';

				var data = {
					'uid': data_id
				};

				break;

			case 'column':
				var url = '/column/ajax/focus_column/';

				var data = {
					'column_id': data_id
				};

				break;
		}

		$.post(G_BASE_URL + url, data, function (result)
		{
			if (result.errno == 1)
			{
				if (result.rsm.type == 'add')
				{
					selector.addClass('active');
				}
				else
				{
					selector.removeClass('active');
				}
			}
			else
			{
				if (result.err)
				{
					AWS.alert(result.err);
				}

				if (result.rsm.url)
				{
					window.location = decodeURIComponent(result.rsm.url);
				}
			}

			selector.removeClass('disabled');

		}, 'json');
	},

	share_out: function(options)
	{
		var url = options.url || window.location.href, pic = '';

		if (options.title)
		{
			var title = options.title + ' - ' + G_SITE_NAME;
		}
		else
		{
			var title = $('title').text();
		}

		shareURL = 'http://www.jiathis.com/send/?webid=' + options.webid + '&url=' + url + '&title=' + title +'';

		if (options.content)
		{
			if ($(options.content).find('img').length)
			{
				shareURL = shareURL + '&pic=' + $(options.content).find('img').eq(0).attr('src');
			}
		}

		window.open(shareURL);
	},

	// 删除草稿
	delete_draft: function(item_id, type)
	{
		if (type == 'clean')
		{
			$.post(G_BASE_URL + '/account/ajax/delete_draft/', 'type=' + type, function (result)
			{
				if (result.errno != 1)
				{
					AWS.alert(result.err);
				}
                window.location.reload();
			}, 'json');
		}
		else
		{
			$.post(G_BASE_URL + '/account/ajax/delete_draft/', 'item_id=' + item_id + '&type=' + type, function (result)
			{
				if (result.errno != 1)
				{
					AWS.alert(result.err);
				}
                window.location.reload();
				
			}, 'json');
		}
	},

	// 赞成投票
	agree_vote: function(selector, user_name, answer_id)
	{
		$.post(G_BASE_URL + '/question/ajax/answer_vote/', 'answer_id=' + answer_id + '&value=1');

		// 判断是否投票过
		if ($(selector).parents('.aw-item').find('.aw-agree-by').text().match(user_name))
		{
			$.each($(selector).parents('.aw-item').find('.aw-user-name'), function (i, e)
			{
				if ($(e).html() == user_name)
				{
					if ($(e).prev())
					{
						$(e).prev().remove();
					}
					else
					{
						$(e).next().remove();
					}

					$(e).remove();
				}
			});

			$(selector).removeClass('active');

			if (parseInt($(selector).parents('.operate').find('.count').html()) != 0)
			{
				$(selector).parents('.operate').find('.count').html(parseInt($(selector).parents('.operate').find('.count').html()) - 1);
			}

			if ($(selector).parents('.aw-item').find('.aw-agree-by a').length == 0)
			{
				$(selector).parents('.aw-item').find('.aw-agree-by').hide();
			}
		}
		else
		{
			// 判断是否第一个投票
			if ($(selector).parents('.aw-item').find('.aw-agree-by .aw-user-name').length == 0)
			{
				$(selector).parents('.aw-item').find('.aw-agree-by').empty().append('赞同来自:<a class="aw-user-name">' + user_name + '</a>');
			}
			else
			{
				$(selector).parents('.aw-item').find('.aw-agree-by').append('<em>、</em><a class="aw-user-name">' + user_name + '</a>');
			}

			$(selector).parents('.operate').find('.count').html(parseInt($(selector).parents('.operate').find('.count').html()) + 1);

			$(selector).parents('.aw-item').find('.aw-agree-by').show();

			$(selector).parents('.operate').find('a.active').removeClass('active');

			$(selector).addClass('active');
		}
	},

	// 反对投票
	disagree_vote: function(selector, user_name, answer_id)
	{
		$.post(G_BASE_URL + '/question/ajax/answer_vote/', 'answer_id=' + answer_id + '&value=-1', function (result) {});

		if ($(selector).hasClass('active'))
		{
			$(selector).removeClass('active');
		}
		else
		{
			// 判断是否有赞同过
			if ($(selector).parents('.operate').find('.agree').hasClass('active'))
			{
				// 删除赞同操作
				$.each($(selector).parents('.aw-item').find('.aw-user-name'), function (i, e)
				{
					if ($(e).html() == user_name)
					{
						if ($(e).prev('em'))
						{
							$(e).prev('em').remove();
						}
						else
						{
							$(e).next('em').remove();
						}

						$(e).remove();
					}
				});

				// 判断赞同来自内是否有人
				if ($(selector).parents('.aw-item').find('.aw-agree-by a').length == 0)
				{
					$(selector).parents('.aw-item').find('.aw-agree-by').hide();
				}

				$(selector).parents('.operate').find('.count').html(parseInt($(selector).parents('.operate').find('.count').html()) - 1);

				$(selector).parents('.operate').find('.agree').removeClass('active');

				$(selector).addClass('active');
			}
			else
			{
				$(selector).addClass('active');
			}
		}
	},

	// 问题不感兴趣
	question_uninterested: function(selector, question_id)
	{
		selector.fadeOut();

		$.post(G_BASE_URL + '/question/ajax/uninterested/', 'question_id=' + question_id, function (result)
		{
			if (result.errno != '1')
			{
				AWS.alert(result.err);
			}
		}, 'json');
	},

	// 回复折叠
	answer_force_fold: function(selector, answer_id)
	{
		$.post(G_BASE_URL + '/question/ajax/answer_force_fold/', 'answer_id=' + answer_id, function (result) {
			if (result.errno != 1)
			{
				AWS.alert(result.err);
			}
			else if (result.errno == 1)
			{
				if (result.rsm.action == 'fold')
				{
					selector.attr("title", '撤消折叠');
				}
				else
				{
					selector.attr("title", '折叠');
				}
			}
		}, 'json');
	},

	// 删除别人邀请我回复的问题
	question_invite_delete: function(selector, question_invite_id)
	{
		$.post(G_BASE_URL + '/question/ajax/question_invite_delete/', 'question_invite_id=' + question_invite_id, function (result)
		{
			if (result.errno == 1)
			{
				selector.fadeOut();
			}
			else
			{
				AWS.alert(result.rsm.err);
			}
		}, 'json');
	},

	// 邀请用户回答问题
	invite_user: function(selector, img)
	{
		$.post(G_BASE_URL + '/question/ajax/save_invite/',
		{
			'question_id': QUESTION_ID,
			'uid': selector.attr('data-id')
		}, function (result)
		{
			if (result.errno != -1)
			{
				if (selector.parents('.aw-invite-box').find('.invite-list a').length == 0)
				{
					selector.parents('.aw-invite-box').find('.invite-list').show();
				}
				var a='<em onclick="AWS.ajax_request(G_BASE_URL+\'/question/ajax/cancel_question_invite/question_id-'+QUESTION_ID+'__recipients_uid-'+selector.attr('data-id')+'\')" data-original-title="'+ selector.attr('data-value') +'" title="撤销邀请" style="color:red;position: relative;top: -10px;right: -25px;cursor: pointer;">X</em>';
				selector.parents('.aw-invite-box').find('.invite-list').append(a+' <a class="text-color-999 invite-list-user" data-toggle="tooltip" data-placement="bottom" data-original-title="'+ selector.attr('data-value') +'"><img src='+ img +' /></a>');
				selector.addClass('active').attr('onclick','AWS.User.disinvite_user($(this))').text('取消邀请');
				selector.parents('.aw-question-detail').find('.aw-invite-replay .badge').text(parseInt(selector.parents('.aw-question-detail').find('.aw-invite-replay .badge').text()) + 1);
			}
			else if (result.errno == -1)
			{
				AWS.alert(result.err);
			}
		}, 'json');
	},

	// 取消邀请用户回答问题
	disinvite_user: function(selector)
	{
		$.get(G_BASE_URL + '/question/ajax/cancel_question_invite/question_id-' + QUESTION_ID + "__recipients_uid-" + selector.attr('data-id'), function (result)
		{
			if (result.errno != -1)
			{
				$.each($('.aw-question-detail .invite-list a'), function (i, e)
				{
					if ($(this).attr('data-original-title') == selector.parents('.main').find('.aw-user-name').text())
					{
						$(this).detach();
					}
				});

				$.each($('.aw-question-detail .invite-list em'), function (i, e)
				{
					if($(this).attr('data-original-title') == selector.parents('.main').find('.aw-user-name').text())
					{
						$(this).detach();
					}
				});

				selector.removeClass('active').attr('onclick','AWS.User.invite_user($(this),$(this).parents(\'li\').find(\'img\').attr(\'src\'))').text('邀请');
				selector.parents('.aw-question-detail').find('.aw-invite-replay .badge').text(parseInt(selector.parents('.aw-question-detail').find('.aw-invite-replay .badge').text()) - 1);
				if (selector.parents('.aw-invite-box').find('.invite-list').children().length == 0)
				{
					selector.parents('.aw-invite-box').find('.invite-list').hide();
				}
			}
		});
	},

	// 问题感谢
	question_thanks: function(selector, question_id)
	{
		$.post(G_BASE_URL + '/question/ajax/question_thanks/', 'question_id=' + question_id, function (result)
		{
			if (result.errno != 1)
			{
				AWS.alert(result.err);
			}
			else if (result.rsm.action == 'add')
			{
				selector.html(selector.html().replace(_t('感谢'), _t('已感谢')));
				selector.removeAttr('onclick');
			}
			else
			{
				selector.html(selector.html().replace(_t('已感谢'), _t('感谢')));
			}
		}, 'json');
	},

	// 感谢评论回复者
	answer_user_rate: function(selector, type, answer_id)
	{
		$.post(G_BASE_URL + '/question/ajax/question_answer_rate/', 'type=' + type + '&answer_id=' + answer_id, function (result)
		{
			if (result.errno != 1)
			{
				AWS.alert(result.err);
			}
			else if (result.errno == 1)
			{
				switch (type)
				{
				case 'thanks':
					if (result.rsm.action == 'add')
					{
						selector.html(selector.html().replace(_t('感谢'), _t('已感谢')));
						selector.removeAttr('onclick');
					}
					else
					{
						selector.html(selector.html().replace(_t('已感谢'), _t('感谢')));
					}
					break;

				case 'uninterested':
					if (result.rsm.action == 'add')
					{
						selector.html(selector.html().replace(_t('没有帮助'), _t('撤消没有帮助')));
					}
					else
					{
						selector.html(selector.html().replace(_t('撤消没有帮助'), _t('没有帮助')));
					}
					break;
				}
			}
		}, 'json');
	},

	// 提交评论
	save_comment: function(selector)
	{
		selector.addClass('disabled');

		AWS.ajax_post(selector.parents('form'), AWS.ajax_processer, 'comments_form');
	},

	// 删除评论
	remove_comment: function(selector, type, comment_id)
	{
		var sslet=selector.parents('.aw-item').find('.aw-add-comment');
		$.get(G_BASE_URL + '/question/ajax/remove_comment/type-' + type + '__comment_id-' + comment_id);
			if(type=='question')
			sslet.removeClass('active').html('<i class="icon icon-comment"></i> '+(parseInt(sslet.text())-1)+' 条评论');	
				else
			sslet.removeClass('active').html('<i class="icon icon-comment"></i> '+(parseInt(sslet.text())-1));	
			selector.parents('.aw-comment-box li').fadeOut();

	},

	// 文章赞同
	article_vote: function(selector, article_id, rating)
	{
		AWS.loading('show');

		if (selector.hasClass('active'))
		{
			var rating = 0;
		}

		$.post(G_BASE_URL + '/article/ajax/article_vote/', 'type=article&item_id=' + article_id + '&rating=' + rating, function (result) {

			AWS.loading('hide');

			if (result.errno != 1)
			{
				AWS.alert(result.err);
			}
			else
			{
				if (rating == 0)
				{
					selector.removeClass('active').find('b').html(parseInt(selector.find('b').html()) - 1);
				}
				else if (rating == -1)
				{
					if (selector.parents('.aw-article-vote').find('.agree').hasClass('active'))
					{
						selector.parents('.aw-article-vote').find('b').html(parseInt(selector.parents('.aw-article-vote').find('b').html()) - 1);
						selector.parents('.aw-article-vote').find('a').removeClass('active');
					}

					selector.addClass('active');
				}
				else
				{
					selector.parents('.aw-article-vote').find('a').removeClass('active');
					selector.addClass('active').find('b').html(parseInt(selector.find('b').html()) + 1);
				}
			}
			window.location.reload();
		}, 'json');
	},

	// 文章评论赞同
	article_comment_vote: function(selector, comment_id, rating)
	{
		AWS.loading('show');

		if (selector.hasClass('active'))
		{
			var rating = 0;
		}

		$.post(G_BASE_URL + '/article/ajax/article_vote/', 'type=comment&item_id=' + comment_id + '&rating=' + rating, function (result)
		{
			AWS.loading('hide');

			if (result.errno != 1)
			{
				AWS.alert(result.err);
			}
			else
			{
				var agree_num = parseInt(selector.html().replace(/[^0-9]/ig,""));

				if (rating == 0)
				{
					
					var selectorhtml = selector.html().replace(_t('我已赞'), _t('赞'));
					
					selector.html(selectorhtml.replace(agree_num, (agree_num-1))).removeClass('active');
					
				}
				else
				{
					var selectorhtml = selector.html().replace(_t('赞'), _t('我已赞'));
					
					selector.html(selectorhtml.replace(agree_num, (agree_num+1))).addClass('active');
					
				}
			}
		}, 'json');
	},

	// 创建收藏标签
	add_favorite_tag: function()
	{
		var tag = $('#favorite_form .add-input').val();
		if(!tag){
			layer.msg('请输入标签名字');
			return false;
		}
		$('.aw-favorite-tag-list ul').prepend('<li class="active"><input type="hidden" value="'+tag+'" name="tags[]"><a data-value="' + tag + '"><span class="title">' + tag + '</span></a><i class="icon icon-followed"></i></li>');
	
		$('#favorite_form .add-input').val('');

	},
	add_favorite_success: function(formEl, type)
	{
		var taglist = $('.aw-favorite-tag-list ul').html();
		if(!taglist){
			layer.msg('请先创建标签');
			return false;
		}
        var custom_data = {
			_post_type: 'ajax'
		};

		formEl.ajaxSubmit(
		{
			dataType: 'json',
			data: custom_data,
			success: function (result)
			{
				layer.msg(result.err);
				if (result.errno == 1)
				{
					$('#aw-ajax-box,.modal-backdrop ').hide();
					window.location.reload();
				}

				
			},
			error: function (error)
			{
				if ($.trim(error.responseText) != '')
				{
					AWS.loading('hide');

					alert(_t('发生错误, 返回的信息:') + ' ' + error.responseText);
				}
				else if (error.status == 0)
				{
					AWS.loading('hide');

					alert(_t('网络链接异常'));
				}
				else if (error.status == 500)
				{
					AWS.loading('hide');

					alert(_t('内部服务器错误'));
				}
			}
		});
	},
}

AWS.Dropdown =
{
	// 下拉菜单功能绑定
	bind_dropdown_list: function(selector, type)
	{
		if (type == 'search')
		{
			$(selector).focus(function()
			{
				$(selector).parent().find('.aw-dropdown').show();
			});
		}
		$(selector).bind('input propertychange',function(e)
		{
			if (type == 'search')
			{
				$(selector).parent().find('.search').show().children('a').text($(selector).val());
			}
			if ($(selector).val().length >= 1)
			{
				if (e.which != 38 && e.which != 40 && e.which != 188 && e.which != 13)
				{
					AWS.Dropdown.get_dropdown_list($(this), type, $(selector).val());
				}
			}
			else
			{
			   $(selector).parent().find('.aw-dropdown').hide();
			}

			if (type == 'topic')
			{
				// 逗号或回车提交
				if (e.which == 188)
				{
					if ($('.aw-edit-topic-box #aw_edit_topic_title').val() != ',')
					{
						$('.aw-edit-topic-box #aw_edit_topic_title').val( $('.aw-edit-topic-box #aw_edit_topic_title').val().substring(0,$('.aw-edit-topic-box #aw_edit_topic_title').val().length-1));
						$('.aw-edit-topic-box .aw-dropdown').hide();
						$('.aw-edit-topic-box .add').click();
					}
					return false;
				}

				// 回车提交
				if (e.which == 13)
				{
					$('.aw-edit-topic-box .aw-dropdown').hide();
					$('.aw-edit-topic-box .add').click();
					return false;
				}

				var lis = $(selector).parent().find('.aw-dropdown-list li');

				//键盘往下
				if (e.which == 40 && lis.is(':visible'))
				{
					var _index;
					if (!lis.hasClass('active'))
					{
						lis.eq(0).addClass('active');
					}
					else
					{
						$.each(lis, function (i, e)
						{
							if ($(this).hasClass('active'))
							{
								$(this).removeClass('active');
								if ($(this).index() == lis.length - 1)
								{
									_index = 0;
								}
								else
								{
									_index = $(this).index() + 1;
								}
							}
						});
						lis.eq(_index).addClass('active');
						$(selector).val(lis.eq(_index).text());
					}
				}

				//键盘往上
				if (e.which == 38 && lis.is(':visible'))
				{
					var _index;
					if (!lis.hasClass('active'))
					{
						lis.eq(lis.length - 1).addClass('active');
					}
					else
					{
						$.each(lis, function (i, e)
						{
							if ($(this).hasClass('active'))
							{
								$(this).removeClass('active');
								if ($(this).index() == 0)
								{
									_index = lis.length - 1;
								}
								else
								{
									_index = $(this).index() - 1;
								}
							}
						});
						lis.eq(_index).addClass('active');
						$(selector).val(lis.eq(_index).text());
					}

				}
			}
		});

		$(selector).blur(function()
		{
			$(selector).parent().find('.aw-dropdown').delay(500).fadeOut(300);
		});
	},

	// 插入下拉菜单
	set_dropdown_list: function(selector, data, selected)
	{
		$(selector).append(Hogan.compile(AW_TEMPLATE.dropdownList).render(
		{
			'items': data
		}));

		$(selector + ' .aw-dropdown-list li a').click(function ()
		{
			var text = $(this).text().length>6?$(this).text().substr(0,6)+'...':$(this).text()
			$(selector+' .dropdown-toggle span').html(text);
		});

		if (selected)
		{
			$(selector + " .dropdown-menu li a[data-value='" + selected + "']").click();
		}
	},

	/* 下拉菜单数据获取 */
	/*
	*    type : search, publish, redirect, invite, inbox, topic_question, topic
	*/
	get_dropdown_list: function(selector, type, data)
	{
		if (AWS.G.dropdown_list_xhr != '')
		{
			AWS.G.dropdown_list_xhr.abort(); // 中止上一次ajax请求
		}
		var url;
		switch (type)
		{
			case 'search' :
				url = G_BASE_URL + '/search/ajax/search/?q=' + encodeURIComponent(data) + '&limit=5';
			break;

			case 'publish' :
				url = G_BASE_URL + '/search/ajax/search/?type=questions&q=' + encodeURIComponent(data) + '&limit=5';
			break;

			case 'redirect' :
				url = G_BASE_URL + '/search/ajax/search/?q=' + encodeURIComponent(data) + '&type=questions&limit=30&is_question_id=1';
			break;

			case 'invite' :
			case 'inbox' :
				url = G_BASE_URL + '/search/ajax/search/?type=users&q=' + encodeURIComponent(data) + '&limit=10';
			break;

			case 'titck' :
				url = G_BASE_URL + '/search/ajax/search/?type=titcks&q=' + encodeURIComponent(data) + '&limit=10';
			break;

			case 'topic_question' :
				url = G_BASE_URL + '/search/ajax/search/?type=questions,articles&q=' + encodeURIComponent(data) + '&topic_ids=' + CONTENTS_RELATED_TOPIC_IDS + '&limit=50';
			break;

			case 'topic' :
				url = G_BASE_URL + '/search/ajax/search/?type=topics&q=' + encodeURIComponent(data) + '&limit=10';
			break;

			case 'questions' :
				url = G_BASE_URL + '/search/ajax/search/?type=questions&q=' + encodeURIComponent(data) + '&limit=10';
			break;

			case 'articles' :
				url = G_BASE_URL + '/search/ajax/search/?type=articles&q=' + encodeURIComponent(data) + '&limit=10';
			break;

		}

		AWS.G.dropdown_list_xhr = $.get(url, function (result)
		{
			if (result.length != 0 && AWS.G.dropdown_list_xhr != undefined)
			{
				$(selector).parent().find('.aw-dropdown-list').html(''); // 清空内容
				switch (type)
				{
					case 'search' :
						$.each(result, function (i, a)
						{
							switch (a.type)
							{
								case 'questions':
									if (a.detail.best_answer > 0)
									{
										var active = 'active';
									}
									else
									{
										var active = ''
									}

									$(selector).parent().find('.aw-dropdown-list').append(Hogan.compile(AW_TEMPLATE.searchDropdownListQuestions).render(
									{
										'url': a.url,
										'active': active,
										'content': a.name,
										'discuss_count': a.detail.answer_count
									}));
								break;

								case 'articles':
									$(selector).parent().find('.aw-dropdown-list').append(Hogan.compile(AW_TEMPLATE.searchDropdownListArticles).render(
									{
										'url': a.url,
										'content': a.name,
										'comments': a.detail.comments
									}));
								break;

								case 'topics':
									$(selector).parent().find('.aw-dropdown-list').append(Hogan.compile(AW_TEMPLATE.searchDropdownListTopics).render(
									{
										'url': a.url,
										'name': a.name,
										'discuss_count': a.detail.discuss_count,
										'topic_id': a.detail.topic_id
									}));
								break;

								case 'users':
									if (a.detail.signature == '')
									{
										var signature = _t('暂无介绍');
									}
									else
									{
										var signature = a.detail.signature;
									}

									$(selector).parent().find('.aw-dropdown-list').append(Hogan.compile(AW_TEMPLATE.searchDropdownListUsers).render(
									{
										'url': a.url,
										'img': a.detail.avatar_file,
										'name': a.name,
										'intro': signature
									}));
								break;
							}
						});
					break;

					case 'publish' :
					case 'topic_question' :
						$.each(result, function (i, a)
						{
							$(selector).parent().find('.aw-dropdown-list').append(Hogan.compile(AW_TEMPLATE.questionDropdownList).render(
							{
								'url': a.url,
								'name': a.name
							}));
						});
						break;

					case 'topic' :
						$.each(result, function (i, a)
						{
							$(selector).parent().find('.aw-dropdown-list').append(Hogan.compile(AW_TEMPLATE.editTopicDorpdownList).render(
							{
								'name': a['name']
							}));
						});
						break;

					case 'redirect' :
						$.each(result, function (i, a)
						{
							$(selector).parent().find('.aw-dropdown-list').append(Hogan.compile(AW_TEMPLATE.questionRedirectList).render(
							{
								'url': "'" + G_BASE_URL + "/question/ajax/redirect/', 'item_id=" + $(selector).attr('data-id') + "&target_id=" + a['search_id'] + "'",
								'name': a['name']
							}));
						});
						break;

					case 'questions' :
					case 'articles' :
						$.each(result, function (i, a)
						{
							$(selector).parent().find('.aw-dropdown-list').append(Hogan.compile(AW_TEMPLATE.questionDropdownList).render(
							{
								'url': '#',
								'name': a['name']
							}));
						});
						break;

						$(selector).parent().find('.aw-dropdown-list li').click(function()
						{
							$('.aw-question-list').append('<li data-id="'+$(this).attr('data-id')+'"><div class="col-sm-9">' + $(this).html() + '</div> <div class="col-sm-3"><a class="btn btn-danger btn-xs">删除</a></div></li>');

							$('.aw-question-list li').find("a").attr('href',function(){
								return $(this).attr("_href")

							});

							if ($('.question_ids').val() == '')
							{
								$('.question_ids').val($(this).attr('data-id') + ',');
							}
							else
							{
								$('.question_ids').val($('.question_ids').val() + $(this).attr('data-id') + ',');
							}
							$(".alert-box").modal('hide');
						});

						break;

					case 'titck':
					case 'inbox' :
					case 'invite' :
						$.each(result, function (i, a)
						{
							$(selector).parent().find('.aw-dropdown-list').append(Hogan.compile(AW_TEMPLATE.inviteDropdownList).render(
							{
								'uid': a.uid,
								'name': a.name,
								'img': a.detail.avatar_file
							}));
						});
						break;

				}
				if (type == 'publish')
				{
					$(selector).parent().find('.aw-publish-suggest-question, .aw-publish-suggest-question .aw-dropdown-list').show();
				}
				else
				{
					$(selector).parent().find('.aw-dropdown, .aw-dropdown-list').show().children().show();
					$(selector).parent().find('.title').hide();
					// 关键词高亮
					$(selector).parent().find('.aw-dropdown-list li.question a').highText(data, 'b', 'active');
				}
			}else
			{
				$(selector).parent().find('.aw-dropdown').show().end().find('.title').html(_t('没有找到相关结果')).show();
				$(selector).parent().find('.aw-dropdown-list, .aw-publish-suggest-question').hide();
			}
		}, 'json');

	}
}

AWS.Message =
{
	// 检测通知
	check_notifications: function()
	{
		// 检测登录状态
		if (G_USER_ID == 0)
		{
			clearInterval(AWS.G.notification_timer);
			return false;
		}

		$.get(G_BASE_URL + '/home/ajax/notifications/', function (result)
		{
			$('#inbox_unread').html(Number(result.rsm.inbox_num));

			var last_unread_notification = G_UNREAD_NOTIFICATION;

			G_UNREAD_NOTIFICATION = Number(result.rsm.notifications_num);

			if (G_UNREAD_NOTIFICATION > 0)
			{
				if (G_UNREAD_NOTIFICATION != last_unread_notification)
				{
					// 加载消息列表
					AWS.Message.load_notification_list();

					// 给导航label添加未读消息数量
					$('#notifications_unread').html(G_UNREAD_NOTIFICATION);
				}

				document.title = '(' + (Number(result.rsm.notifications_num) + Number(result.rsm.inbox_num)) + ') ' + document_title;

				$('#notifications_unread').show();
			}
			else
			{
				if ($('#header_notification_list').length)
				{
					$("#header_notification_list").html('<p class="aw-padding10" align="center">' + _t('没有未读通知') + '</p>');
				}

				if ($("#index_notification").length)
				{
					$("#index_notification").fadeOut();
				}

				document.title = document_title;

				$('#notifications_unread').hide();
			}

			// 私信
			if (Number(result.rsm.inbox_num) > 0)
			{
				$('#inbox_unread').show();
			}
			else
			{
				$('#inbox_unread').hide();
			}

		}, 'json');
	},

	// 阅读通知
	read_notification: function(selector, notification_id , reload)
	{
		if (notification_id)
		{
			selector.remove();

			var url = G_BASE_URL + '/notifications/ajax/read_notification/notification_id-' + notification_id;
		}
		else
		{
			if ($("#index_notification").length)
			{
				$("#index_notification").fadeOut();
			}

			var url = G_BASE_URL + '/notifications/ajax/read_notification/';
		}

		$.get(url, function (result)
		{
			AWS.Message.check_notifications();
			if(selector.hasClass('active'))
			{
				selector.removeClass('active');
			}

			$('.text-color-999 a').remove();
			
			if (reload)
			{
				window.location.reload();
			}
		});
	},

	// 重新加载通知列表
	load_notification_list: function()
	{
		if ($("#index_notification").length)
		{
			// 给首页通知box内label添加未读消息数量
			$("#index_notification").fadeIn().find('[name=notification_unread_num]').html(G_UNREAD_NOTIFICATION);

			$('#index_notification ul#notification_list').html('<p align="center" style="padding: 15px 0"><img src="' + G_STATIC_URL + '/common/loading_b.gif"/></p>');

			$.get(G_BASE_URL + '/notifications/ajax/list/flag-0__page-0', function (result)
			{
				$('#index_notification ul#notification_list').html(result);

				AWS.Message.notification_show(5);
			});
		}

		if ($("#header_notification_list").length)
		{
			$.get(G_BASE_URL + '/notifications/ajax/list/flag-0__limit-5__template-header_list', function (result)
			{
				if (result.length)
				{
					$("#header_notification_list").html(result);
				}
				else
				{
					$("#header_notification_list").html('<p class="aw-padding10" align="center">' + _t('没有未读通知') + '</p>');
				}
			});
		}
	},

	// 控制通知数量
	notification_show: function(length)
	{
		if ($('#index_notification').length > 0)
		{
			if ($('#index_notification ul#notification_list li').length == 0)
			{
				$('#index_notification').fadeOut();
			}
			else
			{
				$('#index_notification ul#notification_list li').each(function (i, e)
				{
					if (i < length)
					{
						$(e).show();
					}
					else
					{
						$(e).hide();
					}
				});
			}
		}
	}
}

AWS.Init =
{
	// 初始化问题评论框
	init_comment_box: function(selector)
	{
		$(document).on('click', selector, function ()
		{
			$(this).parents('.aw-question-detail').find('.aw-invite-box, .aw-question-related-box').hide();
			if (typeof COMMENT_UNFOLD != 'undefined')
			{
				if (COMMENT_UNFOLD == 'all' && $(this).attr('data-comment-count') == 0 && $(this).attr('data-first-click') == 'hide')
				{
					$(this).removeAttr('data-first-click');
					return false;
				}
			}

			if (!$(this).attr('data-type') || !$(this).attr('data-id'))
			{
				return true;
			}

			var comment_box_id = '#aw-comment-box-' + $(this).attr('data-type') + '-' + 　$(this).attr('data-id');

			if ($(comment_box_id).length)
			{
				if ($(comment_box_id).css('display') == 'none')
				{
					$(this).addClass('active');

					$(comment_box_id).fadeIn();
				}
				else
				{
					$(this).removeClass('active');
					$(comment_box_id).fadeOut();
				}
			}
			else
			{
				// 动态插入commentBox
				switch ($(this).attr('data-type'))
				{
					case 'question':
						var comment_form_action = G_BASE_URL + '/question/ajax/save_question_comment/question_id-' + $(this).attr('data-id');
						var comment_data_url = G_BASE_URL + '/question/ajax/get_question_comments/question_id-' + $(this).attr('data-id');
						break;

					case 'answer':
						var comment_form_action = G_BASE_URL + '/question/ajax/save_answer_comment/answer_id-' + $(this).attr('data-id');
						var comment_data_url = G_BASE_URL + '/question/ajax/get_answer_comments/answer_id-' + $(this).attr('data-id');
						break;
				}

				if (G_USER_ID)
				{
					$(this).parents('.aw-item').find('.mod-footer').append(Hogan.compile(AW_TEMPLATE.commentBox).render(
					{
						'comment_form_id': comment_box_id.replace('#', ''),
						'comment_form_action': comment_form_action
					}));

					$(comment_box_id).find('.aw-comment-txt').bind(
					{
						focus: function ()
						{
							$(comment_box_id).find('.aw-comment-box-btn').show();
						},

						blur: function ()
						{
							$(".aw-invite-dropdown").hide();
							if ($(this).val() == '')
							{
								$(comment_box_id).find('.aw-comment-box-btn').hide();
							}
						}
					});

					$(comment_box_id).find('.close-comment-box').click(function ()
					{
						$(comment_box_id).fadeOut();
						$(comment_box_id).find('.aw-comment-txt').css('height', $(this).css('line-height'));
					});
				}
				else
				{
					$(this).parents('.aw-item').find('.mod-footer').append(Hogan.compile(AW_TEMPLATE.commentBoxClose).render(
					{
						'comment_form_id': comment_box_id.replace('#', ''),
						'comment_form_action': comment_form_action
					}));
				}

				// 判断是否有评论数据
				$.get(comment_data_url, function (result)
				{
					if ($.trim(result) == '')
					{
						result = '<div align="center" class="aw-padding10">' + _t('暂无评论') + '</div>';
					}

					$(comment_box_id).find('.aw-comment-list').html(result);
				});

				// textarae自动增高
				$(comment_box_id).find('.aw-comment-txt').autosize();

				$(this).addClass('active');

				AWS.at_user_lists(comment_box_id + ' .aw-comment-txt', 5);
			}
		});
	},

	// 初始化文章评论框
	init_article_comment_box: function(selector)
	{
		$("#comment_editor").blur(function(){
							$(".aw-invite-dropdown").hide();
			
		});
		$(document).on('click', selector, function ()
	
		{
			var _editor_box = $(this).parents('.aw-item').find('.aw-article-replay-box');
			if (_editor_box.length)
			{
				if (_editor_box.css('display') == 'block')
				{
				   _editor_box.fadeOut();
				}
				else
				{
					_editor_box.fadeIn();
				}
			}
			else
			{
				$(this).parents('.mod-footer').append(Hogan.compile(AW_TEMPLATE.articleCommentBox).render(
				{
					'at_uid' : $(this).attr('data-id'),
					'article_id' : $('.aw-topic-bar').attr('data-id')
				}));
			}
		});
	},

	// 初始化话题编辑box
	init_topic_edit_box: function(selector) //selector -> .aw-edit-topic
	{
		$(selector).click(function ()
		{
			var _topic_editor = $(this).parents('.aw-topic-bar'),
				data_id = _topic_editor.attr('data-id'),
				data_type = _topic_editor.attr('data-type');

			if (!_topic_editor.hasClass('active'))
			{
				_topic_editor.addClass('active');

				if (!_topic_editor.find('.topic-tag .close').length)
				{
					_topic_editor.find('.topic-tag').append('<a class="close"><i class="icon icon-delete"></i></a>');
				}
			}
			else
			{
				_topic_editor.addClass('active');
			}

			// 判断插入编辑box
			if (_topic_editor.find('.aw-edit-topic-box').length == 0)
			{
				_topic_editor.append(AW_TEMPLATE.editTopicBox);

				// 给编辑box添加按钮添加事件
				_topic_editor.find('.add').click(function ()
				{
					if (_topic_editor.find('#aw_edit_topic_title').val() != '')
					{
						switch (data_type)
						{
							case 'publish':
								var str = _topic_editor.find('#aw_edit_topic_title').val();
								if(str.indexOf("/") != -1 || str.indexOf("-") != -1 || str.indexOf("&") != -1){
									AWS.alert('话题标题不能包含 / - &');
									return false;
								}

								_topic_editor.find('.tag-bar').prepend('<span class="topic-tag"><a class="text">' + _topic_editor.find('#aw_edit_topic_title').val() + '</a><a class="close" onclick="$(this).parents(\'.topic-tag\').remove();"><i class="icon icon-delete"></i></a><input type="hidden" value="' + _topic_editor.find('#aw_edit_topic_title').val() + '" name="topics[]" /></span>').hide().fadeIn();

								_topic_editor.find('#aw_edit_topic_title').val('');
							break;

							case 'question':
								   $.post(G_BASE_URL + '/topic/ajax/save_topic_relation/', 'type=question&item_id=' + data_id + '&topic_title=' + encodeURIComponent(_topic_editor.find('#aw_edit_topic_title').val()), function (result)
								{
									if (result.errno != 1)
									{
										AWS.alert(result.err);
                                        console.info(result.err);
										return false;
									}

									_topic_editor.find('.tag-bar').prepend('<span class="topic-tag" data-id="' + result.rsm.topic_id + '"><a href="' + G_BASE_URL + '/topic/' + result.rsm.topic_id + '" class="text">' + _topic_editor.find('#aw_edit_topic_title').val() + '</a><a class="close"><i class="icon icon-delete"></i></a></span>').hide().fadeIn();

									_topic_editor.find('#aw_edit_topic_title').val('');
								}, 'json');
							break;

							case 'article':
								$.post(G_BASE_URL + '/topic/ajax/save_topic_relation/', 'type=article&item_id=' + data_id + '&topic_title=' + encodeURIComponent(_topic_editor.find('#aw_edit_topic_title').val()), function (result)
								{
									if (result.errno != 1)
									{
										AWS.alert(result.err);

										return false;
									}

									_topic_editor.find('.tag-bar').prepend('<span class="topic-tag" data-id="' + result.rsm.topic_id + '"><a href="' + G_BASE_URL + '/topic/' + result.rsm.topic_id + '" class="text">' + _topic_editor.find('#aw_edit_topic_title').val() + '</a><a class="close"><i class="icon icon-delete"></i></a></span>').hide().fadeIn();

									_topic_editor.find('#aw_edit_topic_title').val('');
								}, 'json');
							break;


							case 'topic':
								$.post(G_BASE_URL + '/topic/ajax/save_related_topic/topic_id-' + data_id, 'topic_title=' + encodeURIComponent(_topic_editor.find('#aw_edit_topic_title').val()), function (result)
								{
									if (result.errno != 1)
									{
										AWS.alert(result.err);

										return false;
									}

									_topic_editor.find('.tag-bar').prepend('<span class="topic-tag"><a href="' + G_BASE_URL + '/favorite/tag-' + encodeURIComponent(_topic_editor.find('#aw_edit_topic_title').val()) + '" class="text">' + _topic_editor.find('#aw_edit_topic_title').val() + '</a><a class="close"><i class="icon icon-delete"></i></a></span>').hide().fadeIn();

									_topic_editor.find('#aw_edit_topic_title').val('');
								}, 'json');
							break;

							case 'favorite':
								$.post(G_BASE_URL + '/favorite/ajax/update_favorite_tag/', 'item_id=' + data_id + '&item_type=' + _topic_editor.attr('data-item-type') + '&tags=' + encodeURIComponent(_topic_editor.find('#aw_edit_topic_title').val()), function (result)
								{
									if (result.errno != 1)
									{
										AWS.alert(result.err);
				
										return false;
									}

									_topic_editor.find('.tag-bar').prepend('<span class="topic-tag"><a href="' + G_BASE_URL + '/favorite/tag-' + encodeURIComponent(_topic_editor.find('#aw_edit_topic_title').val()) + '" class="text">' + _topic_editor.find('#aw_edit_topic_title').val() + '</a><a class="close"><i class="icon icon-delete"></i></a></span>').hide().fadeIn();

									_topic_editor.find('#aw_edit_topic_title').val('');
								}, 'json');
							break;
						}
					}
				});

				// 给编辑box取消按钮添加事件
				_topic_editor.find('.close-edit').click(function ()
				{
					_topic_editor.removeClass('active');
					_topic_editor.find('.aw-edit-topic-box').hide();
					_topic_editor.find('.aw-edit-topic').show();
				});

				AWS.Dropdown.bind_dropdown_list($(this).parents('.aw-topic-bar').find('#aw_edit_topic_title'),'topic');
			}

			$(this).parents('.aw-topic-bar').find('.aw-edit-topic-box').fadeIn();

			// 是否允许创建新话题
			if (!G_CAN_CREATE_TOPIC)
			{
				$(this).parents('.aw-topic-bar').find('.add').hide();
			}

			$(this).hide();
		});
	}
}

function _t(string, replace)
{
	if (typeof (aws_lang) != 'undefined')
	{
		if (typeof (aws_lang[string]) != 'undefined')
		{
			string = aws_lang[string];
		}
	}

	if (replace)
	{
		string = string.replace('%s', replace);
	}

	return string;
};

// jQuery扩展
(function ($)
{
	$.fn.extend(
	{
		insertAtCaret: function (textFeildValue)
		{
			var textObj = $(this).get(0);
			if (document.all && textObj.createTextRange && textObj.caretPos)
			{
				var caretPos = textObj.caretPos;
				caretPos.text = caretPos.text.charAt(caretPos.text.length - 1) == '' ?
					textFeildValue + '' : textFeildValue;
			}
			else if (textObj.setSelectionRange)
			{
				var rangeStart = textObj.selectionStart,
					rangeEnd = textObj.selectionEnd,
					tempStr1 = textObj.value.substring(0, rangeStart),
					tempStr2 = textObj.value.substring(rangeEnd);
				textObj.value = tempStr1 + textFeildValue + tempStr2;
				textObj.focus();
				var len = textFeildValue.length;
				textObj.setSelectionRange(rangeStart + len, rangeStart + len);
				textObj.blur();
			}
			else
			{
				textObj.value += textFeildValue;
			}
		},

		highText: function (searchWords, htmlTag, tagClass)
		{
			return this.each(function ()
			{
				$(this).html(function high(replaced, search, htmlTag, tagClass)
				{
					var pattarn = search.replace(/\b(\w+)\b/g, "($1)").replace(/\s+/g, "|");

					return replaced.replace(new RegExp(pattarn, "ig"), function (keyword)
					{
						return $("<" + htmlTag + " class=" + tagClass + ">" + keyword + "</" + htmlTag + ">").outerHTML();
					});
					//$(this).text()换成$(this).html() 防止js标签转为字符
				}($(this).html(), searchWords, htmlTag, tagClass));
			});
		},

		outerHTML: function (s)
		{
			return (s) ? this.before(s).remove() : jQuery("<p>").append(this.eq(0).clone()).html();
		}
	});

	$.extend(
	{
		// 滚动到指定位置
		scrollTo : function (type, duration, options)
		{
			if (typeof type == 'object')
			{
				var type = $(type).offset().top
			}

			$('html, body').animate({
				scrollTop: type
			}, {
				duration: duration,
				queue: options.queue
			});
		}
	})

})(jQuery);
