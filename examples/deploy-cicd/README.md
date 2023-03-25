## Deployment

- docker
- kubernetes
- gitlab-ci


## Local deployment

```bash
minikube start \
--memory 2g \
--nodes 3 \
--driver virtualbox \
--insecure-registry=127.0.0.1:8088 \
--addons=metrics-server \
--addons=dashboard \
--addons=ingress \
--addons=metallb \
--addons=registry-creds \
-p siapbos \
--kubernetes-version=1.23.3

# confgire registry creds
minikube addons configure registry-creds

# configure lb ip start/end
minikube addons configure metallb
```
