---
title: "로컬 환경에서 HTTPS로 개발 서버 실행하는 방법"
date: 2025-07-07 14:54:24
category: "http"
tags: ["HTTPS", "웹 보안", "caddy", "mkcert", "Next.js"]
isPrivate: false
---

# 서론

"캠스터디" 프로젝트의 백엔드에서 로그인할 때 헤더에 쿠키를 설정하도록 수정했다. 그런데 문제는 쿠키는 HTTPS 환경에서만 적용된다는 것이었다. 실제 로컬 환경에서는 이 부분을 테스트할 수 없어서 로컬 개발 환경에서도 HTTPS를 설정하는 방법을 찾아보았습니다.

대략 세가지 정도로 정리할 수 있겠습니다.

우선, HTTPS가 보안에 유리하고 권장된다는 정도는 알지만 자세히 몰라서 살짝 정리를 해보고 넘어가겠습니다.

# HTTPS ?

## 정의

HTTP에 보안 계층 (TLS / SSL)을 추가한 프로토콜.

## 목적

- 서버 인증 : 진짜 서버인지 확인
- 데이터 암호화 : 도청/변조 방지

## 동작 방식

1. 인증서 교환

- 서버가 인증기고나에서 발급받은 디지털 인증서를 클라이언트에 제시
- 클라이언트가 인증기관 서명을 검증

2. 세션 키 생

- 대칭키 암호화를 위한 임시 '세션 키'를 안전하게 교환 (ECDHE 등) (이게 뭔디?)

3. 암호화 통신

- 이후 HTTP 요청/응답 전체 (URL, 헤더, 본문, 쿠기 등)를 셋녀 키로 암호화

## 주요 이점

- 기밀성 : 중간에서 패킷을 가로채도 내용 해독 불가
- 무결성 : 전송 중 데이터 변조 시 알아챌 수 있음
- 인증 : 서버 (및 옵션으로 클라이언트) 신원을 보장
- 보안 강화 : 중간자 공격 (MITM)/SSL 스트리핑 방어

## 도입 시 유의 사항

- 인증서 발급 : 무료 Let's Ecrypt 활용 권장
- 포트 설정 : HTTPS 기본 443번
- 강제 HTTPS : HTTP 요청 -> HTTPS 리다이렉트, HSTS 헤더 적용
- 쿠키 보안: `Secure` 속성 설정 -> HTTPS에서만 전송

## 부가기능 및 최신 동향

- HTTP/2 , HTTP/3 지원 -> 성능 개선
- 완전 순방향 비밀성 (PFS)
- OCSP/CRL 활용한 인증서 폐기 확인
- SNI (Server Name Indication) -> 동일 IP에서 여러 도메인 HTTPS 지원

# 로컬 환경에서 HTTS로 개발서버 실행하는 방법

## 방법 1. Caddy 사용

### Caddy?

- Go로 작성
- 사이트, 서비스, 앱을 제공할 수 있는 강력하고 확장 가능한 플랫폼
- 대부분의 사람이 Caddy를 웹 서버나 프록시로 사용하지만 핵심은 "서버의 서버" -> 필요한 모듈만 있으면 어떤 장기 실행 프로세스의 역할도 수행 가능
- 구성 파일이 필요하지 않지만 대부분의 사람들이 가장 선호하는 방식은 Caddyfile을 사용하는 것
- Caddy의 기본 구성 언어는 JSON
- 모든 주요 플랫폼에서 컴파일되며 런타임 종속성이 없음

### 내가 설정한 방식

1. Caddy 설치

   저는 Mac OS라서

   ```bash
   brew install caddy
   ```

   명령어로 설치를 했습니다.

   https://caddyserver.com/docs/install

   다른 환경에서 설치하는 법은 위의 내용을 참고하시면 될 것 같습니다.

2. Caddyfile 작성
   프로젝트 root 경로에 "Caddyfile" 을 생성해줍니다.

   가장 먼저 입력해야하는 것은 사이트 주소라는데 저는 현재 로컬 환경에서 사용하는 것이기 때문에

   `localhost`를 적어줍니다.

   `reverse_proxy localhost:3001` 또한 작성하는데,
   localhost 주소로 들어오는 모든 요청을 백엔드 서버(localhost:3001)로 전달하라는 의미입니다.

3. npm run dev / caddy run

   우선 package.json에서 스크립트를 변경해줍니다.

   ```json
       "dev": "next dev --turbo -p 3001",
   ```

   포트를 3001로 지정해줍니다. 이 상태에서 `npm run dev`를 실행하고 caddy run 을 실행해줍니다.

4. `https://localhost.com` 로 접속하기

이렇게 설정된 상태로 위의 주소로 접속하면 개발할 때도 HTTPS 환경으로 설정할 수 있습니다.

## 방법 2. mkcert

> mkcert는 로컬에서 신뢰할 수 있는 개발 인증서를 만들기 위한 간단한 도구입니다. 구성이 필요하지 않습니다.

라고 github README에 설명이 되어있네요.

그럼 README를 보고 설정을 시작하겠습니다.

```
brew install mkcert
```

설치를 해줍니다.

```
mkcert localhost
```

localhost 라는 이름의 인증서를 발급받습니다.

localhost.pem / localhost-key.pem이 생성됩니다.

root 경로에 `server.js 파일을 만들어 줍니다.

custom server 파일인데,

```js
import https from "https";
import fs from "fs";
import path from "path";
import next from "next";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const certPath = (filename) => path.join(process.cwd(), filename);

