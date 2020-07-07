// ==UserScript==
// @name         디시의 목소리, 멘나스 (Wrapper)
// @name:en      Mennas, the Voice of DCInside (Wrapper)
// @version      1.8
// @description  침묵시켜야 할 자를 침묵시킵니다.
// @description:en Silence those who need to be silenced.
// @author       MennasAdministrator
// @namespace    mailto:MennasAdministrator@gallog.dcinside.com
// @match        https://gall.dcinside.com/board/lists*
// @match        https://gall.dcinside.com/board/view*
// @match        https://gall.dcinside.com/mgallery/board/lists*
// @match        https://gall.dcinside.com/mgallery/board/view*
// @match        https://m.dcinside.com/board/*
// @require         https://code.jquery.com/jquery-3.2.1.min.js
// ==/UserScript==


(function () {
    'use strict';
    var MENNAS = {
        wrapperVersion: '1.8',
        scriptURL: 'https://mennas.roguelike.network/script-min.js',
        blacklistServerURL: 'https://',
        galleryId: ''
    };
    localStorage.MENNAS = JSON.stringify(MENNAS);
    $.getScript(MENNAS.scriptURL);
})();
