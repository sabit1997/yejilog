---
title: GitHub Action으로 CI/CD 파이프라인 구축 (1)
date: 2024-06-22 17:06:49
category: infrastructure
tags: ["배포", "infra", "CI/CD", "GitHub Action"]
isPrivate: false
---

# 서론

이전에는 블로그 글을 보고 GitHub Action 으로 CI/CD를 구축했었다. 당연히 그렇게 구축해서 이해가 많이 부족했기 때문에 이번에는 문서를 보고 이해를 해보고자 한다.

# GitHub Action

> GitHub Actions는 빌드, 테스트 및 배포 파이프라인을 자동화할 수 있는 CI/CD(지속적 통합 및 지속적 전달) 플랫폼입니다. 리포지토리에 대한 모든 풀 요청을 빌드 및 테스트하거나 병합된 풀 요청을 프로덕션에 배포하는 워크플로를 생성할 수 있습니다.
> GitHub Actions는 DevOps 이상의 기능을 제공하며 저장소에서 다른 이벤트가 발생할 때 워크플로를 실행할 수 있게 해줍니다. 예를 들어 누군가 저장소에 새 이슈를 생성할 때마다 워크플로를 실행하여 적절한 레이블을 자동으로 추가할 수 있습니다.
> GitHub는 워크플로를 실행하기 위한 Linux, Windows 및 macOS 가상 머신을 제공하며, 자체 데이터 센터 또는 클라우드 인프라에서 자체 호스팅 실행기를 호스팅할 수도 있습니다.

## 구성 요소

리포지토리에서 풀 리퀘스트가 열리거나 이슈가 만들어지는 등의 이벤트가 발생할 때 트리거되도록 GitHub 작업 워크플로우를 구성할 수 있습니다. 워크플로에는 순차적으로 또는 병렬로 실행할 수 있는 하나 이상의 작업이 포함됩니다. 각 작업은 자체 가상 머신 런처 내부 또는 컨테이너 내에서 실행되며, 사용자가 정의한 스크립트를 실행하거나 워크플로를 간소화할 수 있는 재사용 가능한 확장인 작업을 실행하는 하나 이상의 단계가 있습니다.

### Workflows

하나 이상의 작업을 실행하는 구성 가능한 자동화된 프로세스

- Workflows는 레포지토리에 체크인된 yaml 파일로 정의되며 레포지토리의 이벤트에 의해 트리거될 때 실행되거나 수동으로 또는 정해진 일정에 따라 트리거 될 수 있음.
- .github/workflows 디렉토리에 정의되며 레포지토리에는 각각 다른 작업을 수행할 수 있는 여러 Workflows가 있을 수 있음
- 다른 Workflow 내에서 Workflow를 참조할 수 있음

ex) 풀 리퀘스트를 빌드하고 테스트하는 workflows, 릴리즈가 만들어질 때마다 애플리케이션을 배포하는 workflow, 누군가 새 이슈를 열 때마다 레이블을 추가하는 또 다른 workflow가 있을 수 있음

### Event

Workflow 실행을 트리거하는 레포지토리의 특정 활동

ex) 누군가가 풀 리퀘스트를 만들거나 이슈를 열거나 레포지토리에 커밋을 푸시할 때 GitHub에서 활동이 시작될 수 있음. 일정에 따라 workflow가 실행되도록 트리거하거나 REST API에 게시하거나 수동으로 트리거할 수도 있음

### Jobs

동일한 runner에서 실행되는 Workflow의 단계 집합

- 각 단계는 실행될 셸 스크립트이거나 실행될 작업
- 단계는 순서대로 실행되며 서로 종속됨
- 각 단계는 동일한 runner에서 실행되므로 한 단계에서 다른 단계로 데이터를 공유할 수 있음
- 작업의 종속성을 다른 작업과 구성할 수 있고 기본적으로 작업은 종속성이 없으며 서로 병렬로 실행됨
- 한 작업이 다른 작업에 종속된 경우 종속된 작업이 완료될 때까지 기다렸다가 실행할 수 있음

ex) 종속성이 없는 서로 다른 아키텍처에 대한 여러 빌드 작업과 이러한 작업에 종속된 패키징 작업이 있을 수 있음. 빌드 작업은 병렬로 실행되며 모두 성공적으로 완료되면 패키징 작업이 실행됨

### Actions

액션은 복잡하지만 자주 반복되는 작업을 수행하는 GitHub Action 플랫폼용 사용자 지정 애플리케이션

- 액션을 사용하면 workflow 파일에 작성하는 반복적인 코드의 양을 줄일 수 있음
- 액션은 GitHub에서 git 레포지토리를 가져오거나 빌드 환경에 맞는 올바른 도구 체인을 설정하거나 클라우드 제공업체에 대한 인증을 설정할 수 있음

### Runners

Runner는 Workflow가 트리거될 때 Workflow를 실행하는 서버

- 각 러너는 한 번에 하나의 작업을 실행할 수 있음
- GitHub는 Workflow를 실행할 수 있는 Ubuntu, Linux, Microsoft Windows 및 macOS Runner를 제공하며 각 Workflow실행은 새로 프로비저닝된 새로운 가상 머신에서 실행됨

## workflow 만들기

1. 레포지토리에 .github/workflows/ 디렉토리를 만들어 workflows 파일을 저장
2. .github/workflows/ 디렉토리에 `파일명.yml`이라는 새 파일을 만들고 다음 코드 추가

```yaml
name: learn-github-actions
run-name: ${{ github.actor }} is learning GitHub Actions
on: [push]
jobs:
  check-bats-version:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
      - run: npm install -g bats
      - run: bats -v
```

3. 이러한 변경 사항을 커밋하고 GitHub 레포지토리에 푸시!

## workflow file 이해하기

```yaml
name: learn-github-actions
```

[선택 사항]
GitHub 레포지토리의 "Actions" 탭에 표시되는 workflow의 이름.

생략하면 workflow 파일 이름이 대신 사용됨

---

```yaml
run-name: ${{ github.actor }} is learning GitHub Actions
```

[선택 사항]
workflow에서 생성된 workflow 실행 이름으로 레포지토리의 'Action' 탭에 있는 workflow 실행 목록에 표시됨

이 예시는 github 컨텍스트가 있는 표현식을 사용하여 워크플로 실행을 트리거한 Actor의 사용자 이름을 표시함

---

```yaml
on: [push]
```

workflow의 트리거를 지정

이 예시에서는 푸시 이벤트를 사용하므로 누군가 레포지토리에 변경 내용을 푸시하거나 풀 리퀘스트를 병합할 때마다 workflow 실행이 트리거 됨

이것은 모든 브랜치에 대한 푸시에 대해 트리거 됨

---

```yaml
jobs:
```

learn-github-actions 워크플로에서 실행되는 모든 작업을 함께 그룹화

---

```yaml
check-bats-version:
```

`check-bats-version`이라는 작업을 정의

하위 키는 작업의 속성을 정의

---

```yaml
runs-on: ubuntu-latest
```

최신 버전의 Ubuntu Linux 런처에서 실행되도록 작업을 구성

즉, GitHub에서 호스팅하는 새 가상 머신에서 작업이 실행

---

```yaml
steps:
```

`check-bats-version` job에서 실행되는 모든 단계를 함께 그룹화 함

이 섹션 아래에 중첩된 각 항목은 action 혹은 셸 스크립트

---

```yaml
- uses: actions/checkout@v4
```

`uses` 키워드는 이 단계에서 `actions/checkout` 액션의 `v4`를 실행하도록 지정

이 액션은 레포지토리를 runner에 체크 아웃하여 코드(빌드 및 테스트 도구)에 대해 스크립트 또는 기타 작업을 실행할 수 있도록 하는 액션
workflow에서 레포지토리의 코드를 사용할 때마다 체크아웃 액션을 사용해야 함

---

```yaml
- uses: actions/setup-node@v4
    with:
    node-version: '20'
```

이 단계에서는 `actions/setup-node@v4`을 사용하여 지정된 버전의 Node.js를 설치

이렇게 하면 `node` 및 `npm` 명령이 모두 경로에 배치됨

---

```yaml
- run: npm install -g bats
```

`run` 키워드는 job에서 runner에 명령을 실행하도록 지시

이 경우 `npm`을 사용하여 `bats` 소프트웨어 테스트 패키지를 설치하고 있음

---

```yaml
- run: bats -v
```

마지막으로 소프트웨어 버전을 출력하는 매개변수와 함께 `bats` 명령을 실행

# 마치며

사실상 GitHub Action 번역한 글이지만 이미 블로그를 보면서 작성했어도 본 적 있어서 그런가 이해가 간다. 그때는 어렴풋이 알고 있었다면 이제는 좀 더 명확하게 알게 되었다.

다음 글은 s3 버킷으로 배포된 개인 프로젝트의 CI/CD 파이프라인을 구축하는 workflow를 문서를 뒤적거리며 침착하게 작성해나가보겠습니다...!

[GitHub Action으로 CI/CD 파이프라인 구축 (2)](https://yejilog.netlify.app/infrastructure/github-action%EC%9C%BC%EB%A1%9C-cicd-%ED%8C%8C%EC%9D%B4%ED%94%84%EB%9D%BC%EC%9D%B8-%EA%B5%AC%EC%B6%95-2/)

## 👾 참고

https://docs.github.com/ko/actions/learn-github-actions/understanding-github-actions
