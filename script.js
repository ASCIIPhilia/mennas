(function () {
    'use strict';
    /* ===== UTILS ===== */
    Element.prototype.appendAfter = function (element) {
        element.parentNode.insertBefore(this, element.nextSibling);
    }

    function getMobileCurrentNo() {
        return getMobileURLNo(location.href);
    }
    function getMobileURLNo(url) {
        return url.split('/').pop().split('?').shift();
    }
    function getQueryMap() {
        var p = [];
        window.location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi, (s, k, v) => p[k] = v);
        return p;
    }

    /* ===== ELEMENT PARSER ===== */
    function parsePCPostListElement(e) {
        return {
            no: parseInt([e.find('.gall_tit a').first().attr('href').split(/[&?]/gi).find((c) => c.startsWith('no='))].map(s => s ? s : 'no=-1')[0].split('no=')[1]),
            url: location.origin + e.find('.gall_tit a').attr('href'),
            gall_subject: e.find('.gall_subject').text(),
            subject: e.find('.gall_tit a').first().text(),
            subject_type: e.find('.gall_tit em').first().attr('class').split(' ').pop(),
            comments: e.find('.gall_tit .reply_num')[0] ? (e.find('.gall_tit .reply_num').text().split('/')[0] ? parseInt(e.find('.gall_tit .reply_num').text().split('/')[0].replace(/[\[\]]/g, '')) : 0) : 0,
            voice_comments: e.find('.gall_tit .reply_num')[0] ? (e.find('.gall_tit .reply_num').text().split('/')[1] ? parseInt(e.find('.gall_tit .reply_num').text().split('/')[1].replace(/[\[\]]/g, '')) : 0) : 0,
            uid: e.find('.gall_writer').data('uid'),
            ip: e.find('.gall_writer').data('ip'),
            nick: e.find('.gall_writer').data('nick'),
            nick_type: e.find('.writer_nikcon img')[0] ? e.find('.writer_nikcon img').attr('src').split('.').slice(-2).shift().split('/').slice(-1).pop() : void 0,
            date: e.find('.gall_date').attr('title'),
            count: parseInt(e.find('.gall_count').text()),
            recommends: parseInt(e.find('.gall_recommend').text()),
        }
    }

    const PC_POST_SELECTOR = '.gall_list .ub-content:not(:has(.gall_num:contains(공지), .gall_num:contains(설문)))';
    function getPCGalleryList() {
        return $(PC_POST_SELECTOR).toArray().map(e => $(e)).map(parsePCPostListElement);
    }

    function parseMobilePostListElement(e) {
        return {
            no: parseInt(e.find('a').attr('href').split('/').pop().split('?').shift()),
            url: e.find('a').attr('href'),
            subject: e.find('.detail-txt').text().trim(),
            subject_type: e.find('.sp-lst').attr('class').split(' ').pop(),
            nick: e.find('.ginfo > li:nth-child(1)').text(),
            nick_type: (e.find('.sp-nick').attr('class') ? e.find('.sp-nick').attr('class') : '').split(' ').pop(),
            date: e.find('.ginfo > li:nth-child(2)').text(),
            count: parseInt(e.find('.ginfo > li:nth-child(3)').text().split(' ').pop()),
            recommands: parseInt(e.find('.ginfo > li:nth-child(4)').text().split(' ').pop()),
            comments: parseInt(e.find('.ct').text()),
            voice_comments: e.find('.vo-txt')[0] ? parseInt(e.find('.vo-txt').text()) : 0
        }
    }

    const MOBILE_POST_SELECTOR = '.gall-detail-lnktb';
    function getMobileGalleryList() {
        return $(MOBILE_POST_SELECTOR).toArray().map(e => $(e)).map(parseMobilePostListElement);
    }

    function parsePCCommentListElement(e) {
        return {
            no: e.data('no'),
            ip: e.find('.gall_writer').data('ip'),
            nick: e.find('.gall_writer').data('nick'),
            nick_type: e.find('.writer_nikcon img')[0] ? e.find('.writer_nikcon img').attr('src').split('.').slice(-2).shift().split('/').slice(-1).pop() : void 0,
            comment: e.find('.usertxt').text(),
            date: e.find('.date_time').text()
        }
    }

    const PC_COMMENT_SELECTOR = '.cmt_info, .reply_info';
    function getPCCommentList() {
        return $(PC_COMMENT_SELECTOR).toArray().map(e => $(e)).map(parsePCCommentListElement);
    }

    function parseMobileCommentListElement(e) {
        return {
            no: e.attr('no'),
            nick: e.find('.nick').text(),
            nick_type: (e.find('.sp-nick').attr('class') ? e.find('.sp-nick').attr('class') : '').split(' ').pop(),
            date: e.find('.date').text(),
            comment: e.find('.txt').text()
        }
    }

    const MOBILE_COMMENT_SELECTOR = '.all-comment-lst > li.comment, .all-comment-lst > li.comment-add';
    function getMobileCommentList() {
        return $(MOBILE_COMMENT_SELECTOR).toArray().map(e => $(e)).map(parseMobileCommentListElement);
    }

    /* ===== HIDE LOGIC ===== */
    function setElementSilenced(e) {
        e.find('span').css('color', '#000000');
        e.find('li').css('color', '#000000');
        if (e.parent().hasClass('ub-content')) {
            e = e.parent();
        }
        e.css('border', '2px solid #413160');
        e.css('background-color', 'rgba(65, 49, 96, 0.5)');
    }

    function setBlockedInfo(e, type, data) {
        var blockedInfo = $('<p class="blocked_info" style="font-weight: bold; white-space: break-spaces;">').text(`* Blocker: ${data.authUser ? data.authUser : data.AUTH_USER}, Reason: ${data.reason}`);
        if (type == 'POST') {
            if (MENNAS.isPC) {
                var isAlreadyExist = e.find('.gall_tit .blocked_info').length;
                if (!isAlreadyExist) {
                    e.find('.gall_tit').append(blockedInfo);
                }
            } else if (MENNAS.isMobile) {
                var isAlreadyExist = e.find('.subject .blocked_info').length;
                if (!isAlreadyExist) {
                    e.find('.subject').append(blockedInfo);
                }
            }
        } else if (type == 'COMMENT') {
            if (MENNAS.isPC) {
                var isAlreadyExist = e.find('.cmt_txtbox .blocked_info').length;
                if (!isAlreadyExist) {
                    e.find('.cmt_txtbox').append(blockedInfo);
                }
            } else if (MENNAS.isMobile) {
                var isAlreadyExist = e.find('.blocked_info').length;
                if (!isAlreadyExist) {
                    e.append(blockedInfo);
                }
            }
        }
    }

    function applyMennasByMode(e, type, data) {
        if (localStorage.MENNAS_RESTORE_MODE == 'true') {
            setElementSilenced(e);
            setBlockedInfo(e, type, data);
        } else {
            e.hide();
        }
    }

    function isCommentBlocked(currentComment) {
        var isBlocked = currentComment && currentComment.isBlocked === true;
        var isLegacyBlocked = currentComment && currentComment.isBlocked === undefined;
        return isBlocked || isLegacyBlocked;
    }

    function isPostBlocked(isBlacklistPost) {
        return isBlacklistPost && isBlacklistPost.isBlocked
    }

    function hidePCElements(json) {
        var currentPost = json[MENNAS.queryMap.no];
        if (currentPost) {
            $(PC_COMMENT_SELECTOR).toArray().map(e => $(e)).forEach(e => {
                var no = parsePCCommentListElement(e).no;
                var currentComment = currentPost.comments[no];

                if (isCommentBlocked(currentComment)) {
                    applyMennasByMode(e, 'COMMENT', currentComment);
                }
            });
        }
        $(PC_POST_SELECTOR).toArray().map(e => $(e)).forEach(e => {
            var no = parsePCPostListElement(e).no;
            var isBlacklistPost = json[no];

            // 블랙 리스트 안에 존재하는 경우더래도 isBlocked가 거짓이면 차단 할 글이 아니므로
            if (isPostBlocked(isBlacklistPost)) {
                applyMennasByMode(e, 'POST', isBlacklistPost);
            }
        });
    }

    const MOBILE_RECOMMAND_SELECTOR = '#recom_box1';
    function hideMobileElements(json) {
        var currentNo = getMobileCurrentNo();
        var currentPost = json[currentNo];
        if (currentPost) {
            $(MOBILE_COMMENT_SELECTOR).toArray().map(e => $(e)).forEach(e => {
                var no = parseMobileCommentListElement(e).no;
                var currentComment = currentPost.comments[no];
                if (isCommentBlocked(currentComment)) {
                    applyMennasByMode(e, 'COMMENT', currentComment);
                }
            });
        }

        $(MOBILE_POST_SELECTOR).toArray().map(e => $(e)).forEach(e => {
            var no = parseMobilePostListElement(e).no;
            var isBlacklistPost = json[no];
            // 블랙 리스트 안에 존재하는 경우더래도 isBlocked가 거짓이면 차단 할 글이 아니므로
            if (isPostBlocked(isBlacklistPost)) {
                applyMennasByMode(e, 'POST', isBlacklistPost);
            }
        });

        var recommandURL = $(MOBILE_RECOMMAND_SELECTOR).find('#recom_title_topLink').attr('href').match(/(?<=')(http|https):\/\/.+?(?=')/gi);
        if (recommandURL) {
            recommandURL = recommandURL[0];
            var no = getMobileURLNo(recommandURL);
            var isBlacklistPost = json[no];
            // 블랙 리스트 안에 존재하는 경우더래도 isBlocked가 거짓이면 차단 할 글이 아니므로
            if (isPostBlocked(isBlacklistPost)) {
                applyMennasByMode($(MOBILE_RECOMMAND_SELECTOR), 'POST', isBlacklistPost);
            }
        }
    }

    function hideBlacklist(json) {
        if (MENNAS.isPC) {
            hidePCElements(json);
        } else if (MENNAS.isMobile) {
            hideMobileElements(json);
        }
    }

    function hideWithQuery() {
        fetch(MENNAS.blacklistServerURL + MENNAS.blacklistPath)
        .then(r => r.json())
        .then(json => {
            hideBlacklist(json);
            localStorage.MENNAS_CACHED_BLACKLIST = JSON.stringify(json);
        });
    }

    function hideWithoutQuery() {
        if (localStorage.MENNAS_CACHED_BLACKLIST) {
            try {
                var cachedJSON = JSON.parse(localStorage.MENNAS_CACHED_BLACKLIST);
                hideBlacklist(cachedJSON);
            } catch (e) {}
        }
    }

    function hide() {
        hideWithoutQuery();
        hideWithQuery();
    }

    /* ===== ADD CUSTOM UI & MENNAS INTERACTION LOGIC =====*/
    function requestBlock(data) {
        return fetch(MENNAS.blacklistServerURL + MENNAS.requestPath, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: encodeURIComponent(btoa(encodeURIComponent(JSON.stringify(data))))
        }).then(r => r.json());
    }

    function requestBlockWithAlert(data, text) {
        return requestBlock(data).then(r => {
            localStorage.MENNAS_CACHED_BLACKLIST = undefined;
            alert(text + '\n' + r.result);
        });
    }

    function addPCPostDeleteButton() {
        $(PC_POST_SELECTOR).find('.gall_num').css('cursor', 'pointer');
        $(PC_POST_SELECTOR).find('.gall_num').on('click', (e) => {
            e = $(e.target).parent();
            var info = parsePCPostListElement(e);
            var no = info.no;
            var targetText = `${info.no} ${info.subject} [${info.nick} (${info.ip})]`;
            var reason = prompt(`${targetText}\n\n 이유를 입력해주세요`);
            if (!reason) {
                alert('작업 취소됨');
                return;
            }
            var data = {
                cmd: 'post_blacklist_request',
                no,
                info,
                reason,
                authUser: localStorage.MENNAS_AUTH_USER,
                authCode: localStorage.MENNAS_AUTH_CODE
            };
            requestBlockWithAlert(data, targetText);
        });
    }

    function addMobilePostDeleteButtion() {
        $(MOBILE_POST_SELECTOR).find(' .lt').toArray().map(e => $(e)).forEach(e => {
            var isAlreadyExist = e.parent().find('.mt').toArray().length;
            if (!isAlreadyExist) {
                var deleteButton = $('<a href="#" class="rt mt"><span class="ct">D</span></a>');
                deleteButton.on('click', e => {
                    e = $(e.target).parent().parent();
                    var info = parseMobilePostListElement(e);
                    var no = info.no;
                    var targetText = `${info.no} ${info.subject} [${info.nick}]`;
                    var reason = prompt(`${targetText}\n\n 이유를 입력해주세요`);
                    if (!reason) {
                        alert('작업 취소됨');
                        return;
                    }
                    var data = {
                        cmd: 'post_blacklist_request',
                        no,
                        info,
                        reason,
                        authUser: localStorage.MENNAS_AUTH_USER,
                        authCode: localStorage.MENNAS_AUTH_CODE
                    };
                    requestBlockWithAlert(data, targetText);
                });
                deleteButton[0].appendAfter(e[0]);
            }
        });
    }

    function addPCCommentDeleteButton() {
        $(PC_COMMENT_SELECTOR).find('.date_time').css('cursor', 'pointer');
        $(PC_COMMENT_SELECTOR).find('.date_time').off('click').on('click', e => {
            e = $(e.target).parent().parent();
            var info = parsePCCommentListElement(e);
            var no = info.no;
            var postNo = MENNAS.queryMap.no;
            var targetText = `${info.no} ${info.comment} [${info.nick} ${info.ip}]`;
            var reason = prompt(`${targetText}\n\n이유를 입력해주세요`);
            if (!reason) {
                alert('작업 취소됨');
                return;
            }
            var data = {
                cmd: 'comment_blacklist_request',
                info,
                postNo,
                no,
                reason,
                authUser: localStorage.MENNAS_AUTH_USER,
                authCode: localStorage.MENNAS_AUTH_CODE
            };
            requestBlockWithAlert(data, targetText);
        });
    }

    function addMobileCommentDeleteButton() {
        $(MOBILE_COMMENT_SELECTOR).find('.date').off('click').on('click', e => {
            e = $(e.target).parent();
            var info = parseMobileCommentListElement(e);
            var no = info.no;
            var postNo = location.href.split('/').pop().split('?').shift();

            var targetText = `${info.no} ${info.comment} [${info.nick}]`;
            var reason = prompt(`${targetText}\n\n이유를 입력해주세요`);
            if (!reason) {
                alert('작업 취소됨');
                return;
            }
            var data = {
                cmd: 'comment_blacklist_request',
                info,
                postNo,
                no,
                reason,
                authUser: localStorage.MENNAS_AUTH_USER,
                authCode: localStorage.MENNAS_AUTH_CODE
            };
            requestBlockWithAlert(data, targetText);
        });
    }

    function authMennas() {
        localStorage.MENNAS_AUTH_USER = prompt('유저 이름을 입력해주세요');
        localStorage.MENNAS_AUTH_CODE = prompt('코드를 입력해주세요');
        localStorage.MENNAS_RESTORE_MODE = confirm('복구 모드를 사용할까요? (글이 가려지지 않음)');
        alert(`성공적으로 멘나스 계정을 설정했습니다.\nMennas, the Voice of DCInside V${MENNAS.version}/WV${MENNAS.wrapperVersion}\nby ASCIIPhilia (https://mennas.roguelike.network)\nBlacklist Server: ${MENNAS.blacklistServerURL}\nGalleryId: ${MENNAS.galleryId}`);
    }

    function addPCAuthButton() {
        var authButton1 = $('<button type="button" class="" onclick="">멘나스</button>');
        authButton1.on('click', authMennas);
        $('.array_tab').append(authButton1);
        var authButton2 = $('<button type="button" class="btn_white">멘나스</button>');
        authButton2.on('click', authMennas);
        $('.view_bottom_btnbox .fl').append(authButton2);
    }
	function addPCCommentHook(){
		self._viewComments = viewComments;
			viewComments = function () {
				_viewComments.apply(_viewComments, arguments);
				hide();
				addPCCommentDeleteButton();
			}
	}

    function addMobileAuthButton() {
        var authButton = $('<a class="lnk" href="#">멘나스</a>');
        authButton.on('click', authMennas);
        $('.gall-lnk-box').append(authButton);
    }

    function addPCMennasInfo() {
        var mennasInfo = $(`<div class="copyright"><a href="https://mennas.roguelike.network">Mennas V${MENNAS.version}/WV${MENNAS.wrapperVersion} by ASCIIPhilia</a></div>`);
        $('.dcfoot').append(mennasInfo);
    }

    function addMobileMennasInfo() {
        var mennasInfo = $(`<a href="https://mennas.roguelike.network"><p class="cpt">Mennas V${MENNAS.version}/WV${MENNAS.wrapperVersion} by ASCIIPhilia</p></a>`);
        $('.ft-btm').append(mennasInfo);
    }
	

    /* ===== INIT & CORE LOGIC ===== */
    function initMennas() {
        try {
            self.MENNAS = JSON.parse(localStorage.MENNAS);
        } catch (e) {
            console.error('Mennas Wrapper is not exist.');
            return;
        }
        MENNAS.version = '1.8';

        MENNAS.isPC = location.href.includes(`id=${MENNAS.galleryId}`);
        MENNAS.isMobile = location.href.includes(`/${MENNAS.galleryId}`);

        MENNAS.requestPath = '/request';
        MENNAS.blacklistPath = `/blacklist?version=${MENNAS.version}`;
        MENNAS.queryMap = getQueryMap();
        console.log(`%cMennas, the Voice of DCInside V${MENNAS.version}/WV${MENNAS.wrapperVersion}`, 'font-size:450%;font-weight:bold;color:#413160;font-family:dotum;');
        console.log('%cby ASCIIPhilia (https://mennas.roguelike.network)', 'font-size:150%;font-weight:bold;');
        console.log(`Blacklist Server: ${MENNAS.blacklistServerURL}`);
        console.log(`GalleryId: ${MENNAS.galleryId}`);
    }
    const observerConfig = {
        attributes: true,
        childList: true,
        characterData: true
    };
	
    function initPC() {
        hide();
        addPCPostDeleteButton();
        addPCCommentDeleteButton();
        addPCAuthButton();
        addPCMennasInfo();
		addPCCommentHook();
    }

    function initMobile() {
        hide();
        addMobileCommentDeleteButton();
        addMobilePostDeleteButtion();
        addMobileAuthButton();
        addMobileMennasInfo();
        var mutationCallback = (m) => {
            hide();
            addMobileCommentDeleteButton();
            addMobilePostDeleteButtion();
        };

        var postObserver1 = new MutationObserver(mutationCallback);
        var postObserver2 = new MutationObserver(mutationCallback);
        var commentObserver = new MutationObserver(mutationCallback);

        try {
            postObserver1.observe($('section:has(.gall-detail-lst)')[0], observerConfig);
        } catch (e) {}
        try {
            postObserver2.observe($('.gall-detail-lst')[0], observerConfig);
        } catch (e) {}
        try {
            commentObserver.observe($('#comment_box')[0], observerConfig);
        } catch (e) {}
    }

    function startMennas() {
        if (MENNAS.isPC) {
            initPC();
        } else if (MENNAS.isMobile) {
            initMobile();
        }
    }

    /* ===== START MENNAS ===== */
    initMennas();
    startMennas();
})();
