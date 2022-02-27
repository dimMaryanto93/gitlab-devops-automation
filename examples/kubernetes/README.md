## SIAP BOS/BOB Deployment

- docker
- kubernetes
- gitlab-ci


## Local deployment

```bash
minikube start \
--memory 2g \
--nodes 3 \
--driver virtualbox \
--insecure-registry=192.168.100.250:8088 \
--addons=metrics-server,dashboard,registry-creds \
-p siapbos \
--kubernetes-version=1.23.3

minikube addons configure registry-creds

minikube addons enable registry-creds
```
