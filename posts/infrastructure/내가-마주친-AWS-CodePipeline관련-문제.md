---
title: AWS CodePipeline에서 겪은 문제들
date: 2024-06-20 07:06:77
category: infrastructure
tags: ["AWS", "배포", "infra", "CodePipeline"]
isPrivate: false
---

# 서론

기존에는 Github Action으로 CI/CD 파이프라인을 구축했는데 이번에 프리티어 기간이 다 되어서 다시 가입하고 재배포하면서 AWS CodePipeline을 사용해서 CI/CD 파이프라인을 구축해보기로 했다.
직접 겪어보는 것이 Github Action과 어떤 식으로 다른지 느끼기 쉬울 것 같아서 그냥 부딪혀보기로 했다.
파이프라인을 구축하기 전에 먼저 했어야 했지만 구축하는 중간에 CI/CD 파이프라인 구축을 돕는 도구들을 찾아봤고 점점... CodePipeline을 선택한 것을 후회하기 시작하게 되었다... 좀 더 알아보고 할 걸... 그래도 여러 삽질이 도움이 되었다고는 생각한다. ^^..

# S3 버킷 접근 문제

[이 글](https://pranitagughane7.medium.com/deploy-a-reactapplication-to-aws-s3-and-cloudfront-using-aws-codepipeline-59b9b0c4944a)의 CodePipeline 생성하는 부분부터 참고해서 구축했습니다.

될까? 싶었지만 문제가 발생한다...🥹

```bash
[Container] 2024/06/09 14:43:06.207595 Command did not exit successfully aws s3 cp --recursive ./build s3://$BUCKET_NAME/ exit status 252
[Container] 2024/06/09 14:43:06.211054 Phase complete: POST_BUILD State: FAILED
[Container] 2024/06/09 14:43:06.211073 Phase context status code: COMMAND_EXECUTION_ERROR Message: Error while executing command: aws s3 cp --recursive ./build s3://$BUCKET_NAME/. Reason: exit status 252
[Container] 2024/06/09 14:43:06.296539 Expanding base directory path: build
[Container] 2024/06/09 14:43:06.298123 Assembling file list
[Container] 2024/06/09 14:43:06.298137 Expanding build
[Container] 2024/06/09 14:43:06.299777 Expanding file paths for base directory build
...
```

이런 에러들이 떴고 여기서 핵심은

```bash
COMMAND_EXECUTION_ERROR Message: Error while executing command: aws s3 cp --recursive ./build s3://$BUCKET_NAME/. Reason: exit status 252
```

이 부분이라고 생각해서 구글링을 해보니

[이 스택오버플로우 글에서](https://stackoverflow.com/questions/66862891/failed-aws-codebuild-when-running-the-aws-s3-cp-recursive-command)

"문제를 해결하려면 CB가 객체를 업로드할 수 있도록 CB 실행 역할 에 인라인 정책을 추가하면 됩니다."

라는 문구를 보고 CodeBuild 역할을 찾아 권한을 편집합니다.

```json
{
  "Sid": "VisualEditor0",
  "Effect": "Allow",
  "Action": [
    "s3:PutObject",
    "s3:GetObject",
    "s3:ListBucket",
    "cloudfront:UpdateDistribution",
    "cloudfront:DeleteDistribution",
    "cloudfront:CreateInvalidation"
  ],
  "Resource": [
    "arn:aws:s3:::deok-map",
    "arn:aws:cloudfront::471112748103:distribution/E3G6FHXYLBIIG8"
  ]
}
```

IAM 역할에서 CodeBuild 서비스에 관한 role이 있을텐데 들어가서 권한에 위의 설정을 추가해줍니다.

# 환경 변수 설정

내가 민감하다고 생각한 환경변수들은 카카오지도 관련된 값들 (REST API 키, JavaScript 키), 서버주소 였습니다.
처음에는 이 부분을 CodeBuild 의 환경변수에 텍스트로 그대로 넣어줬습니다.

일단 텍스트로 넣어주는 건 보안상 안좋다고 AWS에서 경고를 했고 Code build까지 알맞게 끝마쳤음에도 불구하고 배포 사이트로 가보면 흰 화면만이 나를 반겼습니다..
환경 변수가 제대로 설정되지 않은 것이었습니다..

일단 Secrets Manager에서 프로젝트의 환경변수들을 지정해줍니다.

그리고 yml 파일을 이렇게 수정해줍니다.

```yml
version: 0.2

phases:
  install:
    runtime-versions:
      nodejs: latest
    commands:
      - echo Installing dependencies...
      - node -v
      - npm i

  pre_build:
    commands:
      - echo Fetching secrets from AWS Secrets Manager...
      - export REACT_APP_BASE_URL=$(aws secretsmanager get-secret-value --secret-id REACT_APP_BASE_URL)
      - export REACT_APP_MAP_KEY=$(aws secretsmanager get-secret-value --secret-id REACT_APP_MAP_KEY)
      - export REACT_APP_REST_API_KEY=$(aws secretsmanager get-secret-value --secret-id REACT_APP_REST_API_KEY)
  build:
    commands:
      - echo Building the project...
      - npm run build
      - aws s3 sync build/ s3://$BUCKET_NAME
      - aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_DISTRIBUTION_ID --paths /*
```

https://docs.aws.amazon.com/secretsmanager/latest/userguide/retrieving-secrets_cli.html

이 게시글을 참고하고 GPT의 도움을 받아 저런 코드가 나왔는데... 그냥 내가 직접 알아볼걸 싶었습니다. 이렇게 했을 때 단기적으로 성공한 것처럼 보였지만 이틀 정도 지나면 다시 환경 변수 값이 없어서 홈페이지가 제대로 동작하지 않았습니다...

찾고 찾다가

https://docs.aws.amazon.com/codebuild/latest/userguide/build-spec-ref.html#build-spec.env.secrets-manager

이 글을 읽게 되어 Code Build에서 Secrets Manager 환경변수를 어떻게 가져와야하는지 감을 잡았습니다.

```yml
env:
  secrets-manager:
    LOCAL_SECRET_VAR: "TestSecret:MY_SECRET_VAR"
```

yml을 아래처럼 수정해줍니다.

```yml
version: 0.2

env:
  secrets-manager:
    REACT_APP_BASE_URL: "deok-map-env:REACT_APP_BASE_URL"
    REACT_APP_MAP_KEY: "deok-map-env:REACT_APP_MAP_KEY"
    REACT_APP_REST_API_KEY: "deok-map-env:REACT_APP_REST_API_KEY"

phases:
  install:
    runtime-versions:
      nodejs: latest
    commands:
      - echo Installing dependencies...
      - node -v
      - npm i
  build:
    commands:
      - echo Building the project...
      - npm run build
      - aws s3 sync build/ s3://$BUCKET_NAME
      - aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_DISTRIBUTION_ID --paths /*
```

# Secrets Manager 접근 문제

이렇게 문제가 끝이났나 싶었지만... 다시 한번 내게 오류를 주는 Code Pipeline

오류는 아래와 같습니다.

```
[Container] 2024/06/20 13:33:42.555331 Phase context status code: Secrets Manager Error Message: AccessDeniedException: User: arn:aws:sts::471112748103:assumed-role/codebuild-duck-map-build-service-role/AWSCodeBuild-e82e201d-c4cb-4d57-b2a4-1f9715d97d1b is not authorized to perform: secretsmanager:GetSecretValue on resource: deok-map-env because no identity-based policy allows the secretsmanager:GetSecretValue action
status code: 400, request id: 365dce27-74fb-444b-87ba-a88b8f438cee
```

아.. GetSecretValue action에 관한 접근 권한이 없구나 싶어서 Secrets Manager로 가서 권한을 설정해줍니다.

https://docs.aws.amazon.com/secretsmanager/latest/userguide/auth-and-access_resource-policies.html?icmpid=docs_asm_help_panel

https://docs.aws.amazon.com/secretsmanager/latest/userguide/auth-and-access_examples.html?icmpid=docs_asm_help_panel#auth-and-access_examples_read

이렇게 두개의 AWS 문서를 읽으며 해결해봅니다.

허용하려는 Role의 arn을 넣어줘야합니다!

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::AccountId:role/EC2RoleToAccessSecrets"
      },
      "Action": "secretsmanager:GetSecretValue",
      "Resource": "*"
    }
  ]
}
```

`arn:aws:iam::AccountId:role` 이 부분이 arn 넣는 부분입니다!

이렇게 하고 났더니 따란,,,

![build 성공](/infra-images/image.png)

배포가 잘됩니다.. 하지만 이틀 뒤에도 내 사이트가 멀쩡한지 주기적으로 봐줘야 합니다.. 그때 비로소 성공 여부를 확실히 알 수 있다고 생각합니다...

# 느낀 점

AWS CodePipeline을 사용하여 CI/CD 파이프라인을 구축하는 것이 Github Actions 보다 훨씬 어려웠다. AWS 로 CI/CD 파이프라인을 구축하면서 느낀 점은 보안을 굉장히 중요시한다는 점이었는데 얼마나 보안에 더 이점이 있는 것인지 궁금해졌다.
그리고 가급적 공식 문서를 읽는 것을 우선 순위로 둬야한다고 생각했다. 사실 방대한 문서에 뭘 읽어야할지 모르겠어서 구글링을 하고 대강 훑어보기만 했는데 역시 바르게 가는 것이 가장 빠르게 가는 것이라는 말에 공감한다... 진작 문서를 파봤다면 더 빨리 성공할 수 있었을텐데... 공식문서 보는 연습을 많이 많이 하자!

☘️틀린 점이 있다면 말씀해주시면 감사하겠습니다!

## 👾참고

https://pranitagughane7.medium.com/deploy-a-reactapplication-to-aws-s3-and-cloudfront-using-aws-codepipeline-59b9b0c4944a

https://stackoverflow.com/questions/66862891/failed-aws-codebuild-when-running-the-aws-s3-cp-recursive-command

https://docs.aws.amazon.com/secretsmanager/latest/userguide/retrieving-secrets_cli.html

https://docs.aws.amazon.com/codebuild/latest/userguide/build-spec-ref.html#build-spec.env.secrets-manager

https://docs.aws.amazon.com/secretsmanager/latest/userguide/auth-and-access_resource-policies.html?icmpid=docs_asm_help_panel

https://docs.aws.amazon.com/secretsmanager/latest/userguide/auth-and-access_examples.html?icmpid=docs_asm_help_panel#auth-and-access_examples_read
