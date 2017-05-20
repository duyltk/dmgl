(function () {
    var $, s;

    $ = function (id) {
        return document.getElementById(id);
    };

    select = ['sphere', 'cube', 'plane', 'controls'];

    info_select = [[1, 'WORLDCUP FOOTBALL 1', 'WORLDCUP FOOTBALL 2', 'BASKETBALL', 'TENNIS', 'BEACH BALL'], [1, 'WOOD', 'BLUE BLACK', 'SKY BLUE', 'WOOD LIGHT', 'PINK BLACK'], [1, 'Football Field', 'Dark Grunge', 'Christmas Wood', 'Gold bokeh', 'flash network'], [1, 'KEYBOARD', 'LEAP MOTION']]

    f_select = function (i) {
        var e;
        e = $("s-" + select[i]);

        return e.onclick = function () {
            info_select[i][0]++;
            
            if(info_select[i][0] == info_select[i].length)
                info_select[i][0] = 1;
            if (select[i] == 'controls')
                e.innerHTML = select[i] + ' : ' + info_select[i][info_select[i][0]];
            else 
                e.innerHTML = 'texture ' + select[i] + ' : ' + info_select[i][info_select[i][0]];
            return;
        };
    };

    for (i = 0; i < select.length; i++) {
        f_select(i);
    }
    $('info').onclick = function () {
        $('step-1').style.display = 'none';
        $('f-info').style.display = 'block';
        return;
    }

    $('f-info').onclick = function () {
        $('step-1').style.display = 'block';
        $('f-info').style.display = 'none';
        return;
    }
    $('start').onclick = function () {
        $('step-1').style.display = 'none';
        $('step-2').innerHTML = '<img src="image/help-kb.png"><h4>Click anywhere to continue.....</h4>';
        for (i = 0; i < select.length - 1; i++){
            imgPathTex[i] = 'image/' + select[i] + '/' + select[i] + '-' + info_select[i][0] + '.gif';
        }
        $('step-2').style.display = 'block';
        return;
    }
    $('step-2').onclick = function () {
        $('step-2').style.display = 'none';
        webGLStart();
        return;
    }

}).call(this);
