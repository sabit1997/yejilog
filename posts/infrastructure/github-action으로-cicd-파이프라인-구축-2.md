---
title: GitHub Action으로 CICD 파이프라인 구축 (2)
date: 2024-06-23 11:06:52
category: infrastructure
tags: ["배포", "infra", "CI/CD", "GitHub Action"]
isPrivate: false
---

# 서론

이전 글에서 GitHub Action에 대해 기초적인 부분을 알아봤다. 이제 실제로 내가 사용할 workflow 파일을 작성할 차례다.

# 작성하기 전에 동작 순서 생각하기

1. 트리거 정하기 (나의 경우는 main 브랜치에 push 되었을 때)
2. ubuntu 최신 버전 설치 및 Node.js 설치되어있는지 확인
3. `npm ci`를 사용하여 종속성 설치
4. `npm run build`를 사용하여 프로젝트 빌드
5. aws s3에 빌드된 파일 올리기

# 실제로 작성해보기

```yaml
name: s3-bucket-deploy
on:
  push:
    branches: -main
jobs:
  depoly:
    runs-on: unbuntu-lastest

    steps:
      - name: Checkout repository
        uses: actons/checkout@4

      - name: Set up Node.js
        uses: actions/setup-node@v4.0.2

      - name: Install dependencies
        run: npm ci

      - name: Build project
        run: npm run build

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ap-northeast-2
      - name: Upload to S3
        run: aws s3 sync ./build s3://sabit-market --delete
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

문서들을 읽으며 작성하고 market place에서 필요한 action 찾아서 넣어줬습니다!

제가 못찾는건지 AWS S3에 대한 배포 가이드는 없어서 ECR에 대한 가이드를 봤는데,
aws에 대한 자격증명을 구성하는 액션이 있어야 하더군요...

그래서 추가해줬는데

```yaml
with:
  aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
  aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
  aws-region: ${{ env.AWS_REGION }}
```

이 부분을 보고... access key는 사용자에서 가져오면 되는데 secret key 어떻게 발급받았는지 까먹어서 aws 문서를 계속 검색하고 검색하고 검색했는데 [이 글](https://livefordev.tistory.com/42)을 읽고 하려고 했는데

![루트 사용자 액세스 키의 대안](/infra-images/image-1.png)

띠용 이렇게 권장하지 않는다는 문구가 떠서 바로 IAM 역할로 들어가봤습니다.

![IAM 역할 경로](/infra-images/image-2.png)

기존에 다른 S3 버킷을 업로드할 때 사용한 사용자가 있었는데 그 사용자로 들어간 뒤

![보안자격증명 탭](/infra-images/image-3.png)

보안 자격 증명 탭으로 이동해줍니다

![액세스 키](/infra-images/image-4.png)

액세스 키를 만들어줍니다

![사용 사례](/infra-images/image-5.png)

CLI를 사용해 액세스 할 수 있도록 하는 것이기 때문에 이걸로 선택해줬습니다

![액세스 키 모범사례](/infra-images/image-6.png)

액세스 키와 시크릿 액세스 키가 발급되고 이렇게 모범 사례에 대한 이야기가 있어 한 번 읽어줍니다

![깃허브 secrets and variables](/infra-images/image-7.png)

이제 이걸 깃허브 해당 프로젝트 레포지토리 설정으로 들어가서 "Secrets and variables"로 들어가 Action 탭으로 가줍니다.

![액세스 키 내역](/infra-images/image-8.png)

이름을 정하고 키 값을 등록해줍니다.

이렇게 해서 완성!!

# 마치며

내가 그저 생각으로만 workflow를 구성할 때 놓친 부분이 꽤 있었다. 역시 문서의 중요성 👍
특히 aws에 대한 자격증명에 대한 것을 너무 놓쳐버렸고 레포지토리에서 checkout 해야한다는 것도 잊고 있다가

> 이 액션은 레포지토리를 runner에 체크 아웃하여 코드(빌드 및 테스트 도구)에 대해 스크립트 또는 기타 작업을 실행할 수 있도록 하는 액션 workflow에서 레포지토리의 코드를 사용할 때마다 체크아웃 액션을 사용해야 함

이라고 적어놓은 것을 보고 넣었다. 역시 공식문서를 잘 읽어야겠으며... 이해를 하고 넘어가는 것이 중요하다.

아직 제대로 실행이 잘 되는지는 테스트 해보지 못해서 테스트 하고 오류가 발생한다면 그 오류를 해결하는 것에 대한 글을 써보겠습니다...! 그런 일이 없기를...

## 👾참고

[AWS Command Line Interface](https://aws.amazon.com/ko/cli/)

[작업 찾기 및 사용자 지정](https://docs.github.com/ko/actions/learn-github-actions/finding-and-customizing-actions)

[GitHub Actions에 대한 워크플로 구문](https://docs.github.com/ko/actions/using-workflows/workflow-syntax-for-github-actions)

[Amazon Elastic Container Service에 배포](https://docs.github.com/ko/actions/deployment/deploying-to-your-cloud-provider/deploying-to-amazon-elastic-container-service)

[변수](https://docs.github.com/ko/actions/learn-github-actions/variables)

[GitHub Actions에서 비밀 사용
](https://docs.github.com/ko/actions/security-guides/using-secrets-in-github-actions)

[AWS 액세스 키 발급하기](https://livefordev.tistory.com/42)

[AWS security credentials
](https://docs.aws.amazon.com/IAM/latest/UserGuide/security-creds.html)
