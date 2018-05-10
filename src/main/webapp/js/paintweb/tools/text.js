/*
 * Copyright (C) 2018 gujc
 *
 * This file is part of PaintWeb and modified by gujc.
 *
 */

/**
 * @class The text tool.
 *
 * @param {PaintWeb} app Reference to the main paint application object.
 */
pwlib.tools.text = function (app) {
  var _self         = this,
      clearInterval = app.win.clearInterval,
      config        = app.config.text,
      context       = app.buffer.context,
      doc           = app.doc,
      gui           = app.gui,
      image         = app.image,
      lang          = app.lang,
      MathRound     = Math.round,
      mouse         = app.mouse,
      setInterval   = app.win.setInterval;

  /**
   * The interval ID used for invoking the drawing operation every few 
   * milliseconds.
   *
   * @private
   * @see PaintWeb.config.toolDrawDelay
   */
  var timer = null;

  /**
   * Holds the previous tool ID.
   *
   * @private
   * @type String
   */
  var prevTool = app.tool ? app.tool._id : null;

  /**
   * Tells if the drawing canvas needs to be updated or not.
   *
   * @private
   * @type Boolean
   * @default false
   */
  var inputText = null,
      input_fontFamily = null,
      ev_configChangeId = null,
      beforeMouse = null;
  var fontSizeArr = ["8", "10", "12", "14", "18", "24"]; 

  /**
   * Tool preactivation code. This method check if the browser has support for 
   * rendering text in Canvas.
   *
   * @returns {Boolean} True if the tool can be activated successfully, or false 
   * if not.
   */
  /*this.preActivate = function () {
    if (!gui.inputs.textString || !gui.inputs.text_fontFamily || 
        !gui.elems.viewport) {
      return false;

    }

    // Canvas 2D Text API
    if (context.fillText && context.strokeText) {
      return true;
    }
*/
    // Opera can only render text via SVG Text.
    // Note: support for Opera has been disabled.
    // There are severe SVG redraw issues when updating the SVG text element.
    // Besides, there are important memory leaks.
    // Ultimately, there's a deal breaker: security violation. The SVG document 
    // which is rendered inside Canvas is considered "external" 
    // - get/putImageData() and toDataURL() stop working after drawImage(svg) is 
    // invoked. Eh.
    /*if (pwlib.browser.opera) {
      return true;
    }*/

    // Gecko 1.9.0 had its own proprietary Canvas 2D Text API.
/*    if (context.mozPathText) {
      return true;
    }

    alert(lang.errorTextUnsupported);
    return false;
  };*/

  /**
   * The tool activation code. This sets up a few variables, starts the drawing 
   * timer and adds event listeners as needed.
   */
  this.activate = function () {
    // Reset the mouse coordinates to the scroll top/left corner such that the 
    // text is rendered there.
    mouse.x = Math.round(gui.elems.viewport.scrollLeft / image.canvasScale),
    mouse.y = Math.round(gui.elems.viewport.scrollTop  / image.canvasScale),
    
    app.shadowDisallow();
    
    input_fontFamily = gui.inputs.text_fontFamily;
    if (!inputText) {
		inputText = doc.createElement('div');
		inputText.className = 'inputText';
		inputText.contentEditable = true;    
		inputText.addEventListener('keydown',  this.keydown,  false);
		gui.elems.canvasContainer.appendChild(inputText);  
    }
    
    ev_configChangeId = app.events.add('configChange', ev_configChange);
  };

  function initInputText() {
    inputText.innerHTML = '<p>&nbsp;</p>';
    inputText.firstChild.style.fontFamily  = input_fontFamily.value;
    inputText.firstChild.style.fontSize = fontSizeArr[gui.inputs.fontSize.selectedIndex] + "pt";
    inputText.firstChild.style.color = gui.app.buffer.context.strokeStyle;//gui.colorInputs.strokeStyle.color
    setSelection(inputText.firstChild.firstChild);
  }
  /**
   * The tool deactivation simply consists of removing the event listeners added 
   * when the tool was constructed, and clearing the buffer canvas.
   */
  this.deactivate = function () {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }

    app.shadowAllow();
    drawText("none");    

    if (ev_configChangeId) {
      app.events.remove('configChange', ev_configChangeId);
    }

    context.clearRect(0, 0, image.width, image.height);

    return true;
  };

  /**
   * The <code>configChange</code> application event handler. This is also the 
   * <code>input</code> and <code>change</code> event handler for the text 
   * string input element.  This method updates the Canvas text-related 
   * properties as needed, and re-renders the text.
   *
   * <p>This function is not used on Opera.
   *
   * @param {Event|pwlib.appEvent.configChange} ev The application/DOM event 
   * object.
   */
  function ev_configChange (ev) {
    if (ev.type === 'input' || ev.type === 'change' ||
        (!ev.group && ev.config === 'shapeType') ||
        (ev.group === 'line' && ev.config === 'lineWidth')) {

      return;
    }

    if (ev.type !== 'configChange' && ev.group !== 'text') {
      return;
    }

    var font = ''; 

    switch (ev.config) {
      case 'fontFamily':
	        if (ev.value === '+') {
	          fontFamilyAdd(ev);
	        } else {
	        	 document.execCommand("fontName", false, ev.value);
	        }
	        break;
      case 'fontSize': document.execCommand("fontSize", false, ev.value); break;
      case 'bold':
      case 'italic':   document.execCommand(ev.config, false, ''); break;
    	      case 'left': document.execCommand('justifyLeft', false, null); break;
    	      case 'right': document.execCommand('justifyRight', false, null); break;
    	      case 'center': document.execCommand('justifyCenter', false, null); break;
      //case 'fillStyle': 
      case 'strokeStyle': document.execCommand('foreColor', false, rgbToHex(ev.value)); break;
    }

  };
  
  function rgbToHex (rgb) {
	  rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
	  return (rgb && rgb.length === 4) ? "#" +
	   ("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
	   ("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
	   ("0" + parseInt(rgb[3],10).toString(16)).slice(-2) : '';
  }
  /**
   * Add a new font family into the font family drop down. This function is 
   * invoked by the <code>ev_configChange()</code> function when the user 
   * attempts to add a new font family.
   * 
   *
   * @private
   *
   * @param {pwlib.appEvent.configChange} ev The application event object.
   */
  function fontFamilyAdd (ev) {
    var new_font = prompt(lang.promptTextFont) || '';
    new_font = new_font.replace(/^\s+/, '').replace(/\s+$/, '') || 
      ev.previousValue;

    // Check if the font name is already in the list.
    var opt, new_font2 = new_font.toLowerCase(),
        n = input_fontFamily.options.length;

    for (var i = 0; i < n; i++) {
      opt = input_fontFamily.options[i];
      if (opt.value.toLowerCase() == new_font2) {
        config.fontFamily = opt.value;
        input_fontFamily.selectedIndex = i;
        input_fontFamily.value = config.fontFamily;
        ev.value = config.fontFamily;

        return;
      }
    }

    // Add the new font.
    opt = doc.createElement('option');
    opt.value = new_font;
    opt.appendChild(doc.createTextNode(new_font));
    input_fontFamily.insertBefore(opt, input_fontFamily.options[n-1]);
    input_fontFamily.selectedIndex = n-1;
    input_fontFamily.value = new_font;
    ev.value = new_font;
    config.fontFamily = new_font;
  };

   /**
   * The <code>click</code> event handler. This method completes the drawing 
   * operation by inserting the text into the layer canvas.
   */
  this.click = function () {
	  if (beforeMouse) {
		  drawText (null);
	  } else{				// first click
		  beforeMouse = {x: mouse.x, y: mouse.y};
		  initInputText();
	  }
	  var zoom = gui.app.image.zoom;
	  inputText.style.display = "block";	
	  inputText.style.top = (mouse.y*zoom) + "px";
	  inputText.style.left = (mouse.x*zoom) + "px";
	  inputText.focus();
  }; 
  
  function getSelection() {
      return (window.getSelection) ? window.getSelection() : document.selection;
  }
  function getRange() {
      var sel, range;
      if (window.getSelection) {
          sel = window.getSelection();
          if (sel.getRangeAt && sel.rangeCount) {
              range = sel.getRangeAt(0);
              return range;
          } 
      } else if (document.selection && document.selection.type !== "Control") {
          return document.selection.createRange();
      }
  }
  
  function setSelection(node ) {
	  var range = getRange();
      if (!range) {return;}
      if (window.getSelection) {
          range.setStartBefore(node);
          range.setEndAfter(node);
          var sel = getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
      } else {
          range.select();
      }
  }
  
  function drawText (display) {
	  if (inputText.innerText === "") {
		  if (display) inputText.style.display = display;//"none";	
		  beforeMouse = {x: mouse.x, y: mouse.y};
		  return;
	  }

	  inputText.style.border = "0px";
	  html2canvas(inputText, {"backgroundColor": "transparent"}).then(function(canvas) {
		  inputText.style.border = "";
		  initInputText();
		  
		  var zoom = gui.app.image.zoom;
		  context.drawImage(canvas, (beforeMouse.x*zoom), (beforeMouse.y*zoom));
		  app.layerUpdate();

		  if (display) inputText.style.display = display;//"none";	
		  beforeMouse = {x: mouse.x, y: mouse.y};
	  });
  }
  
  /**
   * The <code>keydown</code> event handler allows users to press the 
   * <kbd>Escape</kbd> key to cancel the drawing operation and return to the 
   * previous tool.
   *
   * @param {Event} ev The DOM Event object.
   * @returns {Boolean} True if the key was recognized, or false if not.
   */
  this.keydown = function (ev) {
    //if (!prevTool || ev.kid_ != 'Escape') {
    if (!prevTool || ev.keyCode != 27) { // esc    	 
      return false;
    } 

    inputText.innerText = "";
    	
    mouse.buttonDown = false;
    app.toolActivate(prevTool, ev);

    return true;
  };
};

// vim:set spell spl=en fo=wan1croqlt tw=80 ts=2 sw=2 sts=2 sta et ai cin fenc=utf-8 ff=unix:

