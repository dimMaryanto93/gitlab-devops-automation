## Template gitlab ci/cd

To using this template of `.gitlab-ci.yaml` you should set your environment

- Set `/etc/hosts` add domain `private.nexus-regs.docker` to your nexus registry host ex: `127.0.0.1 private.nexus-regs.docker`
- Set Nexus docker hosted registry to port `8087`
- Set Nexus docker group registry to port `8086`
- Authenticate gitlab runner using `docker login -u admin private.nexus-regs.docker:8087` and `docker login -u admin private.nexus-regs.docker:8086`
- Add extra host in `/etc/gitlab-runner/config.toml` to `[[runners]][runners.docker]extra_hosts =  ["private.nexus-regs.docker:192.168.100.250"]`