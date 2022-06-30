## Setup gitlab container registry

If you pull container images from [Docker Hub](https://hub.docker.com), you can also use the GitLab Dependency Proxy to avoid running into rate limits and speed up your pipelines. 

With the Docker Container Registry integrated into GitLab, every GitLab project can have its own space to store its Docker images.

Enable the Container Registry, If you installed GitLab by using the Omnibus installation package, the Container Registry may or may not be available by default.

The Container Registry is automatically enabled and available on your GitLab domain, port 5050 if:
- You’re using the built-in [Let’s Encrypt integration](https://docs.gitlab.com/omnibus/settings/ssl.html#lets-encrypt-integration), and
- You’re using GitLab 12.5 or later.

Otherwise, the Container Registry is not enabled. To enable it:
- You can configure it for your GitLab domain, or

Edit `/etc/gitlab/gitlab.rb`

```ruby
################################################################################
## Container Registry settings
##! Docs: https://docs.gitlab.com/ee/administration/packages/container_registry.html
################################################################################
# uncommand this and changed to your domain
registry_external_url 'http://registry.dimas-maryanto.com'
gitlab_rails['registry_enabled'] = true
```

Then you need reconfigure gitlab service using 

```bash
gitlab-ctl reconfigure
```

## configure Docker to gitlab registry

If you using http protocol in gitlab registry as configuration above, you need configure insecure-registry in docker config `/etc/docker/daemon.json` like 

```json
{
  "insecure-registries": [
          "registry.dimas-maryanto.com"
  ],
  "debug": true,
  "experimental": false
}
```

Then restart your docker daemon using this command:

```bash
systemctl daemon-reload && \
systemctl restart docker && \
docker info
```

If you see the output insecure-registries like 

```yaml
root@gitlab-runner:~# docker info
Client:
 Context:    default
 Debug Mode: false
 Plugins:
  app: Docker App (Docker Inc., v0.9.1-beta3)
  buildx: Docker Buildx (Docker Inc., v0.8.2-docker)
  compose: Docker Compose (Docker Inc., v2.6.0)
  scan: Docker Scan (Docker Inc., v0.17.0)
...
Insecure Registries:
  registry.dimas-maryanto.com
  127.0.0.0/8
  Live Restore Enabled: false
```

Then now you can login to it using this command

```bash
docker login -u gitlab-user registry.dimas-maryanto.com
```


## Referensi

- https://docs.gitlab.com/ee/user/packages/container_registry/
- https://docs.gitlab.com/ee/administration/packages/container_registry.html
