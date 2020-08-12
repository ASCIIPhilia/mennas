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
    function parsePCPostElement(e) {
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

    const PC_POST_SELECTOR = '.gall_list .ub-content:not(:has(.gall_num:contains(공지), .gall_num:contains(설문), .gall_num:contains(뉴스), .gall_num:contains(AD)))';
    // TODO AD, 뉴스
    function getPCGalleryList() {
        return $(PC_POST_SELECTOR).toArray().map(e => $(e)).map(parsePCPostElement);
    }

    function parseMobilePostElement(e) {
        return {
            no: parseInt(e.find('a').attr('href').split('/').pop().split('?').shift()),
            url: e.find('a').attr('href'),
            subject: e.find('.detail-txt').text().trim(),
            subject_type: e.find('.sp-lst').attr('class').split(' ').pop(),
            nick: e.find('.ginfo > li:nth-child(1)').text(),
            nick_type: (e.find('.sp-nick').attr('class') ? e.find('.sp-nick').attr('class') : '').split(' ').pop(),
            date: e.find('.ginfo > li:nth-child(2)').text(),
            count: parseInt(e.find('.ginfo > li:nth-child(3)').text().split(' ').pop()),
            recommends: parseInt(e.find('.ginfo > li:nth-child(4)').text().split(' ').pop()),
            comments: parseInt(e.find('.ct').text()) + (e.find('.vo-txt')[0] ? parseInt(e.find('.vo-txt').text()) : 0),
            voice_comments: e.find('.vo-txt')[0] ? parseInt(e.find('.vo-txt').text()) : 0
        }
    }

    const MOBILE_POST_SELECTOR = '.gall-detail-lnktb';
    function getMobileGalleryList() {
        return $(MOBILE_POST_SELECTOR).toArray().map(e => $(e)).map(parseMobilePostElement);
    }

    function parsePCCommentElement(e) {
        return {
            no: e.data('no'),
            ip: e.find('.gall_writer').data('ip'),
            nick: e.find('.gall_writer').data('nick'),
            nick_type: e.find('.writer_nikcon img')[0] ? e.find('.writer_nikcon img').attr('src').split('.').slice(-2).shift().split('/').slice(-1).pop() : void 0,
            comment: e.find('p').text(),
            date: e.find('.date_time').text(),
            is_voice: e.find('.btn-voice').length > 0,
            is_dccon: e.find('.coment_dccon_img').length > 0
        }
    }

    const PC_COMMENT_SELECTOR = '.cmt_info, .reply_info';
    function getPCCommentList() {
        return $(PC_COMMENT_SELECTOR).toArray().map(e => $(e)).map(parsePCCommentElement);
    }

    function parseMobileCommentElement(e) {
        return {
            no: e.attr('no'),
            nick: e.find('.nick').text(),
            nick_type: (e.find('.sp-nick').attr('class') ? e.find('.sp-nick').attr('class') : '').split(' ').pop(),
            date: e.find('.date').text(),
            comment: e.find('.txt').text(),
            is_voice: e.find('.btn-voice').length > 0,
            is_dccon: e.find('p.txt > img').length > 0,
        }
    }

    const MOBILE_COMMENT_SELECTOR = '.all-comment-lst > li.comment, .all-comment-lst > li.comment-add';
    function getMobileCommentList() {
        return $(MOBILE_COMMENT_SELECTOR).toArray().map(e => $(e)).map(parseMobileCommentElement);
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

    function timeDelta2Simple(delta) {
        delta = Math.floor(delta / 1000);
        if (delta < 60) {
            return delta + '초';
        } else if (delta < 60 * 60) {
            return Math.floor(delta / 60) + '분';
        } else if (delta < 24 * 60 * 60) {
            return Math.floor(delta / (60 * 60)) + '시간';
        } else if (delta < 365 * 24 * 60 * 60) {
            return Math.floor(delta / (24 * 60 * 60)) + '일';
        } else {
            return Math.floor(delta / (365 * 24 * 60 * 60)) + '년';
        }
    }

    function setBlockedInfo(e, type, data) {
        var blockedInfo = $('<p class="blocked_info" style="font-weight: bold; white-space: break-spaces;">').text(`* 차단자: ${data.authUser ? data.authUser : data.AUTH_USER} / 이유: ${data.reason} / ${timeDelta2Simple(new Date() - new Date(data.queryDate).getTime())} 전`);
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
    function hideElement(e) {
        try {
            if (e.parent().hasClass('ub-content')) {
                e = e.parent();
                if (e.parent().find('.ub-content').length == e.parent().find('.ub-content:hidden').length) {
                    e = e.parent().parent().parent().parent();
                }
            }
        } catch (e) {}
        e.hide();
    }

    function applyMennasByMode(e, type, data) {
        if (localStorage.MENNAS_RESTORE_MODE == 'true') {
            setElementSilenced(e);
            setBlockedInfo(e, type, data);
        } else {
            hideElement(e);
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

    function getTotalBlockedCommentNumber(comments) {
        var blockedNumber = 0;
        for (const key in comments) {
            var value = comments[key];
            blockedNumber += value.isBlocked ? 1 : 0;
        }
        return blockedNumber;
    }
    function getBlockedVoiceCommentNumber(comments) {
        var blockedNumber = 0;
        for (const key in comments) {
            var value = comments[key];
            blockedNumber += value.isBlocked && value.info && value.info.is_voice ? 1 : 0;
        }
        return blockedNumber;
    }

    function applyBlockedCommentNumber(e, data) {
        var totalNumber = 0;
        var voiceNumber = 0;
        var nonVoiceNumber = 0;
        if (data && data.comments) {
            totalNumber = getTotalBlockedCommentNumber(data.comments);
            voiceNumber = getBlockedVoiceCommentNumber(data.comments);
            nonVoiceNumber = totalNumber - voiceNumber;
        }

        if (totalNumber != 0) {
            if (localStorage.MENNAS_RESTORE_MODE == 'true') {
                if (MENNAS.isPC) {
                    var comment = parsePCPostElement(e);
                    var fixCommentNumber = comment.comments - totalNumber;
                    if (e.find('.blocked_reply_num').length == 0 && fixCommentNumber > 0) {
                        e.find('.reply_num').append($(`<span class="blocked_reply_num" style="font-weight:bold; color:#413160; font-size:12px; display: inline-table; letter-spacing: 0em;">&nbsp;-${totalNumber}</span>`));
                    }
                } else if (MENNAS.isMobile) {
                    var comment = parseMobilePostElement(e);
                    var fixCommentNumber = comment.comments - totalNumber;
                    if (e.find('.blocked_reply_num').length == 0 && fixCommentNumber > 0) {
                        e.find('.rt').append($(`<span class="ct blocked_reply_num" style="font-weight:bold; color:#413160;">-${totalNumber}</span>`));
                    }
                }
            } else {
                if (MENNAS.isPC) {
                    if (e.find('.blocked_number_fixed').length == 0) {
                        var comment = parsePCPostElement(e);
                        var fixCommentNumber = comment.comments - totalNumber;
                        fixCommentNumber = fixCommentNumber < 0 ? 0 : fixCommentNumber;
                        var fixVoiceNumber = comment.voice_comments - voiceNumber;
                        fixVoiceNumber = fixVoiceNumber < 0 ? 0 : fixVoiceNumber;
                        if (fixCommentNumber > 0) {
                            e.find('.gall_tit .reply_num').addClass('blocked_number_fixed').text(`[${fixCommentNumber}` + (fixVoiceNumber ? `/${fixVoiceNumber}]` : ']'));
                        } else {
                            e.find('.gall_tit .reply_num').addClass('blocked_number_fixed').text('');
                        }
                    }
                } else if (MENNAS.isMobile) {
                    if (e.find('.blocked_number_fixed').length == 0) {
                        var comment = parseMobilePostElement(e);
                        var fixNonVoiceCommentNumber = comment.comments - comment.voice_comments - nonVoiceNumber;
                        fixNonVoiceCommentNumber = fixNonVoiceCommentNumber < 0 ? 0 : fixNonVoiceCommentNumber;
                        var fixVoiceNumber = comment.voice_comments - voiceNumber;
                        e.find('.ct').addClass('blocked_number_fixed').text(fixNonVoiceCommentNumber);
                        if (fixVoiceNumber > 0) {
                            e.find('.vo-txt').addClass('blocked_number_fixed').text(fixVoiceNumber);
                        } else {
                            e.find('.vo').hide();
                        }
                    }
                }
            }
        }
    }
    function applyBlockedCommentNumber2CurrentPost(data) {

        if (localStorage.MENNAS_RESTORE_MODE != 'true') {
            var totalNumber = 0;

            if (data && data.comments) {
                totalNumber = getTotalBlockedCommentNumber(data.comments);
            }

            if (MENNAS.isPC) {
                if ($('.info_fixed').length == 0) {
                    var commentNumber = parseInt($('.gall_comment').text().split(' ').pop());
                    var fixedNumber = commentNumber - totalNumber;
                    fixedNumber < 0 ? 0 : fixedNumber;
                    $('.gall_comment').addClass('info_fixed').text(`댓글 ${fixedNumber}`);
                    $('.font_red span').addClass('info_fixed').text(`${fixedNumber}`);
                }

                if ($('.info_update_wait').length > 0) {
                    $('.info_update_wait').removeClass('info_update_wait');
                    var commentNumber = parseInt($('.font_red span').text());
                    var fixedNumber = commentNumber - totalNumber;
                    fixedNumber < 0 ? 0 : fixedNumber;
                    $('.font_red span').text(`${fixedNumber}`);
                }

            } else if (MENNAS.isMobile) {
                if ($('.info_fixed').length == 0) {
                    var commentNumber = parseInt($('.ginfo2 .point-red').text());
                    var fixedNumber = commentNumber - totalNumber;
                    fixedNumber < 0 ? 0 : fixedNumber;
                    $('.ginfo2 .point-red').addClass('info_fixed').text(`${fixedNumber}`);
                    $('.tit-box .ct').addClass('info_fixed').text(`[${fixedNumber}]`);
                    $('.update-re .ct').addClass('info_fixed').text(`[${fixedNumber}]`);
                }

                if ($('.info_update_wait').length > 0) {
                    $('.info_update_wait').removeClass('info_update_wait');
                    var commentNumber = parseInt($('.update-re .ct').text().split('').slice(1).reverse().slice(1).reverse().join(''));
                    var fixedNumber = commentNumber - totalNumber;
                    fixedNumber < 0 ? 0 : fixedNumber;
                    $('.tit-box .ct').text(`[${fixedNumber}]`);
                    $('.update-re .ct').text(`[${fixedNumber}]`);
                }

            }
        }
    }

    function hidePCElements(json) {
        var currentPost = json[MENNAS.queryMap.no];
        if (currentPost) {
            $(PC_COMMENT_SELECTOR).toArray().map(e => $(e)).forEach(e => {
                var no = parsePCCommentElement(e).no;
                var currentComment = currentPost.comments[no];

                if (isCommentBlocked(currentComment)) {
                    applyMennasByMode(e, 'COMMENT', currentComment);
                }
            });
            applyBlockedCommentNumber2CurrentPost(currentPost);
        }
        $(PC_POST_SELECTOR).toArray().map(e => $(e)).forEach(e => {
            var no = parsePCPostElement(e).no;
            var isBlacklistPost = json[no];

            // 블랙 리스트 안에 존재하는 경우더래도 isBlocked가 거짓이면 차단 할 글이 아니므로
            if (isPostBlocked(isBlacklistPost)) {
                applyMennasByMode(e, 'POST', isBlacklistPost);
            }
            applyBlockedCommentNumber(e, isBlacklistPost);
        });
    }

    const MOBILE_RECOMMEND_SELECTOR = '#recom_box1';
    const MOBILE_RECOMMEND_BOX_SELECTOR = '#recom_title_box';
    function hideMobileElements(json) {
        var currentNo = getMobileCurrentNo();
        var currentPost = json[currentNo];
        if (currentPost) {
            $(MOBILE_COMMENT_SELECTOR).toArray().map(e => $(e)).forEach(e => {
                var no = parseMobileCommentElement(e).no;
                var currentComment = currentPost.comments[no];
                if (isCommentBlocked(currentComment)) {
                    applyMennasByMode(e, 'COMMENT', currentComment);
                }
            });
            applyBlockedCommentNumber2CurrentPost(currentPost);
        }

        $(MOBILE_POST_SELECTOR).toArray().map(e => $(e)).forEach(e => {
            var no = parseMobilePostElement(e).no;
            var isBlacklistPost = json[no];

            // 블랙 리스트 안에 존재하는 경우더래도 isBlocked가 거짓이면 차단 할 글이 아니므로
            if (isPostBlocked(isBlacklistPost)) {
                applyMennasByMode(e, 'POST', isBlacklistPost);
            }
            applyBlockedCommentNumber(e, isBlacklistPost);
        });

        if ($(MOBILE_RECOMMEND_SELECTOR).length) {
            var recommendURL = $(MOBILE_RECOMMEND_SELECTOR).find('#recom_title_topLink').attr('href').match(/['"](http|https):\/\/.+?['"]/gi);
            if (recommendURL) {
                recommendURL = recommendURL[0].split('').slice(1).reverse().slice(1).reverse().join('');
                var no = getMobileURLNo(recommendURL);
                var isBlacklistPost = json[no];
                // 블랙 리스트 안에 존재하는 경우더래도 isBlocked가 거짓이면 차단 할 글이 아니므로
                if (isPostBlocked(isBlacklistPost)) {
                    applyMennasByMode($(MOBILE_RECOMMEND_SELECTOR), 'POST', isBlacklistPost);
                }
            }
        }
        if ($(MOBILE_RECOMMEND_BOX_SELECTOR).length) {
            $(MOBILE_RECOMMEND_BOX_SELECTOR).find('li').toArray().map(e => $(e)).forEach(e => {
                var recommendURL = e.find('a').attr('href').match(/['"](http|https):\/\/.+?['"]/gi);
                if (recommendURL) {
                    recommendURL = recommendURL[0].split('').slice(1).reverse().slice(1).reverse().join('');
                    var no = getMobileURLNo(recommendURL);
                    var isBlacklistPost = json[no];
                    // 블랙 리스트 안에 존재하는 경우더래도 isBlocked가 거짓이면 차단 할 글이 아니므로
                    if (isPostBlocked(isBlacklistPost)) {
                        applyMennasByMode(e, 'POST', isBlacklistPost);
                    }
                }
            });
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
            var info = parsePCPostElement(e);
            var no = info.no;
            var targetText = `${info.no} ${info.subject} [${info.nick}${info.ip ? `($ {
                info.ip
            })` : ''}]`;
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
                    var info = parseMobilePostElement(e);
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
            var info = parsePCCommentElement(e);
            var no = info.no;
            var postNo = parseInt(MENNAS.queryMap.no);
            var targetText = `${info.no} ${info.comment} [${info.nick}${info.ip ? `($ {
                info.ip
            })` : ''}]`;
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
            var info = parseMobileCommentElement(e);
            var no = info.no;
            var postNo = parseInt(getMobileCurrentNo());

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
        var inputUserName = prompt('유저 이름을 입력해주세요' + (localStorage.MENNAS_AUTH_USER ? `\n취소 버튼: ${localStorage.MENNAS_AUTH_USER}` : ''));
        localStorage.MENNAS_AUTH_USER = inputUserName ? inputUserName : localStorage.MENNAS_AUTH_USER;

        var inputAuthCode = prompt('코드를 입력해주세요' + (localStorage.MENNAS_AUTH_CODE ? `\n취소 버튼: ${localStorage.MENNAS_AUTH_CODE}` : ''));
        localStorage.MENNAS_AUTH_CODE = inputUserName ? inputAuthCode : localStorage.MENNAS_AUTH_CODE;

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

    function addPCCommentHook() {
        if (self.viewComments) {
            self._viewComments = self.viewComments;
            self.viewComments = function () {
                self._viewComments.apply(self._viewComments, arguments);
                $('.font_red span').addClass('info_update_wait');
                hide();
                addPCCommentDeleteButton();
            }
        }
    }

    function addMobileRecommendToggleHook() {
        if (self.recom_toggle) {
            self._recom_toggle = self.recom_toggle;
            self.recom_toggle = function () {
                self._recom_toggle.apply(self._recom_toggle, arguments);
                hide();
            }
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
        MENNAS.version = '2.1.7';

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
        if (localStorage.MENNAS_RESTORE_MODE == 'true') {
            addMobilePostDeleteButtion();
        }
        addMobileAuthButton();
        addMobileMennasInfo();
        addMobileRecommendToggleHook();
        var mutationCallback = (m) => {
            hide();
            addMobileCommentDeleteButton();
            if (localStorage.MENNAS_RESTORE_MODE == 'true') {
                addMobilePostDeleteButtion();
            }
        };

        var postObserver1 = new MutationObserver(mutationCallback);
        var postObserver2 = new MutationObserver(mutationCallback);
        var commentObserver = new MutationObserver((m) => {
            $('.tit-box .ct').addClass('info_update_wait');
            $('.update-re .ct').addClass('info_update_wait');
            mutationCallback(m);
        });

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
