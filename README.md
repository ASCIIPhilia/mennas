# 디시의 목소리, 멘나스
멘나스는 로그라이크 갤러리에서 악성 도배 유저를 저지하기 위해 만들어진 공유 블랙리스트 기반의 디시인사이드 게시글 검열 프로그램입니다.

기능 소개
 - 디시인사이드 PC 웹과 모바일 웹에서 공유 블랙리스트에 등록된 글과 댓글이 표시되지 않습니다.
 - 디시인사이드 PC 웹과 모바일 웹에서 공유 블랙리스트를 이름과 인증 코드로 권한을 얻은 사람이 수정할 수 있습니다.


### 설치 방법(로그라이크 갤러리 일반 사용자)
  1. 유저 스크립트 관리자를 설치합니다. Tampermonkey/Greasemonkey/Violentmonkey에서 작동을 확인하였습니다. 가장 권장하는 유저 스크립트 관리자는 [Tampermonkey(Chrome)](https://chrome.google.com/webstore/detail/dhdgffkkebhmkfjojejmpbldmpobfkfo)/[Tampermonkey(Firefox)](https://addons.mozilla.org/ko/firefox/addon/tampermonkey/)입니다.
Android Mobile의 경우 Kiwi Browser, Firefox 등의 브라우저에서 유저 스크립트 관리자 확장 프로그램 설치를 지원합니다.
유저 스크립트 관리자 설치를 지원하지 않는 브라우저를 사용하는 경우 AdGuard 확장 프로그램 기능을 이용하여 설치할 수 있습니다.

  2. [로갤의 목소리, 멘나스](https://greasyfork.org/ko/scripts/406493-%EB%A1%9C%EA%B0%A4%EC%9D%98-%EB%AA%A9%EC%86%8C%EB%A6%AC-%EB%A9%98%EB%82%98%EC%8A%A4)를 설치합니다.

### 사용 방법(로그라이크 갤러리 블랙리스트 편집자)
  1. 디시인사이드 웹 페이지에 추가된 "멘나스" 버튼을 누릅니다.
  2. 이름과 인증 코드를 입력합니다.
  3. 복구 모드 사용 여부를 결정합니다. 복구 모드에서는 블랙리스트에 추가된 글과 댓글이 사라지지 않고 보라색으로 강조 표시되며 해당 글과 댓글 아래에 블랙리스트에 추가한 편집자명과 블랙리스트 등록 사유가 출력됩니다.
  4. 글과 댓글을 다음과 같은 방법으로 블랙리스트에 추가/제거합니다.
```  
PC 웹-게시글: 글 번호를 클릭하여 블랙리스트에 추가/제거
PC 웹-댓글: 작성 시간을 클릭하여 블랙리스트에 추가/제거
모바일 웹-게시글: 댓글 왼쪽에 추가된 D 버튼을 터치하여 블랙리스트에 추가/제거
모바일 웹-댓글: 작성 시간을 터치하여 블랙리스트에 추가/제거
```
### 사용 방법(관리자)
  1-1. Node.js가 설치된 환경에서 멘나스 블랙리스트 서버를 실행하기 위해 다음 명령을 실행합니다. (세부 설정은 1-2. 참조)
```
git clone https://github.com/ASCIIPhilia/mennas
cd mennas
npm install
npm start
```
  1-2. [index.js](https://github.com/ASCIIPhilia/mennas/blob/master/userscript-wrapper.js)의 다음 부분을 수정하여 맞춤 설정합니다.
```
const port = process.env.PORT || 5050;
const backupTime = 1000 * 60 * 10;
console.log('BACKUP TIME: ' + backupTime);

const authMap = {
    'AuthUser': 'AuthCode'
};
```
  2. Apache 혹은 Nginx 또는 그 외의 HTTPS Reverse Proxy를 지원하는 웹 서버를 사용하여 최종 사용자에게 HTTPS로 멘나스 블랙리스트를 제공합니다.
  
  3. [userscript-wrapper.js](https://github.com/ASCIIPhilia/mennas/blob/master/userscript-wrapper.js)의 blacklistServerURL, galleryId를 수정합니다.
  다음은 로그라이크 갤러리에 적용된 멘나스의 설정입니다.
```
var MENNAS = {
    wrapperVersion: '1.8',
    scriptURL: 'https://mennas.roguelike.network/script-min.js',
    blacklistServerURL: 'https://mennas-rlike.roguelike.network',
    galleryId : 'rlike'
};
```
  4. [GreasyFork](http://greasyfork.org)등의 유저 스크립트 배포 사이트를 이용하여 공개 배포합니다.
  
  *. `${MENNAS.blacklistServerURL}/blacklist` 경로에서 블랙리스트 JSON을 얻을 수 있습니다.
  
### 기타
Pull Request 환영합니다. 개선 사항, 버그는 Issue에 등록해주세요.
