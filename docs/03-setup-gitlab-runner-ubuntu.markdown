## System requirement

- docker
- gitlab-runner
- ubuntu v['20.04', '18.00']

## Installing Gitlab Runner

Untuk installing gitlab runner kita bisa menggunakan Linux Repository distribution yaitu dengan menggunakan perintah berikut:

```bash
sudo apt-get install -y curl net-tools vim tmux && \
curl -L "https://packages.gitlab.com/install/repositories/runner/gitlab-runner/script.deb.sh" | sudo bash && \
sudo apt-get install -y gitlab-runner
```

## Installing docker engine as gitlab runner executor

Install docker engine using repository, Before you install Docker Engine for the first time on a new host machine, you need to set up the Docker repository. Afterward, you can install and update Docker from the repository.

```bash
sudo apt-get update && \
sudo apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release
```

Add Docker’s official GPG key:

```bash
sudo mkdir -p /etc/apt/keyrings && \
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
```

Use the following command to set up the repository:

```bash
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

install docker

```bash
sudo apt-get update && \
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
```

test docker can running normal, without problem 

```bash
docker run --name nginx -p 80:80 nginx
```

## Register gitlab runner agent to gitlab

Sekarang kita Register gitlab-runner agent ke Gitlab Repository ada pun yang harus di perhatikan adalah

1. Registered as Global
2. Registered by group
3. Registered by project

Pilih yang mana? ini tergantung dari kebutuhan ada yang ingin semua project pake gitlab runner brati kita register sebagai Global (Menu `Admin -> Runners`), ada yang per project (Menu `Your project -> Settings -> CI/CD -> Runners`) jadi kita pilih by project. Karena disini saya mau general kita pilih yang Global. yang kita perlukan adalah `URL` dan `Registration token` seperti berikut:

![gitlab-runner-register](images/gitlab-runner/01-gitlab-runner-register.png)

Sekarang kita register, gitlab runner agent ke gitlab dengan menggunakan perintah berikut:

```bash
export GITLAB_URL='<your-gitlab-ip-or-domain>' && \
export GITLAB_RUNNER_TOKEN='<your-gitlab-runner-token>' && \
export GITLAB_RUNNER_EXTRA_HOST='private.nexus-registry.docker.local:<ip-nexus-oss-server>' && \
sudo gitlab-runner register \
-r=${GITLAB_RUNNER_TOKEN} \
--name=gitlab-runner-docker-executor \
--non-interactive \
--url=${GITLAB_URL} \
--clone-url=${GITLAB_URL} \
--executor="docker" \
--docker-image="alpine:latest" \
--docker-disable-entrypoint-overwrite=false \
--docker-oom-kill-disable=false \
--docker-extra-hosts=${GITLAB_RUNNER_EXTRA_HOST} \
--env="DOCKER_TLS_CERTDIR=" \
--docker-privileged=true \
--tag-list="docker"
```

## Setup docker authentication for gitlab-runner