app.prepare().then(() => {
  https
    .createServer(
      {
        key: fs.readFileSync(certPath("localhost-key.pem")),
        cert: fs.readFileSync(certPath("localhost.pem")),
      },
      (req, res) => {
        handle(req, res);
      }
    )
    .listen(3000, (err) => {
      if (err) throw err;
      console.log("🚀 HTTPS Dev Server ready: https://localhost:3000");
    });
});
```

이렇게 작성해준 뒤, package.json에서 `type: "module"`, script 에서 dev script 를 수정해줍니다.

```json
  "name": "cam-study",
  "version": "0.1.0",
  "private": true,
  "type": "module",
```

```json
    "dev": "node server.js",
```

이렇게 하면 `npm run dev 명령어 실행 시 HTTPS 환경의 서버가 띄워집니다.

## 방법 3. next.js 일 때 사용할 수 있는 방법 (비추)

구글링을 하다가

https://vercel.com/guides/access-nextjs-localhost-https-certificate-self-signed

이 페이지를 발견해서 들어가 봤는데, 비교적 아주 간단한 방법으로 HTTPS 환경으로 설정할 수 있는 것 같아서 바로 시도해봤다.

```
next dev --experimental-https
```

를 명령어로 입력하면 된다고 하기에 package.json 의 script를 수정했다.

하지만 이렇게 했을 때 HTTPS 환경이 되긴 했지만 문제는 느려도 너무 느렸다. 이런 환경에서 개발을 할 수 없다고 느껴서 이건 비추하겠습니다.

`--turbo` 명령어를 추가해 Turbopack 으로 개발서버를 띄워도 체감상 변화가 없어서 이 방법은 추천하지 않습니다.

# 마무리

방법 3은 비추를 하기 때문에 방법 1과 2 그러니까 caddy와 mkcert를 둘 다 사용해봤는데,

속도는 체감상 비슷한 느낌이었는데, 사실 이것도 궁금해서 나중에 둘의 속도를 측정해보고자 한다.

(사실 금방 할 수 있을 줄 알았는데 생각보다 복잡해보여서 나중으로 미룹니다...)

우선 정말 간단하게 설정했던건 caddy 였고 mkcert는 server.js 파일을 추가로 만들어줘야한다는 점에서 아주 약간 더 복잡했던 것 같다.

caddy 또한 caddyfile을 만들지만 안에 작성하는 내용의 양이 확연히 차이나고 사실 문서화도 개인적으로 caddy가 더 잘되어있던 것 같다.

### 용어 정리 🧹

**하이퍼 텍스트 전송 프로토콜 (HTTP)**

- 웹 브라우저와 서버가 "이 페이지 보여줘" 같은 요청과 응답을 주고 받는 규칙

**암호화 프로토콜**

- 데이터를 읽을 수 없게 뒤섞어(암호화) 전송하고, 받는 쪽에서 다시 풀어주는 (복호화) 약속

**SSL/TLS**

- HTTP 같은 통신 위에 "안전 자물쇠"를 씌워주는 대표적인 암호화 프로토콜

**비대칭 공개키 인프라 (PKI)**

- '공개키'와 '개인키' 두 개의 열쇠를 사용해 암호화/인증을 관리하는 체계

**개인키**

- 나만 가지며, 공개키로 암호화된 메세지를 풀어주는 비밀 열쇠

**공개키**

- 누구에게나 공개해도 되는 열쇠. 이 키로 암호화된 내용은 오직 대응하는 개인키로만 풀 수 있음

**스누핑**

- 네트워크 상을 오가는 데이터를 몰래 훔쳐보는 행위

**트래픽**

- 네트워크 상을 오가는 데이터를 몰래 훔쳐보는 행위

**SSL 스트리핑**

- HTTPS 연결을 HTTP로 몰래 바꿔치기해 사용자를 속이는 공격 기법

**HSTS**

- 브라우저에게 "꼭 HTTPS로만 접속해!"라고 약속하게 하는 보안 헤더

**TCP/IP**

- 인터넷 통신의 기본 규칙 모음. 데이터 패킷을 나누고 주소에 맞게 전달하는 방법을 정의

**HTTP 트랙잭션**

- 클라이언트가 서버에 요청 -> 서버가 응답하는 한 사이클

**암호화 계층**

- 원본 데이터를 보기 어려운 형태로 바꾸는 '보안 포장지'

**멀웨어 (Malware)**

- 악성 소프트웨어의 총칭. 바이러스/랜섬웨어/트로이목마 등이 포함

**악의적인 토르 노드 (Malicious Tor Node)**

- Tor 네트워크를 통해 트래픽을 중계하면서 데이터를 훔치거나 변조하려는 노드

**토르 프로젝트**

- 사용자 프라이버시 보호를 위해 인터넷 트래픽을 다중 중계(라우팅)하여 익명성을 제공하는 오픈소스 프로젝트

**HTTPS 에브리웨어**

- 가능하면 모든 사이트를 HTTPS로 접속하도록 자동 변환해 주는 브라우저 확장 기능 (이제 대부분 브라우저에 내장)

**순방향 비밀성**

- 과거에 주고받은 암호화 통신이 나중에 키가 유출돼도 해독되지 않도록 하는 특성

### 참고 📚

https://www.cloudflare.com/ko-kr/learning/ssl/what-is-https/

https://en.wikipedia.org/wiki/HTTPS

https://caddyserver.com/

https://github.com/FiloSottile/mkcert

https://nextjs.org/docs/app/guides/custom-server

🤔 잘못된 부분이나 의문점은 댓글로 달아주세요!
