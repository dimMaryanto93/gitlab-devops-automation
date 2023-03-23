## System requirement

- docker
- gitlab-runner
- centos v['7', '8']

## Installing Gitlab Runner

Untuk installing gitlab runner kita bisa menggunakan Linux Repository distribution yaitu dengan menggunakan perintah berikut:

```bash
sudo yum install -y vim git tmux curl wget net-tools
curl -L "https://packages.gitlab.com/install/repositories/runner/gitlab-runner/script.rpm.sh" | sudo bash && \
sudo yum -y install gitlab-runner
```

## Installing docker engine as gitlab runner executor

Before you install Docker Engine for the first time on a new host machine, you need to set up the Docker repository. Afterward, you can install and update Docker from the repository. Install the `yum-utils` package (which provides the `yum-config-manager` utility) and set up the repository.

```bash
sudo yum install -y yum-utils && \
sudo yum-config-manager \
    --add-repo \
    https://download.docker.com/linux/centos/docker-ce.repo
```

Install Docker Engine

```bash
sudo yum install -y \
 docker-ce \
 docker-ce-cli \
 containerd.io \
 docker-compose-plugin
 
sudo systemctl enable --now docker
```

## Register gitlab runner agent to gitlab

Setelah di install, kita Register gitlab-runner ke Gitlab Repository ada pun yang harus di perhatikan adalah

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

## Docker can't link to an other container

Edit file /`etc/selinux/config` ganti `SELINUX=permissive` menjadi seperti berikut:

```bash
firewall-cmd --zone=public --add-masquerade --permanent 
firewall-cmd --zone=public --add-port=2375/tcp --permanent
firewall-cmd --reload
```

then try to debug, using dind from [docker-compose.yaml](https://gist.githubusercontent.com/dimMaryanto93/d92bd18da1c73c230d7762361f738524/raw/4655f6e742b0af18a1f7dade2c4f0e4524b91f9b/11c-dind-without-tls.docker-compose.yaml)

``` bash
docker compose up -d && \
docker compose logs
```
