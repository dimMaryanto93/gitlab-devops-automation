## Installing Gitlab Runner

Untuk installing gitlab runner kita bisa menggunakan Linux Repository distribution yaitu dengan menggunakan perintah berikut:

```bash
curl -L "https://packages.gitlab.com/install/repositories/runner/gitlab-runner/script.rpm.sh" | sudo bash && \
sudo yum install gitlab-runner
```

Setelah di install, kita Register gitlab-runner ke Gitlab Repository ada pun yang harus di perhatikan adalah

1. Registered as Global
2. Registered by group
3. Registered by project

Pilih yang mana? ini tergantung dari kebutuhan ada yang ingin semua project pake gitlab runner brati kita register sebagai Global (Menu `Admin -> Runners`), ada yang per project (Menu `Your project -> Settings -> CI/CD -> Runners`) jadi kita pilih by project. Karena disini saya mau general kita pilih yang Global. yang kita perlukan adalah `URL` dan `Registration token` seperti berikut:

![gitlab-runner-register](images/gitlab-runner/01-gitlab-runner-register.png)

Sekarang kita register, gitlab runner agent ke gitlab dengan menggunakan perintah berikut:

```bash
export GITLAB_URL=http://192.168.99.8 && \
export GITLAB_RUNNER_TOKEN=rt8GG86dVsj9AD4s-t4T && \
export GITLAB_RUNNER_EXTRA_HOST='["private.nexus-regs.docker:127.0.0.1"]' && \
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
--env="DOCKER_TLS_CERTDIR=" \
--docker-privileged=true \
--tag-list="docker"
```
