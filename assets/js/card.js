void function(){
	/**
	 * short cut
	 * Cmd + S 		-> Parse
	 * Cmd + Enter 	-> Commit
	 * Esc 			-> Card.hide
	 */

	// utils
	var e = document.querySelector.bind(document)
	var log = console.log.bind(console)
	var appendStyle = function(cssText){
		var style = document.createElement('style')
		style.type = 'text/css'
		style.appendChild(document.createTextNode(cssText))
		e('head').appendChild(style)
	}
	var appendHtml = function(element, html) {
		element.insertAdjacentHTML('beforeend', html)
	}

	// Exports Component
	var Card = function(){
	}

	Card._props = {
		'$root': null,
		'$mask': null,
		'$title': null,
		'$input': null,
		'$output': null,
		'$submit': null,
		'inputEditor': null,
		'outputEditor': null,
		'entity': {},
	}

	Card._init = (function(){
		var done = false
		return function(){
			if (done){
				return 
			}
			done = true

			var htmlText = `
				<div id="root" class="root">
					<div id="mask" class="mask" data-action="close">
					
					</div>
					<div class="info">
						<div class="info__item">Cmd + S -\> Run</div>
						<div class="info__item">Cmd + Enter -\> Commit</div>
						<div class="info__item">Esc -\> Exit</div>
					</div>
					<div id="playground" class="panel">
						<div class="editor">
							<input id="title" type="text" class="editor__title" value="" placeholder=" 标题">
							<div id="input" class="editor__tpl"></div>
							<a id="submit" href="#" class="editor__submit" data-action="submit">提交</a>
						</div>
						<div class="preview">
							<div id="output"></div>
						</div>
					</div>	
				</div>
			`
			appendHtml(e('body'), htmlText)

			var cssText = `
				.panel{position: absolute; left: 0; right: 0; top: 0; bottom: 0; margin: auto; width: 80%; height: 512px; }
				.editor{float: left; width: 50%; height: 100%; background: gray;}
				.preview{float: right; width: 50%; height: 100%; background: #000;}
				.editor{text-align: center;}
				.editor__title{width: 90%; height: 32px; line-height: 32px; margin-top: 10px;}
				.editor__tpl{width: 90%; height: 400px; background: white; margin: 10px auto 0;}
				.editor__submit{display: inline-block; width: 90%; height: 36px; line-height: 36px; margin-top: 10px; background: #31708f; color: #d9edf7;}
				.editor__submit:hover{opacity: .8; text-decoration: none;}

				.mask{position: absolute; width: 100%; height: 100%; background: rgba(0, 0, 0, .6);}

				.root{position: absolute; top:0; left:0; width: 100%; height: 100%; display: none;}
				.root.-show{display: block;}

				.info{position: absolute; padding: 6px 0; background: white;width: 100%;text-align: center;}
			`
			appendStyle(cssText)

			Card._props.$root = e('#root')
			Card._props.$mask = e('#mask')
			Card._props.$title = e('#title')
			Card._props.$submit = e('#title')
			Card._props.$input = e('#input')
			Card._props.$output = e('#output')
			Card._props.inputEditor = initInputEditor()
			Card._props.outputEditor = initOutputEditor()
			Card._props.submitCallback = null

			bindEvents()
		}
	})()

	Card.show = function(entity){
		entity = entity || {}
		Card._props.entity = entity
		this._props.$title.value = entity.title || ''
		var tplBeautify = entity.tpl
		try {
			tplBeautify = JSON.stringify(JSON.parse(entity.tpl), null, 4)
		}
		catch(e){
			// log(e)
		}
		this._props.inputEditor.setValue(tplBeautify || '')
		resetEditorFocus(this._props.inputEditor)
		Card._props.$root.classList.add('-show')
	}

	Card.hide = function(){
		Card._props.$root.classList.remove('-show')
	}

	Card.submitCallback = function(fn){
		Card._props.submitCallback = fn
	}

	// supp
	function bindEvents () {
		bindPressKey()
		Card._props.$root.addEventListener('click', function(ev){
			var dict = {
				'close': actionClose, // effect in Mask & CloseBtn
				'submit': actionSubmit,
			}
			var self = ev.target
			var actionName = self.dataset.action
			var actionHandler = dict[actionName]
			actionHandler && actionHandler.call(self, ev)
		})
	}


	function bindPressKey(cb){
		document.addEventListener('keydown', function(event){
			// Cmd + S
			if ( (event.ctrlKey || event.metaKey) && event.which == 83) {
		        event.preventDefault()
		        try {
		        	var tpl = JSON.parse(Card._props.inputEditor.getValue())
		        	var result = JSON.stringify(Mock.mock(tpl), null, 4) 
		        	Card._props.outputEditor.setValue(result)
		        } catch(e){
		        	log(e)
		        	Card._props.outputEditor.setValue('parse error')
		        }
		        resetEditorFocus(Card._props.outputEditor)
		        return false
		    }
		    // Cmd + Enter
		    else if( (event.ctrlKey || event.metaKey) && event.which == 13 ){
				event.preventDefault()	
		    	actionSubmit(event)
		    	return false
		    }
		    return true
		})
	}

	function actionClose(ev){
		Card._props.$root.classList.remove('-show')
	}

	function actionSubmit(ev){
		var t = Card._props.entity
		t.title = Card._props.$title.value || t.title
		t.tpl = Card._props.inputEditor.getValue()
		Card._props.submitCallback && Card._props.submitCallback.call(null, t)
		actionClose(ev)
	}

	// widget
	function initInputEditor(){
		var editor = ace.edit('input')
		editor.setOptions({
			theme: "ace/theme/twilight",
			minLines: 25,
			maxLines: 25
		})
	    editor.session.setMode("ace/mode/javascript")
    	editor.resize(true)
    	return editor
	}

	function initOutputEditor(){
		var editor = ace.edit('output')
		editor.setOptions({
			theme: "ace/theme/twilight",
			minLines: 32,
			maxLines: 32
		})
	    editor.session.setMode("ace/mode/javascript")
    	editor.resize(true)
    	editor.setReadOnly(true)
    	return editor
	}
		
	function resetEditorFocus(editor){
		editor.focus()
		session = editor.getSession()
		count = session.getLength()
		editor.gotoLine(count, session.getLine(count-1).length)
	}

	// main
	function main(){
		Card._init()
		window.Card = Card

	}
	main()
}()