/*
 *  This JavaScript file for picture editor JavaScript component
 *  this component works for GnimJS
 *  Version 0.1.6
 *  Write by Ming
 *  Date 2012.04.16
 */

(function($,NULL,UNDEFINED) {
    /* private static variables for PictureEditor */
    var _DEFAULT_CON_WIDTH = 300;
    var _DEFAULT_CON_HEIGHT = NULL;
    var _DEFAULT_MASK_OPACITY = 0.5;
    var _DEFAULT_PADDING = [50, 50, 50, 50];
    var _DEFAULT_WHELL_ZOOM=0.8;
    var _POSITION_LEFT_TOP=0;
    var _POSITION_LEFT_CENTER=1;
    var _POSITION_LEFT_BOTTOM=2;
    var _POSITION_CENTER_TOP=3;
    var _POSITION_CENTER_CENTER=4;
    var _POSITION_CENTER_BOTTOM=5;
    var _POSITION_RIGHT_TOP=6;
    var _POSITION_RIGHT_CENTER=7;
    var _POSITION_RIGHT_BOTTOM=8;
    var _POSITION_DEFAULT=_POSITION_LEFT_TOP;
    var _CLASS_CON = 'editor-con';
    var _CLASS_CON_DISABLE = 'editor-con-disable';
    var _CLASS_CON_INNER = 'editor-con-inner';
    var _CLASS_CON_PICTURE = 'editor-con-picture';
    var _CLASS_PICTURE = 'editor-picture';
    var _CLASS_MASK = 'editor-mask';
    var _CLASS_MASK_PREFIX = 'editor-mask-';
    var _CLASS_MASK_SUFFIX_LEFT = 'left';
    var _CLASS_MASK_SUFFIX_RIGHT = 'right';
    var _CLASS_MASK_SUFFIX_TOP = 'top';
    var _CLASS_MASK_SUFFIX_BOTTOM = 'bottom';
    var _CLASS_MASK_SUFFIX_CENTER = 'center';
    var _CLASS_DRAG_LAYER = 'editor-drag-layer';
    var _CLASS_DRAG_LAYER_MOVING = 'editor-drag-layer-moving';
    var _CLASS_SCALE = 'editor-scale';
    var _CLASS_SCALE_PICTURE = 'editor-scale-picture';
    var _ATTR_PICTURE_ID='pictureid';
    var _PX='px';
    var _scale_autoid=0;
    /* private static functions for PictureEditor */
    /**
     * judge an object is null or undefined
     * @param obj the object
     * @return object is null or empty
     */
    function _isNullOrUndefined(obj) {
        return obj===NULL||obj===UNDEFINED;
    }
    /**
     * just an empty function
     */
    function _nop() { }
    /**
     * parse number to integer
     * @param num num need to parse
     * @return integer value
     */
    function _toint(num){
        return parseInt(num);
    }
    /**
     * get mask dom string
     * @param type mask type(left/right/top/bottom/center)
     * @return mask dom string
     */
    function _getMaskDom(type) {
        return '<div class="' + _CLASS_MASK + ' ' + _CLASS_MASK_PREFIX + type + '"></div>';
    }
    /**
     * get offset mouse event pack
     * @param event mouse event
     * @return mouse event position pack object
     */
    function _mousePoint(event){
        var x=_isNullOrUndefined(event.offsetX)?event.layerX:event.offsetX;
        var y=_isNullOrUndefined(event.offsetY)?event.layerY:event.offsetY;
        return {
            x:x,
            y:y
        };
    }
    /**
     * pervent default broswer event
     * @param event dom event
     */
    function _preventDefault(event){
        if (event.preventDefault) event.preventDefault(); //stop default event
    }
    /* public static variables & functions for PictureEditor */
    var _static = {
        POSITION_LEFT_TOP:_POSITION_LEFT_TOP,
        POSITION_LEFT_CENTER:_POSITION_LEFT_CENTER,
        POSITION_LEFT_BOTTOM:_POSITION_LEFT_BOTTOM,
        POSITION_CENTER_TOP:_POSITION_CENTER_TOP,
        POSITION_CENTER_CENTER:_POSITION_CENTER_CENTER,
        POSITION_CENTER_BOTTOM:_POSITION_CENTER_BOTTOM,
        POSITION_RIGHT_TOP:_POSITION_RIGHT_TOP,
        POSITION_RIGHT_CENTER:_POSITION_RIGHT_CENTER,
        POSITION_RIGHT_BOTTOM:_POSITION_RIGHT_BOTTOM,
        DEFAULT_CON_WIDTH:_DEFAULT_CON_WIDTH,
        DEFAULT_CON_HEIGHT:_DEFAULT_CON_HEIGHT,
        DEFAULT_MASK_OPACITY:_DEFAULT_MASK_OPACITY,
        DEFAULT_PADDING: _DEFAULT_PADDING,
        DEFAULT_WHELL_ZOOM: _DEFAULT_WHELL_ZOOM
    }
    /* public & private variables for PictureEditor */
    var _vars = {
        wheelzoom: _DEFAULT_WHELL_ZOOM,
        _picsrc: NULL,
        _picset: false,
        _picloading: false,
        _picautosize: true,
        _conw: _DEFAULT_CON_WIDTH, //picture editor container width
        _conh: _DEFAULT_CON_HEIGHT, //picture editor container height
        _picow: 0,//pictrue original width
        _picoh: 0,//picture original height
        _picw: 0,//pictrue width
        _pich: 0,//picture height
        _picl: 0,//pictrue left
        _pict: 0,//picture top
        _padding: [_DEFAULT_PADDING[0], _DEFAULT_PADDING[1],
        _DEFAULT_PADDING[2], _DEFAULT_PADDING[3]],
        //editor mask padding size[top,right,bottom,left]
        _masko: _DEFAULT_MASK_OPACITY,//editor mask opacity
        _drag: NULL,//drag info
        _scale: NULL,//scale pictures
        _selector: NULL//container selector
    };
    /* public & private functions for PictureEditor */
    PictureEditor.prototype = {
        setPicture:setPicture,
        resetPicture:resetPicture,
        setNeedSize:setNeedSize,
        setConSize:setConSize,
        setPadding:setPadding,
        position:position,
        zoom:zoom,
        getEditInfo:getEditInfo,
        addScale:addScale,
        removeScale:removeScale,
        setEnable:setEnable,
        setMaskOpacity:setMaskOpacity
    }
    /**
     * constructor of PictureEditor
     * @param conSelector PictureEditor container selector
     * @param editorParam [Not Must]PictureEditor init param
     */
    function PictureEditor(conSelector, editorParam) {
        var objThis = this;
        //create public & private variable
        for (var name in _vars) {
            objThis[name] = _vars[name];
        }
        objThis._selector = conSelector;
        objThis._scale={};
        objThis._enable=true;
        //init PictureEditor DOM
        var $con = $(conSelector);
        if ($con.length != 1) {
            throw new Error('selector should find only one element');
        }
        objThis.$dom=$con;
        if(!_isNullOrUndefined(editorParam)){
            var value;
            if(!_isNullOrUndefined(value=editorParam.width)){
                objThis._conw=value;
            }
            if(!_isNullOrUndefined(value=editorParam.height)){
                objThis._conh=value;
            }
            if(!_isNullOrUndefined(value=editorParam.padding)){
                for(var i in objThis._padding){
                    objThis._padding[i]=value[i%value.length];
                }
            }
            if(!_isNullOrUndefined(value=editorParam.opacity)){
                objThis._masko=value;
            }
        }
        $con.empty().addClass(_CLASS_CON);
        $('<div class="' + _CLASS_CON_INNER + '"><div class="' + _CLASS_CON_PICTURE + '"></div></div>').appendTo(conSelector);
        var maskOpacity=objThis._masko;
        $(_getMaskDom(_CLASS_MASK_SUFFIX_LEFT)).css({
            left:0,
            top:0,
            opacity:maskOpacity
        }).appendTo(conSelector);
        $(_getMaskDom(_CLASS_MASK_SUFFIX_RIGHT)).css({
            right:0,
            top:0,
            opacity:maskOpacity
        }).appendTo(conSelector);
        $(_getMaskDom(_CLASS_MASK_SUFFIX_TOP)).css({
            left:0,
            top:0,
            opacity:maskOpacity
        }).appendTo(conSelector);
        $(_getMaskDom(_CLASS_MASK_SUFFIX_BOTTOM)).css({
            left:0,
            bottom:0,
            opacity:maskOpacity
        }).appendTo(conSelector);
        $(_getMaskDom(_CLASS_MASK_SUFFIX_CENTER)).appendTo(conSelector);
        function _startDrag(event) {
            if(!objThis._enable){
                return;
            }
            _preventDefault(event); //stop default event
            var pos=_mousePoint(event);
            var selector=objThis._selector;
            objThis._drag=pos;
            $(selector+'.'+_CLASS_DRAG_LAYER).addClass(_CLASS_DRAG_LAYER_MOVING);
        }
        function _doDrag(event) {
            if(!objThis._enable){
                return;
            }
            _preventDefault(event); //stop default event
            if(!_isNullOrUndefined(objThis._drag)){
                var pos=_mousePoint(event);
                var selector=objThis._selector;
                $(selector+'.'+_CLASS_PICTURE).css({
                    left:(objThis._picl+pos.x-objThis._drag.x)+_PX,
                    top:(objThis._pict+pos.y-objThis._drag.y)+_PX
                });
            }
        }
        function _endDrag(event) {
            if(!objThis._enable){
                return;
            }
            _preventDefault(event); //stop default event
            if(!_isNullOrUndefined(objThis._drag)){
                var pos=_mousePoint(event);
                var selector=objThis._selector;
                $(selector+'.'+_CLASS_PICTURE).css({
                    left:(objThis._picl=objThis._picl+pos.x-objThis._drag.x)+_PX,
                    top:(objThis._pict=objThis._pict+pos.y-objThis._drag.y)+_PX
                });
                objThis._drag=NULL;
                $(selector+'.'+_CLASS_DRAG_LAYER).removeClass(_CLASS_DRAG_LAYER_MOVING);
                _resetAllScalePicture.apply(objThis);
            }
        }
        function _wheelFn(event) {
            if(!objThis._enable){
                return;
            }
            /* make sure event right and stop default wheel event */
            if (event.currentTarget != event.target) return; //if event is not on .map-layer-info
            _preventDefault(event); //stop default event
            /* compute wheel value */
            var detail = 0;
            if (event.wheelDelta)
                detail = event.wheelDelta / 120;
            if (event.detail)
                detail = -event.detail / 3;
            /* do something for wheel */
            if (detail > 0)
                objThis.zoom(1/objThis.wheelzoom);
            if (detail < 0)
                objThis.zoom(objThis.wheelzoom);
        }
        $('<div class="' + _CLASS_DRAG_LAYER + '"></div>').appendTo(conSelector)
        .css({
            opacity:0.01
        })
        .mousedown(_startDrag)
        .mousemove(_doDrag)
        .mouseup(_endDrag)
        .mouseout(_endDrag)
        .bind('mousewheel', _wheelFn) //For non-Mozilla
        .bind('DOMMouseScroll', _wheelFn); //For Mozilla FireFox
        //set container size
        objThis.setConSize();
    }
    function _resetAllScale(){
        var objThis = this;
        for(var s in objThis._scale){
            _resetScale.apply(objThis,[s]);
        }
    }
    function _resetAllScaleSize(){
        var objThis = this;
        for(var s in objThis._scale){
            _resetScaleSize.apply(objThis,[s]);
        }
    }
    function _resetAllScalePicture(addPic){
        var objThis = this;
        for(var s in objThis._scale){
            _resetScalePicture.apply(objThis,[s,addPic]);
        }
    }
    function _resetScale(id){
        _resetScaleSize.apply(this,[id]);
        _resetScalePicture.apply(this,[id]);
    }
    function _resetScaleSize(id){
        var objThis = this;
        var scaleObj=objThis._scale[id];
        var selector=scaleObj.selector;
        var scale=scaleObj.scale;
        var inner_width=objThis._conw-objThis._padding[1]-objThis._padding[3];
        var inner_height=objThis._conh-objThis._padding[0]-objThis._padding[2];
        $(selector).css({
            width:inner_width*scale+_PX,
            height:inner_height*scale+_PX
        });
    }
    function _resetScalePicture(id,addPic){
        var objThis = this;
        var scaleObj=objThis._scale[id];
        var selector=scaleObj.selector;
        var scale=scaleObj.scale;
        if(addPic){
            $(selector).empty();
            $('<img src="'+objThis._picsrc+'" class="'+_CLASS_SCALE_PICTURE+'" />').appendTo(selector);
        }
        $(selector+'.'+_CLASS_SCALE_PICTURE).css({
            left:(objThis._picl-objThis._padding[3])*scale+_PX,
            top:(objThis._pict-objThis._padding[0])*scale+_PX,
            width:objThis._picw*scale+_PX,
            height:objThis._pich*scale+_PX
        });
    }
    /**
     * set a picture to picture editor
     * @param src picture src of img tag
     * @param width [Not Must]set picture width,if not set,editor will auto get it
     * @param height [Not Must]set picture height,if not set,editor will auto get it
     * @param id [Not Must]picture id,id will be return at getEditInfo()
     * @return self object this
     */
    function setPicture(src,width,height,id){
        var objThis = this;
        var oldset=objThis._picset;
        objThis._picset=true;
        objThis._picsrc=src;
        if(_isNullOrUndefined(width)||_isNullOrUndefined(height)){
            objThis._picautosize=true;
        }else{
            objThis._picautosize=false;
            objThis._picow=objThis._picw=_toint(width);
            objThis._picoh=objThis._pich=_toint(height);
        }
        objThis._picloading=true;
        $(objThis._selector+'.'+_CLASS_CON_PICTURE).empty();
        var $img=$('<img src="'+src+'" class="'+_CLASS_PICTURE+'" />').load(function(event){
            var img=$.IE?event.srcElement:this;
            if(objThis._picautosize){
                objThis._picow=objThis._picw=img.width;
                objThis._picoh=objThis._pich=img.height;
                $(img).css({
                    width:img.width+_PX,
                    height:img.height+_PX
                    });
            }
            $(img).css({
                left:(objThis._picl=_toint((objThis._conw-objThis._picow)/2))+_PX,
                top:(objThis._pict=_toint((objThis._conh-objThis._picoh)/2))+_PX,
                visibility:'visible'
            });
            objThis._picloading=false;
            var scales=objThis._scale;
            for(var s in scales){
                $(scales[s].selector+'.'+_CLASS_SCALE_PICTURE).attr('src',src);
            }
            _resetAllScalePicture.apply(objThis,[!oldset]);
        }).appendTo(objThis._selector+'.'+_CLASS_CON_PICTURE).css({
            visibility:'hidden'
        });
        if(!objThis._picautosize){
            $img.css({
                width:width+_PX,
                height:height+_PX
                });
        }
        if(!_isNullOrUndefined(id)){
            $img.attr(_ATTR_PICTURE_ID,id);
        }
        return objThis;
    }
    /**
     * reset a picture size & position
     * @return self object this
     */
    function resetPicture(){
        var objThis = this;
        if(objThis._picset){
            $(objThis._selector+'.'+_CLASS_PICTURE).css({
                left:(objThis._picl=_toint((objThis._conw-objThis._picow)/2))+_PX,
                top:(objThis._pict=_toint((objThis._conh-objThis._picoh)/2))+_PX,
                width:(objThis._picw=objThis._picow)+_PX,
                height:(objThis._pich=objThis._picoh)+_PX
            });
        }
        _resetAllScale.apply(objThis);
        return objThis;
    }
    /**
     * set picture size
     * @param width need picture size width
     * @param height need picture size height
     * @return self object this
     */
    function setNeedSize(width, height) {
        var objThis = this;
        var _padding = objThis._padding;
        objThis.setConSize(width+_padding[1]+_padding[3], height+_padding[0]+_padding[2]);
        return objThis;
    }
    /**
     * set container size
     * @param conWidth need container size width
     * @param conHeight need container size height
     * @return self object this
     */
    function setConSize(conWidth, conHeight) {
        var objThis = this;
        objThis._conw=conWidth=_isNullOrUndefined(conWidth)?objThis._conw:conWidth;
        objThis._conh=conHeight=_isNullOrUndefined(conHeight)?objThis._conh:conHeight;
        $(objThis._selector+','+objThis._selector+'.'+_CLASS_DRAG_LAYER).css({
            width:conWidth+_PX,
            height:conHeight+_PX
            });
        objThis.setPadding();
        return objThis;
    }
    /**
     * set picture editor padding
     * @param padding picture editor padding(array of length 1/2/4)
     * @return self object this
     */
    function setPadding(padding) {
        var objThis = this;
        var _padding = objThis._padding;
        var selecor_prefix=objThis._selector+'.'+_CLASS_MASK_PREFIX;
        if(!_isNullOrUndefined(padding)){
            for(var i in _padding){
                _padding[i]=padding[i%padding.length];
            }
        }
        $(selecor_prefix+_CLASS_MASK_SUFFIX_LEFT).css({
            width:_padding[3]+_PX,
            height:objThis._conh+_PX
        });
        $(selecor_prefix+_CLASS_MASK_SUFFIX_RIGHT).css({
            width:_padding[1]+_PX,
            height:objThis._conh+_PX
        });
        $(selecor_prefix+_CLASS_MASK_SUFFIX_TOP).css({
            width:(objThis._conw-_padding[1]-_padding[3])+_PX,
            height:_padding[0]+_PX,
            left:_padding[3]+_PX
        });
        $(selecor_prefix+_CLASS_MASK_SUFFIX_BOTTOM).css({
            width:(objThis._conw-_padding[1]-_padding[3])+_PX,
            height:_padding[2]+_PX,
            left:_padding[3]+_PX
        });
        $(selecor_prefix+_CLASS_MASK_SUFFIX_CENTER).css({
            width:(objThis._conw-_padding[1]-_padding[3]-2)+_PX,
            height:(objThis._conh-_padding[0]-_padding[2]-2)+_PX,
            left:_padding[3]+_PX,
            top:_padding[0]+_PX
        });
        _resetAllScale.apply(objThis);
        return objThis;
    }
    /**
     * set editor enable
     * @param enable editor enable
     * @return self object this
     */
    function setEnable(enable){
        var objThis = this;
        objThis._enable=!!enable;
        if(!!enable){
            objThis.$dom.removeClass(_CLASS_CON_DISABLE);
        }else{
            objThis.$dom.addClass(_CLASS_CON_DISABLE);
        }
        return objThis;
    }
    /**
     * set picture editor mask opacity
     * @param opacity picture editor mask opacity(0.0-1.0)
     * @return self object this
     */
    function setMaskOpacity(opacity) {
        var objThis = this;
        var masks=[_CLASS_MASK_SUFFIX_LEFT,_CLASS_MASK_SUFFIX_RIGHT,_CLASS_MASK_SUFFIX_TOP,_CLASS_MASK_SUFFIX_BOTTOM];
        objThis._masko=opacity;
        for(var i in masks){
            $(objThis._selector+'.'+_CLASS_MASK_PREFIX+masks[i]).css({
                opacity:opacity
            });
        }
        return objThis;
    }
    /**
     * set picture position
     * @param left position relative left
     * @param top position relative top
     * @param mode [Not Must]position relative mode(reference PictureEditor._POSITION_*)
     */
    function position(left,top,mode){
        var objThis = this;
        if(objThis._picset){
            mode=_isNullOrUndefined(mode)?_POSITION_DEFAULT:mode;
            var modex=_toint(mode/3);
            var modey=mode%3;
            var padding_left=objThis._padding[3];
            var padding_top=objThis._padding[0];
            var inner_width=objThis._conw-padding_left-objThis._padding[1];
            var inner_height=objThis._conh-padding_top-objThis._padding[2];
            switch(modex){
                case 0:
                    left+=padding_left;
                    break;
                case 1:
                    left+=padding_left-(objThis._picw-inner_width)/2;
                    break;
                case 2:
                    left+=padding_left-objThis._picw+inner_width;
                    break;
            }
            switch(modey){
                case 0:
                    top+=padding_top;
                    break;
                case 1:
                    top+=padding_top-(objThis._pich-inner_height)/2;
                    break;
                case 2:
                    top+=padding_top-objThis._pich+inner_height;
                    break;
            }
            var selector=objThis._selector;
            $(selector+'.'+_CLASS_PICTURE).css({
                left:(objThis._picl=_toint(left))+_PX,
                top:(objThis._pict=_toint(top))+_PX
            });
            _resetAllScale.apply(objThis);
        }
    }
    /**
     * zoom picture
     * @param val zoom proportion value
     */
    function zoom(val){
        var objThis = this;
        if(objThis._picset){
            var selector=objThis._selector;
            var conwDiv2=objThis._conw/2;
            var conhDiv2=objThis._conh/2;
            var new_width=(objThis._picw*val);
            var new_height=(objThis._pich*val);
            var new_left=(objThis._picl-conwDiv2)*new_width/objThis._picw+conwDiv2;
            var new_top=(objThis._pict-conhDiv2)*new_height/objThis._pich+conhDiv2;
            $(selector+'.'+_CLASS_PICTURE).css({
                width:(objThis._picw=_toint(new_width))+_PX,
                height:(objThis._pich=_toint(new_height))+_PX,
                left:(objThis._picl=_toint(new_left))+_PX,
                top:(objThis._pict=_toint(new_top))+_PX
            });
            _resetAllScalePicture.apply(objThis);
        }
    }
    /**
     * get picture edit information
     * @return edit information object
     */
    function getEditInfo(){
        var objThis = this;
        var selector=objThis._selector;
        if(objThis._picset){
            var rtn={
                width:objThis._picw,
                height:objThis._pich,
                cut_width:objThis._conw-objThis._padding[1]-objThis._padding[3],
                cut_height:objThis._conh-objThis._padding[0]-objThis._padding[2],
                cut_left:objThis._padding[3]-objThis._picl,
                cut_top:objThis._padding[0]-objThis._pict,
                original_width:objThis._picow,
                original_height:objThis._picoh,
                src:objThis._picsrc
            };
            var id=$(selector+'.'+_CLASS_PICTURE).attr(_ATTR_PICTURE_ID);
            if(!_isNullOrUndefined(id)){
                rtn.id=id;
            }

            return rtn;
        }
        return NULL;
    }
    /**
     * add a scale picture
     * @param selector scale picture container
     * @param scale scale rate
     * @param id [Not Must]scale picture id
     */
    function addScale(selector,scale,id){
        var objThis = this;
        id=_isNullOrUndefined(id)?(_scale_autoid++):id;
        var scaleObj={
            selector:selector,
            scale:scale
        };
        objThis.removeScale(id);
        objThis._scale[id]=scaleObj;
        $(selector).empty().addClass(_CLASS_SCALE);
        if(objThis._picset){
            $('<img src="'+objThis._picsrc+'" class="'+_CLASS_SCALE_PICTURE+'" />').appendTo(selector);
        }
        _resetScale.apply(objThis,[id]);
    }
    /**
     * remove a scale picture
     * @param id scale picture id
     */
    function removeScale(id){
        if(!_isNullOrUndefined(id)){
            var objThis = this;
            if(!_isNullOrUndefined(objThis._scale[id])){
                $(objThis._scale[id].selector).empty().removeClass(_CLASS_SCALE);
                objThis._scale[id]=NULL;
                delete objThis._scale[id];
            }
        }
    }
    /* set static variables & functions */
    for (var name in _static) {
        PictureEditor[name] = _static[name];
    }
    /* set PictureEditor to window */
    window.PictureEditor = PictureEditor;
})(Gnim,null);
