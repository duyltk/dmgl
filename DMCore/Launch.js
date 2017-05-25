//* Launch.js use to display elements of game
(function () {
    var $;

	//Get element by ID
    $ = function (id) {
        return document.getElementById(id);
    };

	//Elements of select texture and control
    select = ['sphere', 'cube', 'plane', 'controls'];

	//Information of select. [id][0] is ID of information element
    info_select = [[1, 'WORLDCUP FOOTBALL 1', 'WORLDCUP FOOTBALL 2', 'BASKETBALL', 'TENNIS', 'BEACH BALL'], [1, 'WOOD', 'BLUE BLACK', 'SKY BLUE', 'WOOD LIGHT', 'PINK BLACK'], [1, 'Football Field', 'Dark Grunge', 'Christmas Wood', 'Gold bokeh', 'flash network'], [1, 'KEYBOARD', 'LEAP MOTION']];

	//Function change information when select element
    f_select = function (i) {
        var e;
        e = $("s-" + select[i]);

        return e.onclick = function () {
            info_select[i][0]++;
            //When id of information is greater than leghth of information element, reset id 
            if(info_select[i][0] == info_select[i].length)
                info_select[i][0] = 1;
			//Change of element control when select
            if (select[i] == 'controls')
                e.innerHTML = select[i] + ' : ' + info_select[i][info_select[i][0]];
            else 
				//Change of element texture when select
                e.innerHTML = 'texture ' + select[i] + ' : ' + info_select[i][info_select[i][0]];
            return;
        };
    };

	//Call function when select element 
    for (i = 0; i < select.length; i++) {
        f_select(i);
    }
	//When click Infomation
    $('info').onclick = function () {
        $('step-1').style.display = 'none';
        $('f-info').style.display = 'block';
        return;
    }
	
	//When click out Full information, comeback home
    $('f-info').onclick = function () {
        $('step-1').style.display = 'block';
        $('f-info').style.display = 'none';
        return;
    }
	//START. Load image step-2 introduce.
    $('start').onclick = function () {
        $('step-1').style.display = 'none';
        $('step-2').innerHTML = '<img src="image/help-' + info_select[3][0] +'.png"><h4>Click anywhere to continue.....</h4>';
        for (i = 0; i < select.length - 1; i++){
            imgPathTex[i] = 'image/' + select[i] + '/' + select[i] + '-' + info_select[i][0] + '.gif';
        }
        $('step-2').style.display = 'block';
        getControl = info_select[defineCONTROL][0];
        return;
    }
	//Go scene game
    $('step-2').onclick = function () {
        $('step-2').style.display = 'none';
        $('score').style.display = 'block';
        if (info_select[defineCONTROL][0] == 2){
            callCamera();
            $('canvasLayers').style.display = 'block';
        }
        webGLStart();
        return;
    }
	//Go home when win.
    $('goHome').onclick = function () {
        location.reload(true);
        return;
    }

}).call(this);
