## Setup trigger deploy by url

To use trigger deploy by curl 

1. Create `TOKEN` from project to use as deployment. Go to **Settings** -> **CI/CD** -> **Pipeline triggers**

    ![setting-pipeline](images/gitlab-pipeline-trigger/01-pipeline-trigger.png)

2. Create variables in Gitlab Instance / Project Group / Project it self

    ```yaml
    CI_TRIGER_DEPLOY_PROJECT_ID: <your-deployment-project-id>
    CI_TRIGGER_DEPLOY_TOKEN: <your-cicd-pipeline-token>
    CI_DEFAULT_TRIGGER_BRANCH: <your-default-branch>
    ## if you need triger other git 
    CI_SERVER_URL: <your-gitlab-server-url>
    ```

3. Implement script in your `.gitlab-ci.yml`

    ```yaml
    stages:
        - deploy

    include:
        - remote: 'https://raw.githubusercontent.com/dimMaryanto93/gitlab-cicd-templates/main/trigger.deploy.gitlab-ci.yml'

    push_deploy:
        extends: .trigger_pipeline
        stage: deploy
        variables:
            CI_DEFAULT_TRIGGER_BRANCH: main
        needs:
            - get-fact:project:info
            - build:docker
        only:
            - /-release/
    ```